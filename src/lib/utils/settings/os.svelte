<script>
	import '$lib/style/settings.css';
	import { saveSetting, loadSetting } from '$lib/utils/localspace.js';
	import uploadImg from '$lib/img/icons/upload.png';
	import { onMount } from 'svelte';

	const maxRecents = 3;
	const maxSize = 15 * 1024 * 1024;

	let recents = $state([]);
	let uploadError = $state(null);

	onMount(async () => {
		recents = await loadSetting('bgRecents', []);
	});

	function updateBG(bgURL) {
		saveSetting('bg', bgURL);
	}

	function readFileAsDataURL(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	async function handleUpload(event) {
		uploadError = null;
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			uploadError = 'Please choose an image file.';
			return;
		}
		if (file.size > maxSize) {
			uploadError = 'That image is too large (max 15MB).';
			return;
		}

		const dataURL = await readFileAsDataURL(file);
		recents = [dataURL, ...recents.filter((url) => url !== dataURL)].slice(0, maxRecents);
		saveSetting('bgRecents', $state.snapshot(recents));
		updateBG(dataURL);
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
		<p class="desc">Upscaled pinterest backgrounds</p>
		<div class="content">
			{#each bg as src}
				{@render Card(src)}
			{/each}
		</div>
	</div>
</div>
<div class="group">
	<div class="subGroup">
		<p class="subHeading">Upload</p>
		<p class="desc">Use gifs for live backgrounds</p>
		<div class="content">
			<label class="actionBtn">
				<img class="icons" src={uploadImg} alt="" />
				Upload Image
				<input type="file" accept="image/*" hidden onchange={handleUpload} />
			</label>
		</div>
		{#if uploadError}
			<p class="desc uploadError">{uploadError}</p>
		{/if}

		{#if recents.length}
			<p class="subHeading">Recent Uploads</p>
			<p class="desc">Click to reuse — your last {maxRecents} are kept</p>
			<div class="content">
				{#each recents as src}
					{@render Card(src)}
				{/each}
			</div>
		{/if}
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
	.uploadError {
		color: #ff6b6b;
	}
</style>
