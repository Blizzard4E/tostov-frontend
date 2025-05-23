<template>
	<div>
		<div class="max-w-[1200px] w-full m-auto grid gap-4 p-4">
			<div class="flex justify-between">
				<IconLogo />
				<NuxtLink
					href="/search"
					class="flex items-center gap-2 border rounded-full px-4 py-3 shadow-md max-w-[300px] w-full"
				>
					<Icon
						name="mingcute:search-2-fill"
						class="text-muted"
						:size="26"
					/>
					<span>Where to?</span>
				</NuxtLink>
				<div></div>
			</div>

			<slot />
		</div>
	</div>
</template>

<script lang="ts" setup></script>

<style></style>
