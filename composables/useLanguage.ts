export type Language = "en" | "km";

export const useLanguage = () => {
	// Use useState with a function that checks localStorage first
	const languageState = useState<Language>("languageState", () => {
		// Run only on client-side
		if (import.meta.client) {
			console.log("Checking language in localStorage");
			const storedLanguage = localStorage.getItem("language");
			return (storedLanguage as Language) || "km"; // Default to Khmer
		}
		return "km"; // Default to Khmer
	});

	// Watch for changes and sync with localStorage
	watch(languageState, (newValue) => {
		if (import.meta.client) {
			localStorage.setItem("language", newValue);
		}
	});

	// Helper to set language
	const setLanguage = (lang: Language) => {
		languageState.value = lang;
	};

	// Helper to toggle between languages
	const toggleLanguage = () => {
		languageState.value = languageState.value === "en" ? "km" : "en";
	};

	// Helper to check if current language is English
	const isEnglish = computed(() => languageState.value === "en");

	// Helper to check if current language is Khmer
	const isKhmer = computed(() => languageState.value === "km");

	return {
		language: languageState,
		setLanguage,
		toggleLanguage,
		isEnglish,
		isKhmer,
	};
};
