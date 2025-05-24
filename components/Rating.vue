<template>
	<div class="p-4 bg-white border border-gray-200 rounded-lg">
		<div class="grid gap-4 place-items-center">
			<h1 class="font-bold text-xl">
				{{ hasExistingRating ? "Your Rating" : "Rate Location" }}
			</h1>
			<div class="flex items-center gap-4">
				<button
					v-for="star in 5"
					:key="star"
					@click="handleRating(star)"
					class="text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded cursor-pointer"
				>
					<Icon
						name="mingcute:star-fill"
						:class="{
							'text-yellow-400': star <= currentRating,
							'text-gray-300 hover:text-yellow-400':
								star > currentRating,
						}"
						size="32"
					/>
				</button>
			</div>
			<span
				v-if="showValue && currentRating > 0"
				class="text-gray-600 ml-2 mb-1 font-bold text-2xl"
			>
				{{ currentRating }}/5
			</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	locationId: number;
	showValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showValue: true,
});

const supabase = useSupabaseClient<Rating>();
const { user } = useAuth();

const currentRating = ref(0);
const hasExistingRating = ref(false);

// Load existing user rating for this location
onMounted(async () => {
	if (user.value) {
		const { data } = await supabase
			.from("location_ratings")
			.select("rating")
			.eq("location_id", props.locationId)
			.eq("user_id", user.value.id)
			.single();

		if (data) {
			currentRating.value = data.rating;
			hasExistingRating.value = true;
		}
	}
});

const handleRating = async (rating: number) => {
	if (!user.value) {
		// You might want to show a login prompt here
		navigateTo("/login");
		return;
	}

	currentRating.value = rating;

	try {
		// Check if user already rated this location
		const { data: existingRating } = await supabase
			.from("location_ratings")
			.select("id")
			.eq("location_id", props.locationId)
			.eq("user_id", user.value.id)
			.single();

		if (existingRating) {
			// Update existing rating
			await supabase
				.from("location_ratings")
				.update({
					rating: rating,
				})
				.eq("id", existingRating.id);
		} else {
			// Create new rating
			await supabase.from("location_ratings").insert({
				rating: rating,
				location_id: props.locationId,
				user_id: user.value.id,
			});

			// Update the flag since we now have a rating
			hasExistingRating.value = true;
		}
	} catch (error) {
		console.error("Error saving rating:", error);
		// Reset rating on error
		currentRating.value = 0;
	}
};
</script>
