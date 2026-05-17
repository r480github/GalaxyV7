<script>
	import { onMount } from 'svelte';
	import { loadScriptsSequential } from '$lib/lethe/loader';
	import { search } from '$lib/lethe/search';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
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

	onMount(async () => {
		await loadScriptsSequential([
			'/baremux/index.js',
			'/glass/glass.bundle.js',
			'/glass/glass.config.js',
			'/poly/polygon.all.js'
		]);
		polygon = createScramjetController();
		try {
			if (navigator.serviceWorker) {
				polygon.init();
				await navigator.serviceWorker.register('/sw.js');
			} else {
				console.warn('Service workers not supported');
			}
		} catch (e) {
			console.error('Failed to initialize SJ:', e);
		}
		connection = createConnection();
		await setCar(connection, car);

		ready = true;
	});

	async function handleSubmit(event) {
		event.preventDefault();
		if (!ready) return;
		const fixedUrl = search(query);
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
	});
</script>

<form onsubmit={handleSubmit}>
	<input
		type="text"
		class="search-input search"
		placeholder="Search"
		bind:value={query}
		disabled={!ready}
	/>
	<p>{decodedURL}</p>
	<select bind:value={letheEngine} disabled={!ready}>
		<option value="scramjet">scramjet</option>
		<option value="uv">ultraviolet</option>
	</select>
	<select bind:value={car} disabled={!ready}>
		<option value="libcurl">libcurl</option>
		<option value="epoxy">epoxy</option>
	</select>
</form>
<iframe bind:this={iframeEl} title="proxy"></iframe>

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
</style>
