<template>
	<div>
		<LocationItem v-for="location in locations" :location="location" />
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<Location[]>();
const {
	data: locations,
	status: locationsStatus,
	refresh: locationsRefresh,
} = useAsyncData("locations", async () => {
	const { data, error } = await supabase
		.from("locations")
		.select(
			`
            *, 
            category:category_id(name_en, name_km),
            location_tags(
                tags(id, name)
            )
        `
		)
		.order("created_at", { ascending: false });
	console.log("locations", data);
	if (error) {
		console.error("Error fetching locations:", error);
		return [];
	}

	return data;
});
</script>

<style></style>
