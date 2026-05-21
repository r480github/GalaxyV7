<script>
	import { onMount } from 'svelte';
	import { loadScript } from '$lib/lethe/loader';
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

	// Runtime bundles loaded as <script> tags, with friendly names for alerts.
	const scripts = [
		{ src: '/baremux/index.js', name: 'baremux' },
		{ src: '/glass/glass.bundle.js', name: 'ultraviolet (glass bundle)' },
		{ src: '/glass/glass.config.js', name: 'ultraviolet (glass config)' },
		{ src: '/poly/polygon.all.js', name: 'scramjet (polygon)' }
	];

	// Worker/SW files aren't <script> tags, so we just check they're reachable.
	async function ensureReachable(url, name) {
		try {
			const res = await fetch(url, { method: 'HEAD' });
			if (!res.ok) throw new Error(`status ${res.status}`);
		} catch {
			alert(`${name} didn't connect (${url})`);
			return false;
		}
		return true;
	}

	onMount(async () => {
		// Load each runtime script in order; alert + bail if any fails.
		for (const { src, name } of scripts) {
			try {
				await loadScript(src);
			} catch {
				alert(`${name} didn't load (${src})`);
				return;
			}
		}

		// baremux spawns /baremux/worker.js as a Web Worker (not a <script>),
		// so check it's reachable separately before we rely on it.
		if (!(await ensureReachable('/baremux/worker.js', 'baremux worker'))) return;

		polygon = createScramjetController();
		try {
			if (navigator.serviceWorker) {
				polygon.init();
				await navigator.serviceWorker.register('/sw.js');
			} else {
				alert('Service workers are not supported in this browser');
			}
		} catch (e) {
			console.error('Failed to initialize SJ:', e);
			alert("service worker (sw.js) didn't register");
		}

		connection = createConnection();
		try {
			await setCar(connection, car);
		} catch (e) {
			console.error('Failed to set transport:', e);
			alert("transport (car) didn't connect");
			return;
		}

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
			setCar(connection, car).catch((e) => {
				console.error('Failed to switch transport:', e);
				alert("transport (car) didn't switch");
			});
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
