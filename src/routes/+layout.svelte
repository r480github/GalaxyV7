<script>
	import favicon from '$lib/assets/favicon.png';
	import '$lib/style/variables.css';
	import '$lib/style/themes.css';
	import '$lib/style/assets.css';
	import { applySavedTheme } from '$lib/utils/theme.js';
	import { onMount } from 'svelte';
	let { children } = $props();

	// Runs in every route/frame, so the saved theme is applied app-wide on load.
	onMount(applySavedTheme);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Home - Classroom</title>
</svelte:head>

{@render children()}
