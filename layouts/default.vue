<template>
	<div>
		<div class="max-w-[1200px] w-full m-auto grid gap-4 p-4">
			<IconLogo />
			<Input :placeholder="'Where to?'" :is-search="true" />

			<slot />
		</div>
	</div>
</template>

<script lang="ts" setup></script>

<style></style>
