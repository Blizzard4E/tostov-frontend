<template>
	<div class="grid gap-4">
		<!-- Search Input with Tag Selection -->
		<div class="relative">
			<label for="" class="absolute top-3 left-4 pointer-events-none">
				<Icon
					name="mingcute:search-2-fill"
					class="text-muted"
					:size="26"
			/></label>
			<div
				class="flex flex-wrap gap-2 px-4 py-3 border rounded-lg bg-white items-center pl-12"
			>
				<!-- Selected Tags -->
				<div
					v-for="tag in selectedTags"
					:key="tag.id"
					class="flex items-center gap-2 px-2 py-1 text-primary-foreground bg-primary rounded-full text-sm"
				>
					<div>#{{ tag.name }}</div>
					<button
						@click="removeTag(tag.id)"
						class="rounded-full transition-colors"
						title="Remove tag"
					>
						<Icon
							name="mingcute:close-fill"
							class="text-white"
							size="12"
						/>
					</button>
				</div>

				<!-- Search Input -->
				<input
					v-model="searchInput"
					@input="onSearchInput"
					@keydown="onKeyDown"
					placeholder="Type #tagname to search and select tags... "
					class="flex-1 outline-none min-w-[200px]"
				/>
			</div>

			<!-- Tag Suggestions Dropdown -->
			<div
				v-if="showSuggestions && tagSuggestions.length > 0"
				class="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
			>
				<div
					v-for="(suggestion, index) in tagSuggestions"
					:key="suggestion.id"
					@click="selectTag(suggestion)"
					:class="[
						'px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2',
						{ 'bg-blue-50': index === selectedSuggestionIndex },
					]"
				>
					<span class="text-primary">#</span>
					<span>{{ suggestion.name }}</span>
				</div>
			</div>
		</div>

		<!-- Results -->
		<div v-if="selectedTags.length > 0" class="text-sm text-gray-600">
			Searching for locations with tags:
			<span v-for="(tag, index) in selectedTags" :key="tag.id">
				<strong>#{{ tag.name }}</strong
				><span v-if="index < selectedTags.length - 1">, </span>
			</span>
		</div>

		<LocationList v-if="locations" :locations="locations" />
	</div>
</template>

<script lang="ts" setup>
import type { Location } from "#imports";

interface Tag {
	id: string;
	name: string;
}

const supabase = useSupabaseClient();
const { user, clearUser } = useAuth();
const route = useRoute();

// Search and tag selection state
const searchInput = ref("");
const selectedTags = ref<Tag[]>([]);
const tagSuggestions = ref<Tag[]>([]);
const showSuggestions = ref(false);
const selectedSuggestionIndex = ref(-1);
const searchTimeout = ref<NodeJS.Timeout | null>(null);

// Get selected tag IDs for database query
const selectedTagIds = computed(() => selectedTags.value.map((tag) => tag.id));

// Auto-add tag from query parameter
const loadTagFromQuery = async () => {
	const tagName = route.query.tag as string;

	if (tagName && selectedTags.value.length === 0) {
		// Search for the tag by name
		const { data, error } = await supabase
			.from("tags")
			.select("id, name")
			.ilike("name", tagName)
			.limit(1);

		if (error) {
			console.error("Error loading tag from query:", error);
			return;
		}

		// If tag exists, add it to selected tags
		if (data && data.length > 0) {
			selectedTags.value.push(data[0]);
		}
	}
};

// Search for tag suggestions
const searchTags = async (query: string) => {
	if (!query || query.length < 2) {
		tagSuggestions.value = [];
		showSuggestions.value = false;
		return;
	}

	let tagQuery = supabase
		.from("tags")
		.select("id, name")
		.ilike("name", `%${query}%`);

	// Only add the exclusion filter if there are selected tags
	if (selectedTagIds.value.length > 0) {
		tagQuery = tagQuery.not(
			"id",
			"in",
			`(${selectedTagIds.value.map((id) => `"${id}"`).join(",")})`
		);
	}

	const { data, error } = await tagQuery.limit(10);

	if (error) {
		console.error("Error searching tags:", error);
		return;
	}

	tagSuggestions.value = data || [];
	showSuggestions.value = true;
	selectedSuggestionIndex.value = -1;
};

// Handle search input
const onSearchInput = () => {
	const value = searchInput.value;

	// Clear existing timeout
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}

	// Check if user typed # to trigger tag search
	if (value.startsWith("#")) {
		const query = value.slice(1); // Remove the # symbol

		// Debounce the search
		searchTimeout.value = setTimeout(() => {
			searchTags(query);
		}, 300);
	} else {
		showSuggestions.value = false;
		tagSuggestions.value = [];
	}
};

// Handle keyboard navigation
const onKeyDown = (event: KeyboardEvent) => {
	if (!showSuggestions.value || tagSuggestions.value.length === 0) return;

	switch (event.key) {
		case "ArrowDown":
			event.preventDefault();
			selectedSuggestionIndex.value = Math.min(
				selectedSuggestionIndex.value + 1,
				tagSuggestions.value.length - 1
			);
			break;
		case "ArrowUp":
			event.preventDefault();
			selectedSuggestionIndex.value = Math.max(
				selectedSuggestionIndex.value - 1,
				-1
			);
			break;
		case "Enter":
			event.preventDefault();
			if (selectedSuggestionIndex.value >= 0) {
				selectTag(tagSuggestions.value[selectedSuggestionIndex.value]);
			}
			break;
		case "Escape":
			showSuggestions.value = false;
			selectedSuggestionIndex.value = -1;
			break;
	}
};

// Select a tag from suggestions
const selectTag = (tag: Tag) => {
	selectedTags.value.push(tag);
	searchInput.value = "";
	showSuggestions.value = false;
	tagSuggestions.value = [];
	selectedSuggestionIndex.value = -1;
};

// Remove a selected tag
const removeTag = (tagId: string) => {
	selectedTags.value = selectedTags.value.filter((tag) => tag.id !== tagId);
};

// Fetch locations filtered by selected tag IDs
const {
	data: locations,
	status: locationsStatus,
	refresh: locationsRefresh,
} = useAsyncData(
	`"locations"-${selectedTagIds.value.join(",")}`,
	async () => {
		if (selectedTagIds.value.length === 0) {
			// Return all locations if no tags selected
			const { data, error } = await supabase
				.from("locations")
				.select(
					`
                *,
                vendor:vendor_id(id, username, email, created_at),
                category:category_id(name_en),
                location_tags(
                    tags(id, name)
                ),
                location_ratings(
                    id,
                    rating,
                    user_id,
                    created_at
                )
            `
				)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching locations:", error);
				return [];
			}

			return (
				data?.map((location) => ({
					...location,
					tags:
						location.location_tags?.map(
							(lt: { tags: any }) => lt.tags
						) || [],
				})) || []
			);
		}

		// First, get locations that have all selected tags
		const { data: locationTagsData, error: locationTagsError } =
			await supabase
				.from("location_tags")
				.select("location_id, tag_id")
				.in("tag_id", selectedTagIds.value);

		if (locationTagsError) {
			console.error("Error fetching location tags:", locationTagsError);
			return [];
		}

		// Group by location_id and count matching tags
		const locationTagCounts: Record<string, number> = {};
		locationTagsData?.forEach((lt) => {
			locationTagCounts[lt.location_id] =
				(locationTagCounts[lt.location_id] || 0) + 1;
		});

		// Get location IDs that have ALL selected tags
		const validLocationIds = Object.entries(locationTagCounts)
			.filter(
				([locationId, count]) => count === selectedTagIds.value.length
			)
			.map(([locationId]) => locationId);

		if (validLocationIds.length === 0) {
			return []; // No locations match all tags
		}

		// Now get the full location data
		const { data, error } = await supabase
			.from("locations")
			.select(
				`
            *,
            vendor:vendor_id(id, username, email, created_at),
            category:category_id(name_en),
            location_tags(
                tags(id, name)
            ),
            location_ratings(
                id,
                rating,
                user_id,
                created_at
            )
        `
			)
			.in("id", validLocationIds)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching locations by tags:", error);
			return [];
		}

		// Transform the data to flatten the tags structure
		const transformedData =
			data?.map((location) => ({
				...location,
				tags:
					location.location_tags?.map(
						(lt: { tags: any }) => lt.tags
					) || [],
			})) || [];

		console.log(
			"Filtered locations by tag IDs:",
			selectedTagIds.value,
			transformedData
		);
		return transformedData as Location[];
	},
	{
		// Re-fetch when selected tags change
		watch: [selectedTagIds],
	}
);

// Initialize component
onMounted(async () => {
	// Load tag from query parameter first
	await loadTagFromQuery();

	// Close suggestions when clicking outside
	document.addEventListener("click", (event) => {
		const target = event.target as HTMLElement;
		if (!target.closest(".relative")) {
			showSuggestions.value = false;
		}
	});
});

// Watch for route changes to handle query parameter updates
watch(
	() => route.query.tag,
	async (newTag) => {
		if (newTag && selectedTags.value.length === 0) {
			await loadTagFromQuery();
		}
	}
);
</script>

<style></style>
