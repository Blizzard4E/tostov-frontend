<template>
	<NuxtLink :href="'/locations/' + location.id" class="grid w-[300px] gap-2">
		<div class="w-full aspect-square overflow-hidden rounded-2xl">
			<img
				:src="location.media.images[0]"
				class="w-full aspect-square object-cover rounded-2xl hover:scale-110 transition-all"
				alt=""
			/>
		</div>
		<!-- <Carousel :images="location.media.images" /> -->
		<h1>{{ location.name_en }}</h1>
		<h2 class="flex gap-2 max-w-[300px] overflow-hidden">
			<NuxtLink
				href="/search"
				class="text-sm text-muted hover:text-primary transition-all flex-shrink-0"
				v-for="tag in location.tags"
				:key="'tag-' + tag.id + '-location-' + location.id"
				>#{{ tag.name }}</NuxtLink
			>
		</h2>
	</NuxtLink>
</template>

<script lang="ts" setup>
import type { Location } from "#imports";

defineProps<{
	location: Location;
}>();
</script>

<style></style>
