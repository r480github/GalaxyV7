<script>
	import apps from '$lib/a/a.json';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadScriptsSequential } from '$lib/lethe/loader';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
	import { getOriginalUrl } from '$lib/lethe/decode';
	import search from '$lib/img/icons/search.png';
	import pin from '$lib/img/icons/pin.png';
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
	let activeGenre = $state('');
	let pins = $state(loadPins());
	let ready = $state(false);
	let iframeEl;
	let polygon;
	let decodedURL = $state('');
	let car = $state('libcurl');
	let connection;
	let frameDisplay = $state('none');
	let location = '/img/';
	let overflow = $state(false);

	const genres = $derived.by(() => {
		// Collect each app's genre. A Set automatically ignores duplicates.
		const usedGenres = new Set();
		for (const app of apps) {
			usedGenres.add(app.genre);
		}

		// Keep our preferred genres, but only the ones some app actually uses.
		const ordered = genreOrder.filter((genre) => usedGenres.has(genre));

		// Any remaining genres that aren't in our preferred list, sorted A-Z.
		const extras = Array.from(usedGenres)
			.filter((genre) => !genreOrder.includes(genre))
			.sort();

		// Preferred genres first, then the extras.
		return ordered.concat(extras);
	});

	const filtered = $derived.by(() => {
		const queryText = query.trim().toLowerCase();
		return apps.filter((app) => {
			// With no search text typed, every app counts as a match.
			const noQuery = queryText === '';
			const nameMatches = app.name.toLowerCase().includes(queryText);
			const genreMatches = app.genre.toLowerCase().includes(queryText);
			const matchesQuery = noQuery || nameMatches || genreMatches;

			// With no genre selected, every app passes the genre filter.
			const matchesGenre = activeGenre === '' || app.genre === activeGenre;

			return matchesQuery && matchesGenre;
		});
	});

	const pinnedApps = $derived(filtered.filter((app) => pins.includes(app.name)));

	function loadPins() {
		if (!browser) return [];
		try {
			// Read the saved pins. If nothing is stored yet, use an empty list "[]".
			let stored = localStorage.getItem(pinsKey);
			if (!stored) {
				stored = '[]';
			}
			const parsed = JSON.parse(stored);

			// Only trust the saved value if it's actually an array.
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
			// Already pinned, so remove it from the list.
			pins = pins.filter((pinnedName) => pinnedName !== name);
		} else {
			// Not pinned yet, so add it to the end of the list.
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

	function closeFrame() {
		frameDisplay = 'none';
		overflow = false;
		iframeEl.src = '';
	}

	async function handleSubmit(url, type) {
		frameDisplay = 'block';
		overflow = true;
		if (!ready) return;
		if (type === 'uv') {
			// @ts-ignore
			url = window.__uv$config.prefix + window.__uv$config.encodeUrl(fixedUrl);
		} else {
			url = polygon.encodeUrl(url);
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

<div
	class="goBackBtn"
	title="Go Back"
	style="top: {overflow ? '10px' : '-80px'}"
	onclick={closeFrame}
>
	⬅
</div>
<iframe bind:this={iframeEl} title="proxy" style="display: {frameDisplay};"></iframe>

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
	<button class="pill" class:active={activeGenre === ''} onclick={() => (activeGenre = '')}>
		All
	</button>
	{#each genres as g (g)}
		<button class="pill" class:active={activeGenre === g} onclick={() => (activeGenre = g)}>
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

	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		max-width: 420px;
		margin: 28px 0 18px 24px;
		padding: 12px 18px;
		background: var(--overlay-hover);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		backdrop-filter: blur(12px);
		transition: border-color 0.2s;
	}
	.search:focus-within {
		border-color: var(--color-border-strong);
	}
	.searchIcon {
		flex-shrink: 0;
		height: 16px;
		width: auto;
		filter: brightness(0.6);
	}
	.search input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--color-text);
		font-family: var(--font-family-body);
		font-size: 15px;
	}
	.search input::placeholder {
		color: var(--color-text-subtle);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0 24px 24px;
	}
	.pill {
		padding: 8px 18px;
		background: var(--overlay-hover);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		color: var(--color-text-muted);
		font-family: var(--font-family-body);
		font-size: 14px;
		cursor: pointer;
		backdrop-filter: blur(12px);
		transition:
			background 0.2s,
			color 0.2s;
	}
	.pill:hover {
		background: var(--overlay-hover-strong);
		color: var(--color-text);
	}
	.pill.active {
		background: var(--color-white);
		color: var(--color-black);
		border-color: var(--color-white);
	}

	.sectionHeader {
		margin: 8px 24px;
		font-family: var(--font-family-heading);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.empty {
		padding: 48px 24px;
		text-align: center;
		font-family: var(--font-family-body);
		color: var(--color-text-subtle);
	}

	.container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 18px;
		padding: 0 24px 24px;
	}

	.appDiv {
		position: relative;
		aspect-ratio: 16 / 9;
		border-radius: 16px;
		overflow: hidden;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease;
	}
	.appDiv:hover {
		transform: translateY(-4px);
		border-color: var(--color-border-hover);
	}
	.appImg {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.appMeta {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 28px 16px 12px;
		background: linear-gradient(to top, var(--color-scrim-strong), transparent);
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	.appDiv:hover .appMeta {
		opacity: 1;
	}
	.appName {
		font-family: var(--font-family-heading);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-white);
	}
	.appGenre {
		font-family: var(--font-family-body);
		font-size: 12px;
		color: var(--color-text-muted);
	}

	.pinBtn {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: var(--color-scrim-medium);
		cursor: pointer;
		opacity: 0;
		backdrop-filter: blur(6px);
		transition:
			opacity 0.2s ease,
			background 0.2s ease;
	}
	.pinIcon {
		height: 16px;
		width: auto;
		filter: brightness(0.95);
	}
	.appDiv:hover .pinBtn {
		opacity: 1;
	}
	.pinBtn:hover {
		background: var(--color-scrim-strong);
	}
	.pinBtn.pinned {
		opacity: 1;
		background: var(--color-pin);
	}

	iframe {
		top: 0;
		left: 0;
		position: fixed;
		height: 100vh;
		width: 100%;
		flex-grow: 1;
		border: none;
		margin: 0;
	}
	.goBackBtn {
		position: fixed;
		right: -30px;
		width: 60px;
		height: 60px;
		background-color: var(--color-surface-3);
		color: var(--color-white);
		font-size: 60px;
		text-align: center;
		line-height: 60px;
		border-radius: 50%;
		cursor: pointer;
		z-index: 9999;
		transition: top 0.3s ease;
		transition: all 0.3s;
	}
	.goBackBtn:hover {
		right: 10px;
	}
</style>
