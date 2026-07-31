<!--
/api?url={}&type={}&notif{}&transport={}&wisp={}

For the API, use:
prism for SJ2
polygon for SJ
glass for UV

transport: libcurl, libcurlRaw (default), or epoxy
wisp: wss://...
url: https:// is added when missing
-->

<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { loadScriptsSequential } from '$lib/lethe/loader';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
	import { createPrismController, setPrismTransport, getPrismController } from '$lib/lethe/prism';
	function normalizeUrl(raw) {
		const trimmed = (raw ?? '').trim();
		if (!trimmed) return null;
		const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
		try {
			const parsed = new URL(withProtocol);
			if (!parsed.hostname.includes('.')) return null;
			return parsed.href;
		} catch {
			return null;
		}
	}

	const api = '/api?url={}&type={}';
	let ready = $state(false);
	let iframeEl;
	let polygon;
	let car = $state('libcurlRaw');
	let connection;
	let prismController;
	let prismFrame;

	const apiUrl = $derived(normalizeUrl($page.url.searchParams.get('url')));
	const apiType = $derived($page.url.searchParams.get('type'));
	const apiTransport = $derived($page.url.searchParams.get('transport'));
	const apiWisp = $derived($page.url.searchParams.get('wisp') || undefined);

	onMount(async () => {
		await loadScriptsSequential([
			'/charon/index.js',
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
		if (['libcurl', 'libcurlRaw', 'epoxy'].includes(apiTransport)) car = apiTransport;
		await setCar(connection, car, apiWisp);

		ready = true;
		handleSubmit(apiUrl, apiType);
	});

	async function handleSubmit(url, type) {
		if (apiUrl === null) return;

		if (type === 'glass') {
			// @ts-ignore
			iframeEl.src = window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
			return;
		}
		if (type === 'polygon') {
			iframeEl.src = polygon.encodeUrl(url);
			return;
		}
		if (!prismController) prismController = await createPrismController(car, apiWisp);
		if (!prismFrame) prismFrame = prismController.createFrame(iframeEl);
		prismFrame.go(url);
	}

	$effect(() => {
		if (ready && connection) {
			setCar(connection, car, apiWisp);
		}
		if (getPrismController()) {
			setPrismTransport(car, apiWisp);
		}
	});
</script>

<iframe bind:this={iframeEl} title="" style="opacity: {apiUrl ? '100%' : '0'};"></iframe>
<p>{api}</p>
<p class="types">types: <br />prism(sjv2) <br />polygon(sj) <br /> glass(uv)</p>

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
		position: absolute;
		height: 100vh;
		background-color: white;
	}
	.types {
		margin-left: 20px;
	}
</style>
