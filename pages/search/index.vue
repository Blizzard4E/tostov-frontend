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

				<!-- Selected Location Filter -->
				<div
					v-if="selectedLocation"
					class="flex items-center gap-2 px-2 py-1 text-white bg-primary rounded-full text-sm"
				>
					<Icon name="mingcute:location-fill" size="12" />
					<div>
						{{
							selectedLocation.name_en || selectedLocation.name_km
						}}
					</div>
					<button
						@click="clearSelectedLocation"
						class="rounded-full transition-colors"
						title="Remove location filter"
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
					placeholder="Search locations by name or type #tagname for tags..."
					class="flex-1 outline-none min-w-[200px]"
				/>
			</div>

			<!-- Suggestions Dropdown -->
			<div
				v-if="
					showSuggestions &&
					(tagSuggestions.length > 0 ||
						locationSuggestions.length > 0)
				"
				class="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
			>
				<!-- Location Suggestions -->
				<div
					v-for="(suggestion, index) in locationSuggestions"
					:key="`location-${suggestion.id}`"
					@click="selectLocation(suggestion)"
					:class="[
						'px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2',
						{
							'bg-blue-50':
								index === selectedSuggestionIndex &&
								suggestionType === 'location',
						},
					]"
				>
					<Icon
						name="mingcute:location-fill"
						class="text-primary"
						size="16"
					/>
					<div>
						<div class="font-medium">
							{{ suggestion.name_en }}
							<span
								v-if="
									suggestion.name_km &&
									suggestion.name_km !== suggestion.name_en
								"
								class="text-gray-600 ml-1"
							>
								({{ suggestion.name_km }})
							</span>
						</div>
						<div class="text-xs text-gray-500">
							{{ suggestion.address }}
						</div>
					</div>
				</div>

				<!-- Divider if both types exist -->
				<div
					v-if="
						locationSuggestions.length > 0 &&
						tagSuggestions.length > 0
					"
					class="border-t border-gray-200"
				></div>

				<!-- Tag Suggestions -->
				<div
					v-for="(suggestion, index) in tagSuggestions"
					:key="`tag-${suggestion.id}`"
					@click="selectTag(suggestion)"
					:class="[
						'px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2',
						{
							'bg-blue-50':
								index ===
									selectedSuggestionIndex -
										locationSuggestions.length &&
								suggestionType === 'tag',
						},
					]"
				>
					<span class="text-primary">#</span>
					<span>{{ suggestion.name }}</span>
				</div>
			</div>
		</div>

		<!-- Results Info -->
		<div
			v-if="selectedTags.length > 0 || selectedLocation"
			class="text-sm text-gray-600"
		>
			<span v-if="selectedLocation">
				Showing location:
				<strong>{{
					selectedLocation.name_en || selectedLocation.name_km
				}}</strong>
			</span>
			<span v-else-if="selectedTags.length > 0">
				Searching for locations with tags:
				<span v-for="(tag, index) in selectedTags" :key="tag.id">
					<strong>#{{ tag.name }}</strong
					><span v-if="index < selectedTags.length - 1">, </span>
				</span>
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

interface LocationSuggestion {
	id: string;
	name_en: string;
	name_km: string;
	address: string;
}

const supabase = useSupabaseClient();
const { user, clearUser } = useAuth();
const route = useRoute();

// Search and tag selection state
const searchInput = ref("");
const selectedTags = ref<Tag[]>([]);
const selectedLocation = ref<LocationSuggestion | null>(null);
const tagSuggestions = ref<Tag[]>([]);
const locationSuggestions = ref<LocationSuggestion[]>([]);
const showSuggestions = ref(false);
const selectedSuggestionIndex = ref(-1);
const suggestionType = ref<"location" | "tag">("location");
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
};

// Search for location suggestions
const searchLocations = async (query: string) => {
	if (!query || query.length < 2) {
		locationSuggestions.value = [];
		return;
	}

	const { data, error } = await supabase
		.from("locations")
		.select("id, name_en, name_km, address")
		.or(
			`name_en.ilike.%${query}%,name_km.ilike.%${query}%,address.ilike.%${query}%`
		)
		.limit(10);

	if (error) {
		console.error("Error searching locations:", error);
		return;
	}

	locationSuggestions.value = data || [];
};

// Handle search input
const onSearchInput = () => {
	const value = searchInput.value;

	// Clear existing timeout
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}

	// Reset suggestions
	tagSuggestions.value = [];
	locationSuggestions.value = [];

	if (!value || value.length < 2) {
		showSuggestions.value = false;
		return;
	}

	// Check if user typed # to trigger tag search
	if (value.startsWith("#")) {
		const query = value.slice(1); // Remove the # symbol
		suggestionType.value = "tag";

		// Debounce the search
		searchTimeout.value = setTimeout(async () => {
			await searchTags(query);
			showSuggestions.value = true;
			selectedSuggestionIndex.value = -1;
		}, 300);
	} else {
		// Search locations by name
		suggestionType.value = "location";

		// Debounce the search
		searchTimeout.value = setTimeout(async () => {
			await searchLocations(value);
			showSuggestions.value = true;
			selectedSuggestionIndex.value = -1;
		}, 300);
	}
};

// Handle keyboard navigation
const onKeyDown = (event: KeyboardEvent) => {
	const totalSuggestions =
		locationSuggestions.value.length + tagSuggestions.value.length;

	if (!showSuggestions.value || totalSuggestions === 0) return;

	switch (event.key) {
		case "ArrowDown":
			event.preventDefault();
			selectedSuggestionIndex.value = Math.min(
				selectedSuggestionIndex.value + 1,
				totalSuggestions - 1
			);
			// Update suggestion type based on index
			if (
				selectedSuggestionIndex.value < locationSuggestions.value.length
			) {
				suggestionType.value = "location";
			} else {
				suggestionType.value = "tag";
			}
			break;
		case "ArrowUp":
			event.preventDefault();
			selectedSuggestionIndex.value = Math.max(
				selectedSuggestionIndex.value - 1,
				0
			);
			// Update suggestion type based on index
			if (
				selectedSuggestionIndex.value < locationSuggestions.value.length
			) {
				suggestionType.value = "location";
			} else {
				suggestionType.value = "tag";
			}
			break;
		case "Enter":
			event.preventDefault();
			if (selectedSuggestionIndex.value >= 0) {
				if (
					selectedSuggestionIndex.value <
					locationSuggestions.value.length
				) {
					selectLocation(
						locationSuggestions.value[selectedSuggestionIndex.value]
					);
				} else {
					const tagIndex =
						selectedSuggestionIndex.value -
						locationSuggestions.value.length;
					selectTag(tagSuggestions.value[tagIndex]);
				}
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
	locationSuggestions.value = [];
	selectedSuggestionIndex.value = -1;
};

// Select a location from suggestions
const selectLocation = (location: LocationSuggestion) => {
	selectedLocation.value = location;
	searchInput.value = "";
	showSuggestions.value = false;
	tagSuggestions.value = [];
	locationSuggestions.value = [];
	selectedSuggestionIndex.value = -1;
};

// Remove a selected tag
const removeTag = (tagId: string) => {
	selectedTags.value = selectedTags.value.filter((tag) => tag.id !== tagId);
};

// Clear selected location
const clearSelectedLocation = () => {
	selectedLocation.value = null;
};

// Fetch locations filtered by selected tag IDs or specific location
const {
	data: locations,
	status: locationsStatus,
	refresh: locationsRefresh,
} = useAsyncData(
	`locations-${selectedTagIds.value.join(",")}-${
		selectedLocation.value?.id || ""
	}`,
	async () => {
		// If a specific location is selected, show only that location
		if (selectedLocation.value) {
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
				.eq("id", selectedLocation.value.id);

			if (error) {
				console.error("Error fetching selected location:", error);
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

		// Original tag-based filtering logic
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
		// Re-fetch when selected tags or location change
		watch: [selectedTagIds, () => selectedLocation.value?.id],
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
