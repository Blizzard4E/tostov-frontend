<template>
	<div>
		<Button variant="outline">Hello</Button>
	</div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient<Tag[]>();
const {
	data: tags,
	status: tagsStatus,
	refresh: tagsRefresh,
} = useAsyncData("tags", async () => {
	const { data, error } = await supabase
		.from("tags")
		.select("id, name")
		.order("created_at", { ascending: false });
	return data;
});
</script>

<style></style>
