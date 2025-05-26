<template>
	<div class="p-4 bg-white border border-gray-200 rounded-lg">
		<div class="grid gap-4 place-items-center">
			<h1 class="font-bold text-xl">
				{{ hasExistingRating ? "Your Rating" : "Rate Location" }}
			</h1>
			<div class="flex items-center gap-4">
				<button
					v-for="star in 5"
					:key="star"
					@click="handleRating(star)"
					class="text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded cursor-pointer"
				>
					<Icon
						name="mingcute:star-fill"
						:class="{
							'text-yellow-400': star <= currentRating,
							'text-gray-300 hover:text-yellow-400':
								star > currentRating,
						}"
						size="32"
					/>
				</button>
			</div>
			<span
				v-if="showValue && currentRating > 0"
				class="text-gray-600 ml-2 mb-1 font-bold text-2xl"
			>
				{{ currentRating }}/5
			</span>

			<!-- Content textarea -->
			<div class="w-full">
				<label
					for="rating-content"
					class="block font-medium text-gray-700 mb-2"
				>
					{{ hasExistingRating ? "Your Review:" : "Leave review:" }}
				</label>
				<textarea
					id="rating-content"
					v-model="currentContent"
					placeholder="Share your thoughts about this location..."
					rows="3"
					class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
				></textarea>
				<div class="text-sm text-gray-500 mt-2">
					{{ currentContent.length }}/500 characters
				</div>
			</div>
			<div class="flex justify-end w-full">
				<button
					v-if="
						currentRating > 0 && (!hasExistingRating || hasChanges)
					"
					@click="submitRating"
					:disabled="isSaving"
					class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{{
						isSaving
							? "Submitting..."
							: hasExistingRating
							? "Update Rating"
							: "Submit Rating"
					}}
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	locationId: number;
	showValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showValue: true,
});

const supabase = useSupabaseClient<Rating>();
const { user } = useAuth();

const currentRating = ref(0);
const currentContent = ref("");
const hasExistingRating = ref(false);
const isSaving = ref(false);
const originalRating = ref(0);
const originalContent = ref("");

// Load existing user rating for this location
onMounted(async () => {
	if (user.value) {
		const { data } = await supabase
			.from("location_ratings")
			.select("rating, content")
			.eq("location_id", props.locationId)
			.eq("user_id", user.value.id)
			.single();

		if (data) {
			currentRating.value = data.rating;
			currentContent.value = data.content || "";
			originalRating.value = data.rating;
			originalContent.value = data.content || "";
			hasExistingRating.value = true;
		}
	}
});

// Computed property to check if there are changes
const hasChanges = computed(() => {
	return (
		currentRating.value !== originalRating.value ||
		currentContent.value !== originalContent.value
	);
});

const handleRating = (rating: number) => {
	if (!user.value) {
		navigateTo("/login");
		return;
	}

	currentRating.value = rating;
};

const submitRating = async () => {
	if (!user.value || isSaving.value || currentRating.value === 0) return;

	// Limit content length
	if (currentContent.value.length > 500) {
		currentContent.value = currentContent.value.substring(0, 500);
	}

	isSaving.value = true;

	try {
		// Check if user already rated this location
		const { data: existingRating } = await supabase
			.from("location_ratings")
			.select("id")
			.eq("location_id", props.locationId)
			.eq("user_id", user.value.id)
			.single();

		if (existingRating) {
			// Update existing rating
			await supabase
				.from("location_ratings")
				.update({
					rating: currentRating.value,
					content: currentContent.value.trim() || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", existingRating.id);
		} else {
			// Create new rating
			await supabase.from("location_ratings").insert({
				rating: currentRating.value,
				content: currentContent.value.trim() || null,
				location_id: props.locationId,
				user_id: user.value.id,
			});

			hasExistingRating.value = true;
		}

		// Update original values after successful save
		originalRating.value = currentRating.value;
		originalContent.value = currentContent.value;

		// Optionally show success message or emit event
		console.log("Rating submitted successfully!");
	} catch (error) {
		console.error("Error saving rating:", error);
		// Optionally show error message to user
	} finally {
		isSaving.value = false;
	}
};
</script>
