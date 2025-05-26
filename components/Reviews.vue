<template>
	<div class="bg-white border border-gray-200 rounded-lg p-4">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-bold text-gray-800">Reviews & Ratings</h2>
			<div
				v-if="!isLoading && ratings.length > 0"
				class="flex items-center gap-2"
			>
				<div class="flex items-center">
					<Icon
						name="mingcute:star-fill"
						class="text-yellow-400 mr-1"
						size="16"
					/>
					<span class="font-semibold">{{
						averageRating.toFixed(1)
					}}</span>
				</div>
				<span class="text-gray-500 text-sm"
					>({{ ratings.length }}
					{{ ratings.length === 1 ? "review" : "reviews" }})</span
				>
			</div>
		</div>

		<!-- Loading state -->
		<div v-if="isLoading" class="space-y-4">
			<div v-for="i in 3" :key="i" class="animate-pulse">
				<div class="flex items-start gap-3">
					<div class="w-10 h-10 bg-gray-200 rounded-full"></div>
					<div class="flex-1 space-y-2">
						<div class="h-4 bg-gray-200 rounded w-1/4"></div>
						<div class="h-3 bg-gray-200 rounded w-1/6"></div>
						<div class="h-3 bg-gray-200 rounded w-full"></div>
						<div class="h-3 bg-gray-200 rounded w-3/4"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error state -->
		<div v-else-if="error" class="text-center py-8">
			<Icon
				name="mingcute:warning-fill"
				class="text-red-400 mx-auto mb-2"
				size="48"
			/>
			<p class="text-red-600 font-medium">Failed to load reviews</p>
			<button
				@click="fetchRatings"
				class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
			>
				Try again
			</button>
		</div>

		<!-- Empty state -->
		<div v-else-if="ratings.length === 0" class="text-center py-8">
			<Icon
				name="mingcute:star-line"
				class="text-gray-300 mx-auto mb-2"
				size="48"
			/>
			<p class="text-gray-500 font-medium">No reviews yet</p>
			<p class="text-gray-400 text-sm">Be the first to leave a review!</p>
		</div>

		<!-- Ratings list -->
		<div v-else class="space-y-4">
			<div
				v-for="rating in paginatedRatings"
				:key="rating.id"
				class="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
			>
				<div class="flex items-start gap-3">
					<!-- User avatar -->
					<div
						class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
					>
						<img
							v-if="rating.user_profile_pic"
							:src="rating.user_profile_pic"
							:alt="rating.user_username || 'User'"
							class="w-full h-full object-cover"
							@error="$event.target.style.display = 'none'"
						/>
						<div
							v-else
							class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm"
						>
							{{
								getInitials(rating.user_username || "Anonymous")
							}}
						</div>
					</div>

					<div class="flex-1 min-w-0">
						<!-- User name and rating -->
						<div class="flex items-center justify-between mb-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900 truncate">
									{{
										rating.user_username || "Anonymous User"
									}}
								</h3>
								<div class="flex items-center">
									<Icon
										v-for="star in 5"
										:key="star"
										name="mingcute:star-fill"
										:class="{
											'text-yellow-400':
												star <= rating.rating,
											'text-gray-300':
												star > rating.rating,
										}"
										size="14"
									/>
								</div>
							</div>
							<time
								class="text-xs text-gray-500 whitespace-nowrap"
							>
								{{ formatDate(rating.created_at) }}
							</time>
						</div>

						<!-- Review content -->
						<div
							v-if="rating.content && rating.content.trim()"
							class="text-gray-700 text-sm leading-relaxed"
						>
							<p class="whitespace-pre-wrap">
								{{ rating.content.trim() }}
							</p>
						</div>
						<div v-else class="text-gray-400 text-sm italic">
							No written review
						</div>
					</div>
				</div>
			</div>

			<!-- Load more button -->
			<div
				v-if="
					ratings.length > itemsPerPage &&
					paginatedRatings.length < ratings.length
				"
				class="text-center pt-4"
			>
				<button
					@click="loadMore"
					class="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
				>
					Load more reviews
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Rating {
	id: number;
	rating: number;
	content: string | null;
	created_at: string;
	user_username?: string;
	user_profile_pic?: string;
}

interface Props {
	locationId: number;
	itemsPerPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
	itemsPerPage: 5,
});

const supabase = useSupabaseClient();

const ratings = ref<Rating[]>([]);
const isLoading = ref(true);
const error = ref(false);
const currentPage = ref(1);

// Computed properties
const averageRating = computed(() => {
	if (ratings.value.length === 0) return 0;
	const sum = ratings.value.reduce((acc, rating) => acc + rating.rating, 0);
	return sum / ratings.value.length;
});

const paginatedRatings = computed(() => {
	const endIndex = currentPage.value * props.itemsPerPage;
	return ratings.value.slice(0, endIndex);
});

// Methods
const fetchRatings = async () => {
	try {
		isLoading.value = true;
		error.value = false;

		const { data, error: fetchError } = await supabase
			.from("location_ratings")
			.select(
				`
				id,
				rating,
				content,
				created_at, 
				user_id,
				users:user_id (
					username,
					profile_pic
				)
			`
			)
			.eq("location_id", props.locationId)
			.order("created_at", { ascending: false });

		if (fetchError) throw fetchError;

		// Transform data to include user info
		ratings.value = (data || []).map((item) => ({
			...item,
			user_username: item.users?.username || "Anonymous User",
			user_profile_pic: item.users?.profile_pic || null,
		}));
	} catch (err) {
		console.error("Error fetching ratings:", err);
		error.value = true;
	} finally {
		isLoading.value = false;
	}
};

const loadMore = () => {
	currentPage.value++;
};

const getInitials = (name: string) => {
	return name
		.split(" ")
		.map((word) => word.charAt(0))
		.join("")
		.toUpperCase()
		.substring(0, 2);
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInDays === 0) {
		return "Today";
	} else if (diffInDays === 1) {
		return "Yesterday";
	} else if (diffInDays < 7) {
		return `${diffInDays} days ago`;
	} else if (diffInDays < 30) {
		const weeks = Math.floor(diffInDays / 7);
		return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
	} else if (diffInDays < 365) {
		const months = Math.floor(diffInDays / 30);
		return `${months} ${months === 1 ? "month" : "months"} ago`;
	} else {
		return date.toLocaleDateString();
	}
};

// Watch for locationId changes
watch(
	() => props.locationId,
	() => {
		currentPage.value = 1;
		fetchRatings();
	},
	{ immediate: true }
);

// Lifecycle
onMounted(() => {
	fetchRatings();
});
</script>
