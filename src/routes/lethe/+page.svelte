<!--This page is for debugging purposes-->
<!--For the actual proxy, go to slate/+page.svelte-->
<script>
	import { onMount } from 'svelte';
	import { loadScript } from '$lib/lethe/loader';
	import { search } from '$lib/lethe/search';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
	import { createPrismController, setPrismTransport, getPrismController } from '$lib/lethe/prism';
	import { getOriginalUrl } from '$lib/lethe/decode';

	let query = $state('');
	let letheEngine = $state('scramjet');
	let ready = $state(false);
	let iframeEl;
	let polygon;
	let decodedURL = $state('');
	let url = $state('');
	let car = $state('libcurl');
	let connection;
	let prismController;
	let prismFrame;

	//  debugger is vibecoded
	let dependencies = $state([
		{ key: 'baremux', label: 'Charon', loaded: false },
		{ key: 'glassBundle', label: 'Glass bundle', loaded: false },
		{ key: 'glassConfig', label: 'Glass config', loaded: false },
		{ key: 'polygon', label: 'Polygon engine', loaded: false },
		{ key: 'scramjet', label: 'Glass controller', loaded: false },
		{ key: 'serviceWorker', label: 'Service worker', loaded: false },
		{ key: 'prism', label: 'SJ2 (prism)', loaded: false },
		{ key: 'transport', label: 'Car connection', loaded: false }
	]);

	function markLoaded(key) {
		for (const dependency of dependencies) {
			if (dependency.key === key) {
				dependency.loaded = true;
			}
		}
	}

	onMount(async () => {
		await loadScript('/charon/index.js');
		markLoaded('charon');

		await loadScript('/glass/glass.bundle.js');
		markLoaded('glassBundle');

		await loadScript('/glass/glass.config.js');
		markLoaded('glassConfig');

		await loadScript('/poly/polygon.all.js');
		markLoaded('polygon');

		polygon = createScramjetController();
		try {
			if (navigator.serviceWorker) {
				polygon.init();
				markLoaded('scramjet');
			} else {
				console.warn('Service workers not supported');
			}
		} catch (e) {
			console.error('Failed to initialize SJ:', e);
		}
		await loadScript('/prism/prism.js');
		await loadScript('/prism/prism.api.js');
		markLoaded('prism');

		connection = createConnection();
		await setCar(connection, car);
		markLoaded('transport');

		ready = true;
	});

	async function handleSubmit(event) {
		event.preventDefault();
		if (!ready) return;
		const fixedUrl = search(query);

		if (letheEngine === 'prism') {
			if (!prismController) prismController = await createPrismController(car);
			if (!prismFrame) prismFrame = prismController.createFrame(iframeEl);
			decodedURL = fixedUrl;
			prismFrame.go(fixedUrl);
			return;
		}

		if (letheEngine === 'uv') {
			url = window.__uv$config.prefix + window.__uv$config.encodeUrl(fixedUrl);
		} else {
			url = polygon.encodeUrl(fixedUrl);
		}
		decodedURL = getOriginalUrl(url);
		console.log('decoded is:' + decodedURL);
		iframeEl.src = url;
	}
	$effect(() => {
		if (ready && connection) {
			setCar(connection, car);
		}
		// Keep a live Prism controller's transport in sync with the car dropdown.
		if (getPrismController()) {
			setPrismTransport(car);
		}
	});
	async function testAlert() {
		await navigator.serviceWorker.register('/sw.js');
		markLoaded('serviceWorker');
	}
</script>

{#if !ready}
	<div class="loading-status">
		<p class="loading-title">Still loading…</p>
		{#each dependencies as dependency}
			<p class="loading-item">
				{#if dependency.loaded}
					<span class="loading-check">✔</span>
				{:else}
					<span class="loading-pending">•</span>
				{/if}
				{dependency.label}
			</p>
		{/each}
	</div>
{/if}

<form onsubmit={handleSubmit}>
	<input
		type="text"
		class="search-input search"
		placeholder="Search"
		bind:value={query}
		disabled={!ready}
		onfocus={testAlert}
	/>
	<p>{decodedURL}</p>
	<select bind:value={letheEngine} disabled={!ready}>
		<option value="scramjet">Scramjet</option>
		<option value="prism">Scramjet v2</option>
		<option value="uv">Ultraviolet</option>
	</select>
	<select bind:value={car} disabled={!ready}>
		<option value="libcurl">Libcurl</option>
		<option value="epoxy">Epoxy</option>
	</select>
</form>
<iframe bind:this={iframeEl} title=""></iframe>

<style>
	:global(body) {
		height: 100vh;
		width: 100vw;
		margin: 0;
		border: none;
		display: flex;
		flex-direction: column;
	}
	iframe {
		width: 100%;
		flex-grow: 1;
		border: none;
		margin: 0;
	}
	.loading-status {
		padding: 16px;
		font-family: var(--font-family-body);
		color: var(--color-text);
	}
	.loading-title {
		margin: 0 0 8px;
		font-weight: bold;
	}
	.loading-item {
		margin: 4px 0;
		color: var(--color-text-subtle);
	}
	.loading-check {
		color: var(--color-pin);
	}
	.loading-pending {
		color: var(--color-text-subtle);
	}
</style>
