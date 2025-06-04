<!-- ImageGrid.vue Component -->
<template>
	<div class="w-full">
		<!-- Grid container with custom layout -->
		<div
			class="grid gap-2 transition-all duration-500 ease-in-out"
			:class="gridLayoutClasses"
		>
			<!-- Image 1 - Top left (spans 2 cols, 2 rows) -->
			<div
				v-if="visibleImages.length > 0"
				class="col-span-2 row-span-2 relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
				@click="openLightbox(0)"
			>
				<img
					:src="convertToHttps(visibleImages[0])"
					:alt="`Image 1`"
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
				/>
			</div>

			<!-- Image 2 - Top middle (spans 2 cols, 1 row) -->
			<div
				v-if="visibleImages.length > 1"
				class="col-span-2 row-span-1 relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
				@click="openLightbox(1)"
			>
				<img
					:src="convertToHttps(visibleImages[1])"
					:alt="`Image 2`"
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<!-- <div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
				/> -->
			</div>

			<!-- Image 3 - Top right (spans 2 cols, 1 row) -->
			<div
				v-if="visibleImages.length > 2"
				class="col-span-2 row-span-1 relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
				@click="openLightbox(2)"
			>
				<img
					:src="convertToHttps(visibleImages[2])"
					:alt="`Image 3`"
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
				/>
			</div>

			<!-- Image 4 - Middle right (spans 2 cols, 1 row) -->
			<div
				v-if="visibleImages.length > 3"
				class="col-span-2 row-span-1 relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
				@click="openLightbox(3)"
			>
				<img
					:src="convertToHttps(visibleImages[3])"
					:alt="`Image 4`"
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
				/>
			</div>

			<!-- Image 5 - Bottom right (spans 2 cols, 1 row) -->
			<div
				v-if="visibleImages.length > 4"
				class="col-span-2 row-span-1 relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
				@click="openLightbox(4)"
			>
				<img
					:src="convertToHttps(visibleImages[4])"
					:alt="`Image 5`"
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
				/>
			</div>

			<!-- Show more button overlay (appears in 5th position when there are more than 5 images) -->
			<div
				v-if="!showAll && images.length > 5"
				class="col-span-2 row-span-1 relative overflow-hidden rounded-lg bg-black/70 backdrop-blur-sm cursor-pointer group flex items-center justify-center"
				@click="toggleShowAll"
			>
				<!-- Background image (blurred version of the 5th image) -->
				<img
					v-if="images.length > 4"
					:src="convertToHttps(images[4])"
					:alt="'Show more'"
					class="absolute inset-0 w-full h-full object-cover opacity-30"
				/>
				<div class="relative z-10 text-center text-white">
					<div class="flex items-center justify-center mb-2">
						<svg
							class="w-6 h-6 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							></path>
						</svg>
						<span class="text-sm font-medium"
							>+{{ images.length - 5 }} more</span
						>
					</div>
				</div>
				<div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"
				/>
			</div>

			<!-- Additional images when expanded (positioned in remaining grid areas) -->
			<template v-if="showAll">
				<!-- Fill bottom left area (below image 1) -->
				<div
					v-for="(image, index) in additionalImages.slice(0, 2)"
					:key="index + 5"
					class="col-span-1 row-span-1 relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
					@click="openLightbox(index + 5)"
				>
					<img
						:src="convertToHttps(image)"
						:alt="`Image ${index + 6}`"
						class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
					<div
						class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
					/>
				</div>

				<!-- Additional images in a new row if needed -->
				<div
					v-for="(image, index) in additionalImages.slice(2)"
					:key="index + 7"
					class="col-span-1 relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer group aspect-square"
					@click="openLightbox(index + 7)"
				>
					<img
						:src="convertToHttps(image)"
						:alt="`Image ${index + 8}`"
						class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
					<div
						class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
					/>
				</div>
			</template>
		</div>

		<!-- Show less button -->
		<div v-if="showAll && images.length > 5" class="mt-6 text-center">
			<button
				@click="toggleShowAll"
				class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
			>
				Show Less
			</button>
		</div>

		<!-- Lightbox Modal -->
		<div
			v-if="lightboxOpen"
			class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
			@click="closeLightbox"
			@keydown.esc="closeLightbox"
		>
			<div class="relative max-w-4xl max-h-full">
				<img
					:src="convertToHttps(images[lightboxIndex])"
					:alt="`Image ${lightboxIndex + 1}`"
					class="max-w-full max-h-full object-contain rounded-lg"
					@click.stop
				/>

				<!-- Close button -->
				<button
					@click="closeLightbox"
					class="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
				>
					<svg
						class="w-6 h-6 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>

				<!-- Navigation arrows -->
				<button
					v-if="lightboxIndex > 0"
					@click.stop="lightboxIndex--"
					class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
				>
					<svg
						class="w-6 h-6 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						></path>
					</svg>
				</button>

				<button
					v-if="lightboxIndex < images.length - 1"
					@click.stop="lightboxIndex++"
					class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
				>
					<svg
						class="w-6 h-6 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						></path>
					</svg>
				</button>

				<!-- Image counter -->
				<div
					class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
				>
					{{ lightboxIndex + 1 }} / {{ images.length }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	images: string[];
}

const props = defineProps<Props>();

const showAll = ref(false);
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

// Function to convert HTTP URLs to HTTPS
const convertToHttps = (url: string): string => {
	if (!url) return url;

	// If the URL starts with http:// (not https://), convert it to https://
	if (url.startsWith("http://")) {
		return url.replace("http://", "https://");
	}

	// Return the URL as-is if it's already https:// or doesn't start with http://
	return url;
};

const gridLayoutClasses = computed(() => {
	if (!showAll.value && props.images.length > 5) {
		// When collapsed with more than 5 images, show 4 images + show more overlay
		return "grid-cols-6 auto-rows-[250px]";
	}
	// Default layout for 5 or fewer images, or when expanded
	return "grid-cols-6 auto-rows-[250px]";
});

const visibleImages = computed(() => {
	if (showAll.value) {
		return props.images.slice(0, 5);
	}
	// When not showing all, if we have more than 5 images, only show first 4
	// so the 5th slot can be used for "Show more" overlay
	if (props.images.length > 5) {
		return props.images.slice(0, 4);
	}
	return props.images.slice(0, Math.min(5, props.images.length));
});

const additionalImages = computed(() => {
	if (showAll.value && props.images.length > 5) {
		return props.images.slice(5);
	}
	return [];
});

const toggleShowAll = () => {
	showAll.value = !showAll.value;
};

const openLightbox = (index: number) => {
	lightboxIndex.value = index;
	lightboxOpen.value = true;
	document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
	lightboxOpen.value = false;
	document.body.style.overflow = "";
};

// Keyboard navigation for lightbox
const handleKeydown = (event: KeyboardEvent) => {
	if (!lightboxOpen.value) return;

	if (event.key === "ArrowLeft" && lightboxIndex.value > 0) {
		lightboxIndex.value--;
	} else if (
		event.key === "ArrowRight" &&
		lightboxIndex.value < props.images.length - 1
	) {
		lightboxIndex.value++;
	} else if (event.key === "Escape") {
		closeLightbox();
	}
};

onMounted(() => {
	document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
	document.removeEventListener("keydown", handleKeydown);
	document.body.style.overflow = "";
});
</script>

<style scoped>
/* Smooth grid transitions */
.grid {
	transition: grid-template-rows 0.5s ease-in-out,
		grid-template-columns 0.5s ease-in-out;
}

/* Prevent body scroll when lightbox is open */
body.lightbox-open {
	overflow: hidden;
}
</style>
