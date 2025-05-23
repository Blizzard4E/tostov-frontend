<template>
	<div class="flex gap-4">
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
