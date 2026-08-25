<script>
	import apps from '$lib/a/a.json';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadScriptsSequential } from '$lib/lethe/loader';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
	import { createPrismController, setPrismTransport, getPrismController } from '$lib/lethe/prism';

	import search from '$lib/img/icons/search.png';
	import pin from '$lib/img/icons/pin.png';
	import '$lib/style/apps.css';
	const pinsKey = 'galaxy_appPins';
	const genreOrder = [
		'AI',
		'Shopping',
		'Streaming',
		'Cloud Gaming',
		'Development',
		'Social Media',
		'Design',
		'Other'
	];

	let query = $state('');
	let activeGenres = $state([]);
	let pins = $state(loadPins());
	let ready = $state(false);
	let iframeEl;
	let polygon;
	let car = $state('libcurlRaw');
	let prismController;
	let prismFrame;

	let connection;
	let frameDisplay = $state('none');
	let location = '/img/';
	let overflow = $state(false);

	const genres = $derived.by(() => {
		const usedGenres = new Set();
		for (const app of apps) {
			usedGenres.add(app.genre);
		}

		const ordered = genreOrder.filter((genre) => usedGenres.has(genre));

		const extras = Array.from(usedGenres)
			.filter((genre) => !genreOrder.includes(genre))
			.sort();

		return ordered.concat(extras);
	});

	const filtered = $derived.by(() => {
		const queryText = query.trim().toLowerCase();
		return apps.filter((app) => {
			const noQuery = queryText === '';
			const nameMatches = app.name.toLowerCase().includes(queryText);
			const genreMatches = app.genre.toLowerCase().includes(queryText);
			const matchesQuery = noQuery || nameMatches || genreMatches;

			const matchesGenre = activeGenres.length === 0 || activeGenres.includes(app.genre);

			return matchesQuery && matchesGenre;
		});
	});

	const pinnedApps = $derived(filtered.filter((app) => pins.includes(app.name)));

	function toggleGenre(genre) {
		if (activeGenres.includes(genre)) {
			activeGenres = activeGenres.filter((activeGenre) => activeGenre !== genre);
		} else {
			activeGenres = activeGenres.concat([genre]);
		}
	}

	function loadPins() {
		if (!browser) return [];
		try {
			let stored = localStorage.getItem(pinsKey);
			if (!stored) {
				stored = '[]';
			}
			const parsed = JSON.parse(stored);

			if (Array.isArray(parsed)) {
				return parsed;
			}
			return [];
		} catch {
			return [];
		}
	}

	function isPinned(name) {
		return pins.includes(name);
	}

	function togglePin(name) {
		if (pins.includes(name)) {
			pins = pins.filter((pinnedName) => pinnedName !== name);
		} else {
			pins = pins.concat([name]);
		}

		if (browser) {
			try {
				localStorage.setItem(pinsKey, JSON.stringify(pins));
			} catch {}
		}
	}

	$effect(() => {
		document.body.style.overflow = overflow ? 'hidden' : 'auto';
	});

	onMount(async () => {
		await loadScriptsSequential([
			'/charon/index.js',
			'/glass/glass.bundle.js',
			'/glass/glass.config.js',
			'/poly/polygon.all.js'
		]);
		polygon = createScramjetController();
		connection = createConnection();
		await setCar(connection, car);

		ready = true;
	});

	function closeFrame() {
		frameDisplay = 'none';
		overflow = false;
		iframeEl.src = '';
	}
	async function handleSubmit(url, type) {
		try {
			if (navigator.serviceWorker) {
				polygon.init();
				await navigator.serviceWorker.register('/servy.js');
			} else {
				console.warn('Service workers not supported');
			}
		} catch (e) {
			console.error('Failed to initialize SJ:', e);
		}
		frameDisplay = 'block';
		overflow = true;
		if (!ready) return;
		if (type === 'prism') {
			if (!prismController) prismController = await createPrismController(car);
			if (!prismFrame) prismFrame = prismController.createFrame(iframeEl);
			prismFrame.go(url);
			return;
		}

		if (type === 'uv') {
			// @ts-ignore
			iframeEl.src = window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
		} else if (type === 'polygon') {
			iframeEl.src = polygon.encodeUrl(url);
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

<div
	class="goBackBtn"
	title="Go Back"
	style="top: {overflow ? '10px' : '-80px'}"
	onclick={closeFrame}
>
	⬅
</div>
<iframe bind:this={iframeEl} title="" style="display: {frameDisplay};"></iframe>

{#snippet appCard(app)}
	<div class="appDiv">
		<button
			class="pinBtn"
			class:pinned={isPinned(app.name)}
			title={isPinned(app.name) ? 'Unpin' : 'Pin'}
			onclick={(e) => {
				e.stopPropagation();
				togglePin(app.name);
			}}
		>
			<img src={pin} alt="" class="pinIcon" />
		</button>
		<img
			src={location + app.image}
			alt={app.name}
			class="appImg"
			loading="lazy"
			onclick={() => handleSubmit(app.url, app.type)}
		/>
		<div class="appMeta" onclick={() => handleSubmit(app.url, app.type)}>
			<div></div>
			<span class="appName">{app.name}</span>
			<span class="appGenre">{app.genre}</span>
		</div>
	</div>
{/snippet}

<div class="search">
	<img src={search} alt="" class="searchIcon" />
	<input type="text" placeholder="Search Apps or Tags" bind:value={query} autocomplete="off" />
</div>

<div class="filters">
	<button class="pill" class:active={activeGenres.length === 0} onclick={() => (activeGenres = [])}>
		All
	</button>
	{#each genres as g (g)}
		<button class="pill" class:active={activeGenres.includes(g)} onclick={() => toggleGenre(g)}>
			{g}
		</button>
	{/each}
</div>

{#if pinnedApps.length > 0}
	<div class="sectionHeader">Pinned</div>
	<div class="container">
		{#each pinnedApps as app (app.name)}
			{@render appCard(app)}
		{/each}
	</div>
	<div class="sectionHeader">All Apps</div>
{/if}

{#if filtered.length === 0}
	<p class="empty">No apps match your search.</p>
{:else}
	<div class="container">
		{#each filtered as app (app.name)}
			{@render appCard(app)}
		{/each}
	</div>
{/if}

<style>
	:global(body) {
		background: var(--color-bg);
	}
</style>
