<template>
	<ul class="flex w-full overflow-x-auto">
		<NuxtLink
			v-for="(category, i) in categories"
			:href="`/categories/${category.id}`"
			:key="'category-' + i + '-' + category.id"
			class="flex flex-shrink-0 flex-col items-center gap-2 p-2 transition-all group border-b-3 w-24"
			:class="
				route.params.id == category.id
					? 'border-primary'
					: 'border-transparent hover:border-primary'
			"
		>
			<Icon
				:name="getCategoryIcon(category.name_en)"
				class="transition-all"
				size="24"
				:class="
					route.params.id == category.id
						? 'text-primary'
						: 'text-muted group-hover:text-primary'
				"
			/>
			<h2
				class="font-bold transition-all text-sm"
				:class="
					route.params.id == category.id
						? 'text-primary'
						: 'text-muted group-hover:text-primary'
				"
			>
				{{ language == "en" ? category.name_en : category.name_km }}
			</h2>
		</NuxtLink>
	</ul>
</template>

<script lang="ts" setup>
import { Dessert } from "lucide-vue-next";

const route = useRoute();
const supabase = useSupabaseClient<Category[]>();
const { language } = useLanguage();
function getCategoryIcon(category: string) {
	const categoryIcons: Record<string, string> = {
		Cafés: "mingcute:teacup-fill",
		Bakery: "mingcute:bread-fill",
		Restaurant: "mingcute:fork-spoon-fill",
		Dessert: "mingcute:ice-cream-fill",
		Bar: "mingcute:bottle-glass-fill",
		Entertainment: "mingcute:happy-fill",
		Snacks: "mingcute:sugar-coated-haws-fill",
	};

	return categoryIcons[category] || "mingcute:teacup-fill";
}

const {
	data: categories,
	status: categoriesStatus,
	refresh: categoriesRefresh,
} = useAsyncData("categories", async () => {
	const { data, error } = await supabase
		.from("categories")
		.select("id, name_en, name_km")
		.order("created_at", { ascending: true });

	if (error) {
		console.error("Error fetching categories:", error);
		return [];
	}

	return data;
});
</script>

<style></style>
