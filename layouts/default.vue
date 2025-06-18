<template>
	<div>
		<div class="max-w-[1200px] w-full m-auto grid gap-4 p-4">
			<div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
				<div class="flex items-center gap-4">
					<IconLogo />
					<!-- Language Toggle Switch -->
					<div class="flex items-center gap-2">
						<span
							class="text-sm text-muted"
							:class="{ 'text-primary font-medium': !isEnglish }"
						>
							ខ្មែរ
						</span>
						<button
							@click="toggleLanguage"
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							:class="isEnglish ? 'bg-primary' : 'bg-gray-300'"
						>
							<span
								class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform"
								:class="
									isEnglish
										? 'translate-x-6'
										: 'translate-x-1'
								"
							></span>
						</button>
						<span
							class="text-sm text-muted"
							:class="{ 'text-primary font-medium': isEnglish }"
						>
							EN
						</span>
					</div>
					<div class="place-items-end sm:hidden grid">
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

				<div class="place-items-end sm:grid hidden">
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
const { language, toggleLanguage, isEnglish } = useLanguage();
const { user, clearUser } = useAuth();
const logout = () => {
	clearUser();
};
</script>

<style></style>
