<template>
	<div>
		<h1>{{ location.name_en }}</h1>
	</div>
</template>

<script lang="ts" setup>
import type { Location } from "#imports";

defineProps<{
	location: Location;
}>();
</script>

<style></style>
