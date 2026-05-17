<script>
	import { onMount } from 'svelte';
	import { loadScriptsSequential } from '$lib/proxy/loader';
	import { search } from '$lib/proxy/search';
	import { createConnection, setTransport } from '$lib/proxy/transport';
	import { createScramjetController } from '$lib/proxy/scramjet';
	import { getOriginalUrl } from '$lib/proxy/decode';

	let query = $state('');
	let proxyEngine = $state('scramjet');
	let ready = $state(false);
	let iframeEl;
	let scramjet;
	let decodedURL = $state('');
	let url = $state('');

	onMount(async () => {
		await loadScriptsSequential([
			'/baremux/index.js',
			'/glass/glass.bundle.js',
			'/glass/glass.config.js',
			'/poly/polygon.all.js'
		]);
		scramjet = createScramjetController();
		try {
			if (navigator.serviceWorker) {
				scramjet.init();
				await navigator.serviceWorker.register('/sw.js');
			} else {
				console.warn('Service workers not supported');
			}
		} catch (e) {
			console.error('Failed to initialize Scramjet:', e);
		}

		const connection = createConnection();
		await setTransport(connection, 'libcurl');

		ready = true;
	});

	async function handleSubmit(event) {
		event.preventDefault();
		if (!ready) return;
		const fixedUrl = search(query);

		if (proxyEngine === 'uv') {
			url = window.__uv$config.prefix + window.__uv$config.encodeUrl(fixedUrl);
		} else {
			url = scramjet.encodeUrl(fixedUrl);
		}
		decodedURL = getOriginalUrl(url);
		console.log('decoded is:' + decodedURL);
		iframeEl.src = url;
	}
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
	<select bind:value={proxyEngine} disabled={!ready}>
		<option value="scramjet">scramjet</option>
		<option value="uv">ultraviolet</option>
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
