<template>
	<div class="w-[1200px] mx-auto grid place-items-center h-screen">
		<form @submit.prevent="login" class="grid gap-4 w-[400px]">
			<h1 class="text-3xl text-center font-bold">User Login</h1>
			<div class="flex flex-col gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					v-model="email"
					type="email"
					placeholder="Enter your email"
					required
				/>
			</div>
			<div class="flex flex-col gap-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					v-model="password"
					type="password"
					placeholder="Enter your password"
					required
				/>
			</div>
			<p v-if="errorMessage" class="text-red-500 text-sm">
				{{ errorMessage }}
			</p>
			<Button type="submit" :disabled="isLoading">
				{{ isLoading ? "Logging in..." : "Login" }}
			</Button>

			<!-- Additional links for user login -->
			<div class="text-center text-sm text-gray-600 space-y-2">
				<p>
					Don't have an account?
					<NuxtLink to="/sign-up" class="text-primary font-medium">
						Sign up here
					</NuxtLink>
				</p>
				<!-- <p>
					<NuxtLink
						to="/forgot-password"
						class="text-primary font-medium"
					>
						Forgot your password?
					</NuxtLink>
				</p> -->
			</div>
		</form>
	</div>
</template>

<script lang="ts" setup>
import bcryptjs from "bcryptjs";

// Composables
const { user, setUser } = useAuth();
const supabase = useSupabaseClient<User>();
const router = useRouter();
if (user.value) {
	router.push("/");
}
// Reactive data
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

// Methods
const login = async () => {
	try {
		isLoading.value = true;
		errorMessage.value = "";

		// Validate form inputs
		if (!email.value.trim() || !password.value) {
			errorMessage.value = "Please fill in all fields";
			return;
		}

		// Query user by email to get the hashed password
		const { data, error } = await supabase
			.from("users")
			.select("id, username, email, profile_pic, password") // Include the hashed password
			.eq("email", email.value.trim().toLowerCase())
			.single();

		if (error || !data) {
			errorMessage.value = "Invalid email or password";
			return;
		}

		console.log("Attempting login for:", email.value);

		// Verify password using bcrypt
		const passwordMatch = await bcryptjs.compare(
			password.value,
			data.password
		);

		if (!passwordMatch) {
			errorMessage.value = "Invalid email or password";
			return;
		}

		// Password verified successfully - set user session
		setUser({
			id: data.id,
			name: data.username,
			email: data.email,
			profile_pic: data.profile_pic,
		});

		// Redirect to user dashboard or home page
		await navigateTo("/");
	} catch (err) {
		console.error("Login error:", err);
		errorMessage.value =
			"An error occurred during login. Please try again.";
	} finally {
		isLoading.value = false;
	}
};

// Auto-focus email field on mount
onMounted(() => {
	const emailInput = document.getElementById("email");
	if (emailInput) {
		emailInput.focus();
	}
});

// SEO
useHead({
	title: "User Login",
	meta: [{ name: "description", content: "Login to your user account" }],
});
</script>

<style scoped>
/* Custom styles for responsive design */
@media (max-width: 768px) {
	.w-\[1200px\] {
		width: 100%;
		padding: 0 1rem;
	}

	.w-\[400px\] {
		width: 100%;
		max-width: 400px;
	}
}

/* Focus styles */
input:focus {
	outline: 2px solid #3b82f6;
	outline-offset: 2px;
}

/* Loading button animation */
button:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

/* Link hover effects */
a {
	transition: color 0.2s ease-in-out;
}
</style>
