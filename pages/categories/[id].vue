<template>
	<div class="grid gap-4">
		<CategoryList />
		<LocationList v-if="locations" :locations="locations" />
	</div>
</template>

<script lang="ts" setup>
import type { Location } from "#imports";

const supabase = useSupabaseClient<Location[]>();
const { user, clearUser } = useAuth();
const route = useRoute();

// Get category ID from route parameters
const categoryId = computed(() => route.params.id);

// Fetch locations filtered by category ID
const {
	data: locations,
	status: locationsStatus,
	refresh: locationsRefresh,
} = useAsyncData(
	`locations-${categoryId.value}`,
	async () => {
		if (!categoryId.value) {
			console.error("No category ID provided in route");
			return [];
		}

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
			.eq("category_id", categoryId.value)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching locations:", error);
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

		console.log(transformedData);
		return transformedData as Location[];
	},
	{
		// Re-fetch when category ID changes
		watch: [categoryId],
	}
);
</script>

<style></style>
