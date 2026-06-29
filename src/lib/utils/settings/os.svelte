<script>
	import '$lib/style/settings.css';
	import { saveSetting } from '$lib/utils/localspace.js';

	function updateBG(bgURL) {
		saveSetting('bg', bgURL);
	}
	const modules = import.meta.glob('$lib/img/bg/*', {
		eager: true,
		query: '?url',
		import: 'default'
	});
	const bg = Object.values(modules);
</script>

<h1>OS</h1>
{#snippet Card(url)}
	<button
		class="buttonCard"
		onclick={() => {
			updateBG(url);
		}}><img class="card" src={url} loading="lazy" decoding="async" /></button
	>
{/snippet}
<div class="group">
	<div class="subGroup">
		<p class="subHeading">Backgrounds</p>
		<p class="desc">Use gifs for live backgrounds</p>
		<div class="content">
			{#each bg as src}
				{@render Card(src)}
			{/each}
		</div>
	</div>
</div>

<style>
	.buttonCard {
		background: transparent;
		height: 170px;
		width: 250px;
		overflow: hidden;
		cursor: pointer;
		border-radius: 8px;
	}
	.card {
		width: 100%;
		image-rendering: optimizeSpeed;
		background: transparent;
		object-fit: fill;
		aspect-ratio: 16 / 9;
		border-radius: 8px;
	}
</style>
