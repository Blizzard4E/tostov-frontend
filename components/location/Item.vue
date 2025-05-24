<template>
	<NuxtLink
		:href="'/locations/' + location.id"
		class="grid w-full gap-2 flex-shrink-0"
	>
		<div class="w-full aspect-square overflow-hidden rounded-2xl">
			<img
				:src="location.media.images[0]"
				class="w-full aspect-square object-cover rounded-2xl hover:scale-110 transition-all"
				alt=""
			/>
		</div>
		<!-- <Carousel :images="location.media.images" /> -->
		<div class="flex justify-between">
			<h1 class="line-clamp-1">
				{{ language == "en" ? location.name_en : location.name_km }}
			</h1>
			<div class="flex items-center gap-1">
				<Icon
					name="mingcute:star-fill"
					class="text-yellow-400"
					size="16"
				/>
				<div class="mt-0.5">
					{{
						location.location_ratings.length
							? (
									location.location_ratings.reduce(
										(sum, r) => sum + r.rating,
										0
									) / location.location_ratings.length
							  ).toFixed(1)
							: "0.0"
					}}
				</div>
			</div>
		</div>
		<h2 class="flex gap-2 max-w-full overflow-hidden">
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
const { language } = useLanguage();

defineProps<{
	location: Location;
}>();
</script>

<style></style>
