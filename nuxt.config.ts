import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-05-15",
	devtools: { enabled: true },
	css: ["~/assets/css/tailwind.css"],

	vite: {
		plugins: [tailwindcss()],
	},

	modules: ["shadcn-nuxt", "@nuxtjs/supabase"],
	shadcn: {
		/**
		 * Prefix for all the imported component
		 */
		prefix: "",
		/**
		 * Directory that the component lives in.
		 * @default "./components/ui"
		 */
		componentDir: "./components/ui",
	},
	supabase: {
		redirect: false,
	},
	runtimeConfig: {
		public: {
			cloud_name: process.env.PUBLIC_CLOUD_NAME,
			cloud_key: process.env.PUBLIC_CLOUD_API_KEY,
			preset_name: process.env.PUBLIC_PRESET_NAME,
		},
	},
	ssr: false,
});
