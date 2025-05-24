<template>
	<div>
		<div class="max-w-[1200px] w-full m-auto grid gap-4 p-4">
			<div class="grid grid-cols-2 md:grid-cols-3 items-center">
				<IconLogo />
				<NuxtLink
					href="/search"
					class="flex items-center gap-2 border rounded-full px-4 py-3 shadow-md w-full"
				>
					<Icon
						name="mingcute:search-2-fill"
						class="text-muted"
						:size="26"
					/>
					<span>Where to?</span>
				</NuxtLink>
				<div class="grid place-items-end">
					<NuxtLink
						v-if="!user"
						href="/login"
						class="hover:text-primary"
						>Login</NuxtLink
					>
					<div v-else class="flex items-center gap-2">
						<img
							:src="user.profile_pic"
							class="w-12 h-12 rounded-full object-cover"
							alt=""
						/>
						<div>
							<h2 class="text-sm text-primary">
								{{ user.name }}
							</h2>
							<h3 class="text-xs text-muted">
								{{ user.email }}
							</h3>
						</div>
						<button @click="logout">
							<Icon
								name="mingcute:exit-line"
								class="text-muted hover:text-primary transition-all"
								size="24"
							/>
						</button>
					</div>
				</div>
			</div>

			<slot />
		</div>
	</div>
</template>

<script lang="ts" setup>
const { language } = useLanguage();
const { user, clearUser } = useAuth();

const logout = () => {
	clearUser();
};
</script>

<style></style>
