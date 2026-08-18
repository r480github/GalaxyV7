<!--
/api?url={}&type={}&transport={}&wisp={}&notif={}&autoSW={}

url:       required, https:// is added when missing, must contain a dot
type:      prism (SJv2, default), polygon (SJ), glass (UV)
transport: libcurlRaw (default), libcurl, epoxy
wisp:      wss://..., defaults to the server's own wisp
notif:     read by /os when it opens this page in a window, not by /api itself
autoSW:    true loads on its own, false waits for a click first
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

	const api = '/api?url={}&type={}&transport={}&wisp={}&notif={}&autoSW={}';
	const params = [
		['url', 'required', 'https:// added when missing'],
		['type', 'prism', 'prism (sjv2), polygon (sj), glass (uv)'],
		['transport', 'libcurlRaw', 'libcurlRaw, libcurl(dont use), epoxy'],
		['wisp', 'this server', 'wss://... to use another wisp'],
		['notif', 'none', 'toast text, shown by /os when it opens the window'],
		['autoSW', 'true', 'false shows a button and loads on click instead']
	];
	let ready = $state(false);
	let showButton = $state(false);
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
	const apiAutoSW = $derived($page.url.searchParams.get('autoSW') || 'true');
	const apiHost = $derived(apiUrl ? new URL(apiUrl).hostname : '');

	onMount(async () => {
		// No url is the docs view - nothing to load, so nothing to register.
		if (apiUrl === null) return;

		await loadScriptsSequential([
			'/charon/index.js',
			'/glass/glass.bundle.js',
			'/glass/glass.config.js',
			'/poly/polygon.all.js'
		]);
		polygon = createScramjetController();

		// A worker that registers itself on load, with nothing the user did in
		// between, is what Lightspeed picks up on. autoSW=false leaves all of it
		// to the button so the click is what starts everything.
		if (apiAutoSW == 'true') {
			await start();
		} else {
			showButton = true;
		}
	});

	async function start() {
		showButton = false;
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
	}

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

{#if showButton}
	<div class="start">
		<button onclick={start}>Load {apiHost}</button>
	</div>
{/if}

<div class="guide">
	<p class="route">{api}</p>
	<dl>
		{#each params as [name, fallback, notes]}
			<dt>{name}</dt>
			<dd><span class="fallback">{fallback}</span> — {notes}</dd>
		{/each}
	</dl>
	<p class="example">/api?url=example.com&amp;type=prism&amp;transport=libcurlRaw</p>
</div>

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
	.guide {
		margin: 20px;
		font-family: monospace;
		line-height: 1.6;
		z-index: -50;
	}
	.route,
	.example {
		font-weight: bold;
	}
	.example {
		opacity: 0.6;
	}
	dl {
		margin: 12px 0;
	}
	dt {
		font-weight: bold;
	}
	dd {
		margin: 0 0 6px 20px;
	}
	.fallback {
		opacity: 0.6;
	}
	.start {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: white;
	}
	.start button {
		font-family: monospace;
		font-size: 1rem;
		padding: 10px 18px;
		border: 1px solid black;
		background: none;
		cursor: pointer;
	}
</style>
