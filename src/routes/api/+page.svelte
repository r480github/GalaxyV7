<!--

/api?url={}&type={}&notif{}

-->
<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { loadScriptsSequential } from '$lib/lethe/loader';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
	import { createPrismController, setPrismTransport, getPrismController } from '$lib/lethe/prism';

	let ready = $state(false);
	let iframeEl;
	let polygon;
	let car = $state('libcurlRaw');
	let connection;
	let prismController;
	let prismFrame;

	const apiUrl = $derived($page.url.searchParams.get('url'));
	const apiType = $derived($page.url.searchParams.get('type'));

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
		await setCar(connection, car);

		ready = true;
		handleSubmit(apiUrl, apiType);
	});

	async function handleSubmit(url, type) {
		if (type === 'prism') {
			if (!prismController) prismController = await createPrismController(car);
			if (!prismFrame) prismFrame = prismController.createFrame(iframeEl);
			prismFrame.go(url);
			return;
		}

		if (type === 'uv') {
			// @ts-ignore
			url = window.__uv$config.prefix + window.__uv$config.encodeUrl(fixedUrl);
			iframeEl.src = url;
		}
		if (type === 'polygon') {
			url = polygon.encodeUrl(url);
			iframeEl.src = url;
		} else {
			if (!prismController) prismController = await createPrismController(car);
			if (!prismFrame) prismFrame = prismController.createFrame(iframeEl);
			prismFrame.go(url);
		}
	}

	$effect(() => {
		if (ready && connection) {
			setCar(connection, car);
		}
		if (getPrismController()) {
			setPrismTransport(car);
		}
	});
</script>

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
</style>
