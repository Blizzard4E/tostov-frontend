<template>
	<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
		<LocationItem v-for="location in locations" :location="location" />
	</div>
</template>

<script lang="ts" setup>
import type { Location } from "#imports";

defineProps<{
	locations: Location[];
}>();
</script>

<style></style>
