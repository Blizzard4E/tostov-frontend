<template>
	<div class="bg-white border border-gray-200 rounded-lg p-6 mt-6">
		<div class="flex items-center justify-between mb-4">
			<h3
				class="text-lg font-semibold text-gray-900 flex items-center gap-2"
			>
				<Icon
					name="mingcute:camera-fill"
					class="text-gray-400"
					size="20"
				/>
				Add Photos
			</h3>
		</div>

		<p class="text-sm text-gray-600 mb-4">
			Help others discover this place by adding your photos to the
			gallery!
		</p>

		<!-- Upload Section -->
		<div class="space-y-4">
			<!-- File Input -->
			<div
				class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
			>
				<input
					ref="fileInput"
					type="file"
					multiple
					accept="image/*"
					@change="handleFileSelect"
					class="hidden"
				/>
				<button
					@click="triggerFileInput"
					class="flex flex-col items-center gap-2 w-full"
					:disabled="status === 'uploading'"
				>
					<Icon
						name="mingcute:upload-2-fill"
						class="text-gray-400"
						size="32"
					/>
					<span class="text-sm font-medium text-gray-700">
						Click to select photos
					</span>
					<span class="text-xs text-gray-500">
						PNG, JPG, WebP up to 10MB each
					</span>
				</button>
			</div>

			<!-- Preview Images -->
			<div v-if="previewImages.length > 0" class="space-y-3">
				<h4 class="text-sm font-medium text-gray-900">
					Selected Photos ({{ previewImages.length }})
				</h4>
				<div
					class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
				>
					<div
						v-for="(preview, index) in previewImages"
						:key="index"
						class="relative group"
					>
						<img
							:src="preview"
							alt="Preview"
							class="w-full h-20 object-cover rounded-lg border border-gray-200"
						/>
						<button
							@click="removeImage(index)"
							class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
							:disabled="status === 'uploading'"
						>
							<Icon name="mingcute:close-fill" size="12" />
						</button>
					</div>
				</div>

				<!-- Upload Button -->
				<div class="flex items-center gap-3">
					<button
						@click="uploadAndAddImages"
						:disabled="
							status === 'uploading' || previewImages.length === 0
						"
						class="bg-primary text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						<Icon
							v-if="status === 'uploading'"
							name="mingcute:loading-fill"
							class="animate-spin"
							size="16"
						/>
						<Icon v-else name="mingcute:upload-fill" size="16" />
						{{
							status === "uploading"
								? "Adding Photos..."
								: "Add to Gallery"
						}}
					</button>
					<button
						v-if="
							previewImages.length > 0 && status !== 'uploading'
						"
						@click="clearAll"
						class="text-gray-500 hover:text-gray-700 text-sm underline"
					>
						Clear All
					</button>
				</div>
			</div>

			<!-- Error Message -->
			<div
				v-if="errorMessage"
				class="bg-red-50 border border-red-200 rounded-lg p-3"
			>
				<div class="flex items-center gap-2">
					<Icon
						name="mingcute:alert-circle-fill"
						class="text-red-500"
						size="16"
					/>
					<span class="text-sm text-red-700">{{ errorMessage }}</span>
				</div>
			</div>

			<!-- Success Message -->
			<div
				v-if="successMessage"
				class="bg-green-50 border border-green-200 rounded-lg p-3"
			>
				<div class="flex items-center gap-2">
					<Icon
						name="mingcute:check-circle-fill"
						class="text-green-500"
						size="16"
					/>
					<span class="text-sm text-green-700">{{
						successMessage
					}}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	locationId: number | string;
	currentImages?: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
	imagesAdded: [newImages: string[]];
}>();

const supabase = useSupabaseClient();
const config = useRuntimeConfig();

// Reactive state
const fileInput = ref<HTMLInputElement>();
const imageFiles = ref<FileList | null>(null);
const previewImages = ref<string[]>([]);
const status = ref<"idle" | "uploading">("idle");
const errorMessage = ref("");
const successMessage = ref("");

// Clear messages after some time
watch([errorMessage, successMessage], () => {
	setTimeout(() => {
		errorMessage.value = "";
		successMessage.value = "";
	}, 5000);
});

const triggerFileInput = () => {
	fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const files = target.files;

	if (!files || files.length === 0) return;

	// Validate files
	const validFiles: File[] = [];
	const maxSize = 10 * 1024 * 1024; // 10MB
	const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (!allowedTypes.includes(file.type)) {
			errorMessage.value = `Invalid file type: ${file.name}. Please use JPG, PNG, or WebP.`;
			continue;
		}

		if (file.size > maxSize) {
			errorMessage.value = `File too large: ${file.name}. Maximum size is 10MB.`;
			continue;
		}

		validFiles.push(file);
	}

	if (validFiles.length === 0) return;

	// Create FileList from valid files
	const dt = new DataTransfer();
	validFiles.forEach((file) => dt.items.add(file));
	imageFiles.value = dt.files;

	// Generate previews
	previewImages.value = [];
	validFiles.forEach((file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result) {
				previewImages.value.push(e.target.result as string);
			}
		};
		reader.readAsDataURL(file);
	});

	// Clear any previous error
	errorMessage.value = "";
};

const removeImage = (index: number) => {
	if (!imageFiles.value) return;

	// Create new FileList without the removed file
	const dt = new DataTransfer();
	for (let i = 0; i < imageFiles.value.length; i++) {
		if (i !== index) {
			dt.items.add(imageFiles.value[i]);
		}
	}

	imageFiles.value = dt.files;
	previewImages.value.splice(index, 1);
};

const clearAll = () => {
	imageFiles.value = null;
	previewImages.value = [];
	if (fileInput.value) {
		fileInput.value.value = "";
	}
};

const uploadSingleImage = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", config.public.preset_name);
	formData.append("api_key", config.public.cloud_key);

	const response = await $fetch<{ url: string }>(
		`https://api.cloudinary.com/v1_1/${config.public.cloud_name}/upload`,
		{
			method: "POST",
			body: formData,
		}
	);

	return response.url;
};

const uploadAndAddImages = async () => {
	if (!imageFiles.value || imageFiles.value.length === 0) return;

	status.value = "uploading";
	errorMessage.value = "";
	successMessage.value = "";

	try {
		// Upload images to Cloudinary
		const uploadPromises = Array.from(imageFiles.value).map(
			uploadSingleImage
		);
		const newImageUrls = await Promise.all(uploadPromises);

		// Get current location data
		const { data: currentLocation, error: fetchError } = await supabase
			.from("locations")
			.select("media")
			.eq("id", props.locationId)
			.single();

		if (fetchError) {
			throw new Error("Failed to fetch current location data");
		}

		// Merge new images with existing ones
		const existingImages = currentLocation?.media?.images || [];
		const updatedImages = [...existingImages, ...newImageUrls];

		// Update location with new images
		const { error: updateError } = await supabase
			.from("locations")
			.update({
				media: { images: updatedImages },
			})
			.eq("id", props.locationId);

		if (updateError) {
			throw new Error("Failed to update location with new images");
		}

		// Success
		successMessage.value = `Successfully added ${
			newImageUrls.length
		} photo${newImageUrls.length !== 1 ? "s" : ""} to the gallery!`;

		// Emit event to parent component
		emit("imagesAdded", newImageUrls);

		// Clear form
		clearAll();
	} catch (error) {
		console.error("Upload error:", error);
		errorMessage.value = "Failed to add images. Please try again.";
	} finally {
		status.value = "idle";
	}
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
