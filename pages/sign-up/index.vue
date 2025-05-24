<template>
	<div
		class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
	>
		<div class="max-w-md w-full space-y-8">
			<div>
				<h2
					class="mt-6 text-center text-3xl font-extrabold text-gray-900"
				>
					Create your account
				</h2>
				<p class="mt-2 text-center text-sm text-gray-600">
					Or
					<NuxtLink to="/login" class="font-medium text-primary">
						sign in to your existing account
					</NuxtLink>
				</p>
			</div>

			<form @submit.prevent="handleSignUp" class="mt-8 space-y-6">
				<div class="rounded-md space-y-4">
					<div>
						<Label
							for="username"
							class="block text-sm font-medium text-gray-700"
						>
							Username
						</Label>
						<Input
							id="username"
							v-model="username"
							type="text"
							required
							class="mt-1 block w-full"
							placeholder="Enter your username"
						/>
					</div>

					<div>
						<Label
							for="email"
							class="block text-sm font-medium text-gray-700"
						>
							Email address
						</Label>
						<Input
							id="email"
							v-model="email"
							type="email"
							required
							class="mt-1 block w-full"
							placeholder="Enter your email"
						/>
					</div>

					<div>
						<Label
							for="password"
							class="block text-sm font-medium text-gray-700"
						>
							Password
						</Label>
						<Input
							id="password"
							v-model="password"
							type="password"
							required
							class="mt-1 block w-full"
							placeholder="Enter your password"
						/>
					</div>

					<div>
						<Label
							for="profile_pic"
							class="block text-sm font-medium text-gray-700"
						>
							Profile Picture
						</Label>
						<InputFile
							id="profile_pic"
							class="mt-1 block w-full"
							@change="changeProfilePic"
							accept="image/*"
						/>
					</div>
				</div>

				<div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
					<p class="text-sm text-red-700">{{ errorMessage }}</p>
				</div>

				<div v-if="successMessage" class="rounded-md bg-green-50 p-4">
					<p class="text-sm text-green-700">{{ successMessage }}</p>
				</div>

				<div>
					<Button
						type="submit"
						:disabled="status === 'pending'"
						class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span
							v-if="status === 'pending'"
							class="flex items-center"
						>
							<svg
								class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Creating account...
						</span>
						<span v-else>Create Account</span>
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import bcrypt from "bcryptjs";

// Composables
const supabase = useSupabaseClient<User>();
const config = useRuntimeConfig();
const router = useRouter();
const { user, setUser } = useAuth();

if (user.value) {
	router.push("/");
}
// Reactive data
const username = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const profilePic = ref<FileList>();
const status = ref<FetchStatus>("idle");

// Methods
const changeProfilePic = (files: FileList) => {
	profilePic.value = files;
};

const uploadProfile = async (files: FileList) => {
	const formData = new FormData();
	formData.append("file", files[0]);
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

const validateForm = () => {
	errorMessage.value = "";

	if (!username.value.trim()) {
		errorMessage.value = "Username is required";
		return false;
	}

	if (!email.value.trim()) {
		errorMessage.value = "Email is required";
		return false;
	}

	if (!password.value) {
		errorMessage.value = "Password is required";
		return false;
	}

	if (password.value.length < 6) {
		errorMessage.value = "Password must be at least 6 characters long";
		return false;
	}

	if (!profilePic.value || profilePic.value.length === 0) {
		errorMessage.value = "Profile picture is required";
		return false;
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email.value)) {
		errorMessage.value = "Please enter a valid email address";
		return false;
	}

	return true;
};

const handleSignUp = async () => {
	if (!validateForm()) {
		return;
	}

	status.value = "pending";
	errorMessage.value = "";
	successMessage.value = "";

	try {
		// Hash password
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password.value, salt);

		// Upload profile picture
		const profilePicLink = await uploadProfile(
			profilePic.value as FileList
		);

		// Create user in database
		const { data, error } = await supabase
			.from("users")
			.insert({
				username: username.value.trim(),
				email: email.value.trim().toLowerCase(),
				password: hash,
				profile_pic: profilePicLink,
			})
			.select("id, username, email, profile_pic")
			.single();

		if (error) {
			console.error("Supabase error:", error);

			// Handle specific error cases
			if (error.code === "23505") {
				errorMessage.value = "Email or username already exists";
			} else {
				errorMessage.value = "Unable to create user. Please try again.";
			}

			status.value = "idle";
			return;
		}

		if (data) {
			successMessage.value =
				"Account created successfully! Redirecting...";
			status.value = "idle";

			// Clear form
			username.value = "";
			email.value = "";
			password.value = "";
			profilePic.value = undefined;

			// Redirect after a short delay
			setTimeout(() => {
				setUser({
					id: data.id,
					name: data.username,
					email: data.email,
					profile_pic: data.profile_pic,
				});
				router.push("/");
			}, 2000);
		}
	} catch (error) {
		console.error("Signup error:", error);
		errorMessage.value = "An unexpected error occurred. Please try again.";
		status.value = "idle";
	}
};

// SEO
useHead({
	title: "Sign Up - Create Account",
	meta: [
		{ name: "description", content: "Create a new account to get started" },
	],
});
</script>

<style scoped>
/* Custom styles if needed */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
