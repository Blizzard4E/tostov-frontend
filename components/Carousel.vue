<!-- ImageCarousel.vue Component -->
<template>
	<div class="relative w-full aspect-square bg-gray-100 rounded-lg">
		<div class="relative w-full aspect-square overflow-hidden rounded-lg">
			<!-- Main carousel container -->
			<div
				ref="carouselContainer"
				class="flex transition-transform duration-300 ease-out h-full cursor-grab active:cursor-grabbing"
				:style="{ transform: `translateX(-${currentIndex * 100}%)` }"
				@mousedown="startDrag"
				@touchstart="startDrag"
				@mousemove="drag"
				@touchmove="drag"
				@mouseup="endDrag"
				@mouseleave="endDrag"
				@touchend="endDrag"
			>
				<div
					v-for="(image, index) in images"
					:key="index"
					class="flex-shrink-0 w-full h-full"
				>
					<img
						:src="image"
						:alt="`Image ${index + 1}`"
						class="w-full h-full object-cover select-none"
						draggable="false"
					/>
				</div>
			</div>

			`<!-- Dots indicator -->
			<div
				v-if="images.length > 1"
				class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
			>
				<button
					v-for="(_, index) in images"
					:key="index"
					@click="goToImage(index)"
					class="w-2 h-2 rounded-full transition-all duration-200"
					:class="
						index === currentIndex
							? 'bg-white'
							: 'bg-white/50 hover:bg-white/70'
					"
				/>
			</div>
			`

			<!-- Fallback for no images -->
			<!-- <div
    			v-if="images.length === 0"
    			class="w-full h-full flex items-center justify-center bg-gray-200"
    		>
    			<svg
    				class="w-16 h-16 text-gray-400"
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
    		</div> -->
		</div>
		<!-- Navigation buttons -->
		<button
			v-if="images.length > 1"
			@click="previousImage"
			class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-muted"
			:disabled="currentIndex === 0"
			:class="{ 'cursor-not-allowed brightness-75': currentIndex === 0 }"
		>
			<svg
				class="w-6 h-6 text-gray-700"
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
			v-if="images.length > 1"
			@click="nextImage"
			class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-muted"
			:disabled="currentIndex === images.length - 1"
			:class="{
				'cursor-not-allowed brightness-75':
					currentIndex === images.length - 1,
			}"
		>
			<svg
				class="w-6 h-6 text-gray-700"
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
	</div>
</template>

<script lang="ts" setup>
interface Props {
	images: string[];
}

const props = defineProps<Props>();

const currentIndex = ref(0);
const carouselContainer = ref<HTMLElement | null>(null);

// Touch/drag functionality
const isDragging = ref(false);
const startX = ref(0);
const currentX = ref(0);
const dragThreshold = 50; // Minimum drag distance to trigger slide change

const nextImage = () => {
	if (currentIndex.value < props.images.length - 1) {
		currentIndex.value++;
	}
};

const previousImage = () => {
	if (currentIndex.value > 0) {
		currentIndex.value--;
	}
};

const goToImage = (index: number) => {
	currentIndex.value = index;
};

const startDrag = (event: MouseEvent | TouchEvent) => {
	isDragging.value = true;
	const clientX =
		"touches" in event ? event.touches[0].clientX : event.clientX;
	startX.value = clientX;
	currentX.value = clientX;
};

const drag = (event: MouseEvent | TouchEvent) => {
	if (!isDragging.value) return;

	event.preventDefault();
	const clientX =
		"touches" in event ? event.touches[0].clientX : event.clientX;
	currentX.value = clientX;
};

const endDrag = () => {
	if (!isDragging.value) return;

	const dragDistance = startX.value - currentX.value;

	if (Math.abs(dragDistance) > dragThreshold) {
		if (dragDistance > 0) {
			// Dragged left, go to next
			nextImage();
		} else {
			// Dragged right, go to previous
			previousImage();
		}
	}

	isDragging.value = false;
	startX.value = 0;
	currentX.value = 0;
};

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === "ArrowLeft") {
		previousImage();
	} else if (event.key === "ArrowRight") {
		nextImage();
	}
};

// Auto-play functionality (optional)
const autoPlay = ref(false);
const autoPlayInterval = ref<NodeJS.Timeout | null>(null);

const startAutoPlay = () => {
	if (autoPlayInterval.value) return;

	autoPlayInterval.value = setInterval(() => {
		if (currentIndex.value === props.images.length - 1) {
			currentIndex.value = 0;
		} else {
			nextImage();
		}
	}, 3000);
};

const stopAutoPlay = () => {
	if (autoPlayInterval.value) {
		clearInterval(autoPlayInterval.value);
		autoPlayInterval.value = null;
	}
};

onMounted(() => {
	document.addEventListener("keydown", handleKeydown);

	// Optional: Start auto-play when component mounts
	// startAutoPlay();
});

onUnmounted(() => {
	document.removeEventListener("keydown", handleKeydown);
	stopAutoPlay();
});

// Watch for image changes to reset index if needed
watch(
	() => props.images,
	(newImages) => {
		if (currentIndex.value >= newImages.length) {
			currentIndex.value = 0;
		}
	},
	{ immediate: true }
);
</script>

<style scoped>
/* Prevent text selection during drag */
.cursor-grab:active {
	cursor: grabbing;
}

/* Smooth scrolling for touch devices */
@media (hover: none) and (pointer: coarse) {
	.cursor-grab {
		cursor: default;
	}
}
</style>
