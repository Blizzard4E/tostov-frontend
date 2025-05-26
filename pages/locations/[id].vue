<template>
	<div v-if="location" class="w-full">
		<!-- Header Section -->
		<div class="mb-8">
			<div class="flex items-start justify-between mb-4">
				<div>
					<div class="flex justify-between gap-4">
						<h1 class="text-3xl font-bold text-gray-900 mb-2">
							{{
								language == "en"
									? location.name_en
									: location.name_km
							}}
						</h1>
						<div class="flex items-center gap-1">
							<Icon
								name="mingcute:star-fill"
								class="text-yellow-400"
								size="24"
							/>
							<div class="mt-0.5 text-lg">
								{{
									location.location_ratings.length
										? (
												location.location_ratings.reduce(
													(sum, r) => sum + r.rating,
													0
												) /
												location.location_ratings.length
										  ).toFixed(1)
										: "0.0"
								}}
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2 mb-3">
						<NuxtLink
							:href="`/categories/${location.category.id}`"
							class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground"
						>
							{{ location.category.name_en }}
						</NuxtLink>
					</div>
				</div>
			</div>

			<!-- Tags -->
			<div class="flex flex-wrap gap-2 mb-6">
				<NuxtLink
					v-for="tag in location.tags"
					:key="tag.id"
					:href="`/search?tag=${tag.name}`"
					class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-primary hover:text-primary-foreground transition-colors"
				>
					#{{ tag.name }}
				</NuxtLink>
			</div>
		</div>

		<!-- Image Gallery - Responsive -->
		<div class="mb-8">
			<!-- Desktop/Tablet: Use ImageGrid -->
			<div class="hidden md:block">
				<ImageGrid :images="location.media.images" />
			</div>

			<!-- Mobile: Use Carousel -->
			<div class="block md:hidden">
				<Carousel :images="location.media.images" />
			</div>
		</div>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Description Section -->
			<div class="lg:col-span-2 grid gap-4">
				<div class="bg-gray-50 rounded-lg p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">
						About
					</h2>
					<div
						class="prose prose-sm text-gray-700 whitespace-pre-line"
					>
						{{ location.description_en }}
					</div>
				</div>
				<div
					class="bg-white border border-gray-200 rounded-lg overflow-hidden"
				>
					<div class="p-4 border-b border-gray-200">
						<h3
							class="text-lg font-semibold text-gray-900 flex items-center gap-2"
						>
							<svg
								class="w-5 h-5 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							Location
						</h3>
					</div>
					<div class="relative w-full">
						<iframe
							:src="getEmbedMapUrl(location.map_link)"
							class="w-full h-[300px] border-0"
							allowfullscreen=""
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
						></iframe>
						<div class="absolute top-2 right-2">
							<a
								:href="location.map_link"
								target="_blank"
								rel="noopener noreferrer"
								class="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium shadow-md transition-all flex items-center gap-1"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
								Open in Maps
							</a>
						</div>
					</div>
				</div>
				<Rating :location-id="location.id" />
				<LocationImageUpload
					:location-id="location.id"
					:current-images="location.media?.images || []"
					@images-added="handleImagesAdded"
				/>
			</div>

			<!-- Contact & Info Section -->
			<div class="space-y-6">
				<!-- Contact Information -->
				<div class="bg-white border border-gray-200 rounded-lg p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">
						Contact Information
					</h3>
					<div class="space-y-4">
						<!-- Phone -->
						<div class="flex items-start gap-3">
							<div
								class="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5"
							>
								<svg
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-gray-900">
									Phone
								</p>
								<p class="text-sm text-gray-600">
									{{ location.contact }}
								</p>
							</div>
						</div>

						<!-- Address -->
						<div class="flex items-start gap-3">
							<div
								class="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5"
							>
								<svg
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-gray-900">
									Address
								</p>
								<p class="text-sm text-gray-600">
									{{ location.address }}
								</p>
							</div>
						</div>

						<!-- Website -->
						<div class="flex items-start gap-3">
							<div
								class="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5"
							>
								<svg
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-3a9 9 0 00-9-9 3 3 0 013-3m6 3a9 9 0 00-9-9 3 3 0 013-3m6 3a9 9 0 00-9-9 3 3 0 013-3"
									/>
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-gray-900">
									Website
								</p>
								<a
									:href="location.website"
									target="_blank"
									rel="noopener noreferrer"
									class="text-sm text-primary underline break-all"
								>
									{{ location.website }}
								</a>
							</div>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="space-y-3">
					<a
						:href="location.website"
						target="_blank"
						rel="noopener noreferrer"
						class="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
						Visit Website
					</a>
				</div>

				<!-- Vendor Information -->
				<div class="bg-gray-50 rounded-lg p-4">
					<h4 class="text-sm font-semibold text-gray-900 mb-2">
						Listed by
					</h4>
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
						>
							<span class="text-sm font-medium text-gray-600">
								{{
									location.vendor.username
										.charAt(0)
										.toUpperCase()
								}}
							</span>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-900">
								{{ location.vendor.username }}
							</p>
							<p class="text-xs text-gray-500">
								{{ location.vendor.email }}
							</p>
						</div>
					</div>
				</div>

				<Reviews :location-id="location.id" />
			</div>
		</div>

		<!-- Loading States -->
		<div
			v-if="locationStatus === 'pending'"
			class="flex items-center justify-center py-12"
		>
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
			></div>
		</div>

		<!-- Error State -->
		<div v-if="locationStatus === 'error'" class="text-center py-12">
			<div class="text-red-600 mb-4">
				<svg
					class="w-12 h-12 mx-auto mb-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">
				Something went wrong
			</h3>
			<p class="text-gray-600 mb-4">
				We couldn't load the location details.
			</p>
			<button
				@click="locationRefresh()"
				class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
			>
				Try Again
			</button>
		</div>
	</div>

	<!-- No Location Found -->
	<div v-else-if="locationStatus === 'success'" class="text-center py-12">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">
			Location not found
		</h3>
		<p class="text-gray-600">
			The location you're looking for doesn't exist.
		</p>
	</div>
</template>

<script lang="ts" setup>
import type { Location } from "#imports";

const route = useRoute();
const supabase = useSupabaseClient<Location>();
const { language } = useLanguage();
// Get the location ID from the route params
const locationId = route.params.id;

// Fetch single location with category information and tags
const {
	data: location,
	status: locationStatus,
	refresh: locationRefresh,
} = useAsyncData(`location-${locationId}`, async () => {
	if (!locationId) {
		console.error("No location ID provided");
		return null;
	}

	const { data, error } = await supabase
		.from("locations")
		.select(
			`
            *,
            vendor:vendor_id(id, username, email, created_at),
            category:category_id(name_en, name_km, id),
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
		.eq("id", locationId)
		.single();

	if (error) {
		console.error("Error fetching location:", error);
		return null;
	}

	// Transform the data to flatten the tags structure
	const transformedData = {
		...data,
		tags: data.location_tags?.map((lt: { tags: any }) => lt.tags) || [],
	};

	console.log(transformedData);
	return transformedData as Location;
});

// Function to extract place ID from Google Maps link and create embed URL
// Alternative solution without API key - uses Google Maps search directly
const getEmbedMapUrl = (mapLink: string): string => {
	try {
		// For any Google Maps link, we'll create a search-based embed
		// This method doesn't require an API key but has some limitations

		const businessName = location.value?.name_en || "";
		const address = location.value?.address || "";

		// Create search query
		let searchQuery = "";
		if (businessName && address) {
			searchQuery = `${businessName}, ${address}`;
		} else if (businessName) {
			searchQuery = businessName;
		} else if (address) {
			searchQuery = address;
		}

		if (searchQuery) {
			// Use the basic Google Maps embed with search
			const encodedQuery = encodeURIComponent(searchQuery);
			return `https://maps.google.com/maps?q=${encodedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
		}

		// If we have coordinates in the original link, try to extract them
		const coordMatch = mapLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
		if (coordMatch) {
			const lat = coordMatch[1];
			const lng = coordMatch[2];
			const searchQuery = businessName || address || `${lat},${lng}`;
			const encodedQuery = encodeURIComponent(searchQuery);
			return `https://maps.google.com/maps?q=${encodedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
		}

		// Final fallback
		const fallbackQuery = encodeURIComponent(
			businessName || address || "Phnom Penh, Cambodia"
		);
		return `https://maps.google.com/maps?q=${fallbackQuery}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
	} catch (error) {
		console.error("Error creating map embed:", error);

		// Error fallback
		const fallbackQuery = encodeURIComponent(
			location.value?.name_en ||
				location.value?.address ||
				"Phnom Penh, Cambodia"
		);
		return `https://maps.google.com/maps?q=${fallbackQuery}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
	}
};
const handleImagesAdded = async (newImages: string[]) => {
	// Refresh the location data to show the new images
	await locationRefresh();
};
</script>

<style scoped>
.prose {
	max-width: none;
}
</style>
