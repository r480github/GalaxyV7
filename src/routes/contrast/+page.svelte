<script>
	import { onMount } from 'svelte';
	import b1g from '$lib/img/bg/0027.jpg';
	import getContrast from '$lib/utils/contrast.js';
	let fg = $state('#ffffff');
	onMount(async () => {
		fg = await getContrast(b1g);
		console.log(fg);
	});
</script>

<main
	style="background-image:url({b1g});
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
"
>
	<span class="label" style="color:{fg}">The quick brown fox</span>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		font-family: system-ui, sans-serif;
		background: #0f0f17;
		color: #e8e8e8;
		padding: 2rem;
	}

	.label {
		font-size: 1.5rem;
		font-weight: 600;
	}
</style>
