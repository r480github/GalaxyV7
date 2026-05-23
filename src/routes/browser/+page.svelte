<script>
	import '$lib/style/browser.css';
	import back from '$lib/img/icons/left-arrow.png';
	import reload from '$lib/img/icons/reload.png';
	import forward from '$lib/img/icons/right-arrow.png';
	import setting from '$lib/img/icons/more.png';
	import Tab from '$lib/utils/browser/tab.svelte';
	import Iframe from '$lib/utils/browser/iframe.svelte';
	import { loadSetting } from '$lib/utils/localstorage.js';
	import {
		tabID,
		deleteTab,
		activeTab,
		reloadSignal,
		goBackSignal,
		goForwardSignal
	} from '$lib/stores/index.js';
	import { onMount } from 'svelte';
	import { loadScriptsSequential } from '$lib/lethe/loader';
	import { search } from '$lib/lethe/search';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';

	let tabs = $state([]);
	let frames = $state([]);
	let query = $state('');
	let inputEl;
	let tabCounter = 0;
	let inputFocused = $state(false);
	let letheEngine = $state(loadSetting('lethe', 'sj'));
	let ready = $state(false);
	let polygon;
	let customWisp = $state(loadSetting('customWisp', ''));
	let searchEngine = $state(loadSetting('searchEngine', 'ddg'));
	let car = $state(loadSetting('car', 'libcurl'));
	let connection;
	let activeFrame = $derived(frames.find((frame) => frame.id === $activeTab));
	$effect(() => {
		if ($deleteTab) {
			tabs = tabs.filter((tab) => tab.id !== $deleteTab);
			frames = frames.filter((frame) => frame.id !== $deleteTab);
			if ($deleteTab == $activeTab && tabs.length > 0) {
				const lastTab = tabs[tabs.length - 1];
				$activeTab = lastTab.id;
				$deleteTab = null;
			} else {
				$deleteTab = null;
			}
		}
		if ($activeTab) {
			$tabID = $activeTab;
		}
	});
	function addTab() {
		// @ts-ignore
		$tabID = Date.now();
		$activeTab = $tabID;
		const newTab = {
			id: $tabID
		};
		const newFrame = {
			id: $tabID,
			url: null,
			displayUrl: '',
			title: 'New Tab'
		};
		let updatedTabs = [];
		let updatedFrames = [];
		for (let i = 0; i < tabs.length; i++) {
			let existingTab = tabs[i];
			let existingFrame = frames[i];
			updatedFrames.push(existingFrame);
			updatedTabs.push(existingTab);
		}
		updatedTabs.push(newTab);
		updatedFrames.push(newFrame);
		tabs = updatedTabs;
		frames = updatedFrames;
		tabCounter++;
	}
	addTab();
	onMount(async () => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/eruda';
		document.head.appendChild(script);

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
		} catch (error) {
			console.error('Failed to initialize SJ:', error);
		}
		connection = createConnection();
		await setCar(connection, car, customWisp);

		ready = true;
	});

	async function handleSubmit(event) {
		event.preventDefault();
		if (!ready || !activeFrame) {
			return;
		}
		const fixedUrl = search(query, searchEngine);
		let encoded;
		if (letheEngine === 'uv') {
			// @ts-ignore
			encoded = window.__uv$config.prefix + window.__uv$config.encodeUrl(fixedUrl);
		} else {
			encoded = polygon.encodeUrl(fixedUrl);
		}
		activeFrame.url = encoded;
		inputEl?.blur();
	}

	function handleNavigate(id, { url, title }) {
		const frame = frames.find((frame) => frame.id === id);
		if (!frame) {
			return;
		}
		frame.displayUrl = url;
		frame.title = title;
	}

	$effect(() => {
		const current = activeFrame?.displayUrl ?? '';
		if (!inputFocused) {
			query = current;
		}
	});
	$effect(() => {
		if (ready && connection) {
			setCar(connection, car, customWisp);
		}
	});

	function goBack() {
		$goBackSignal = $activeTab;
	}
	function goForward() {
		$goForwardSignal = $activeTab;
	}
	function reloadTab() {
		$reloadSignal = $activeTab;
	}

	let settingsOpen = $state(false);

	function toggleSettings() {
		settingsOpen = !settingsOpen;
	}
	function closeSettings() {
		settingsOpen = false;
	}

	function openInNewWindow() {
		if (!activeFrame || !activeFrame.url) {
			return;
		}
		window.open(activeFrame.url, '_blank', 'noopener');
		closeSettings();
	}

	function toggleFullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
		closeSettings();
	}

	$effect(() => {
		localStorage.setItem('lethe', letheEngine);
		localStorage.setItem('car', car);
		localStorage.setItem('customWisp', customWisp);
		localStorage.setItem('searchEngine', searchEngine);
	});
</script>

<div class="tab-bar">
	{#each tabs as tab (tab.id)}
		{@const frame = frames.find((frame) => frame.id === tab.id)}
		<Tab id={tab.id} title={frame?.title ?? 'New Tab'} displayUrl={frame?.displayUrl ?? ''} />
	{/each}
	<button class="newTab" onclick={addTab}>+</button>
</div>
<div class="nav-bar">
	<div class="nav-left">
		<div class="button" onclick={goBack}>
			<img src={back} alt="back" class="nav-icon" />
		</div>
		<div class="button" onclick={goForward}>
			<img src={forward} alt="forward" class="nav-icon" />
		</div>
		<div class="button" onclick={reloadTab}>
			<img src={reload} alt="reload" class="nav-icon" />
		</div>
	</div>
	<div class="nav-middle">
		<form onsubmit={handleSubmit}>
			<input
				type="text"
				class="search-input search"
				placeholder="Search or enter address"
				bind:value={query}
				bind:this={inputEl}
				onfocus={() => {
					inputFocused = true;
				}}
				onblur={() => {
					inputFocused = false;
				}}
				disabled={!ready}
			/>
			<!-- <select bind:value={letheEngine} disabled={!ready}>
				<option value="scramjet">scramjet</option>
				<option value="uv">ultraviolet</option>
			</select>
			<select bind:value={car} disabled={!ready}>
				<option value="libcurl">libcurl</option>
				<option value="epoxy">epoxy</option>
			</select> -->
		</form>
	</div>
	<div class="nav-right">
		<div class="button" onclick={toggleSettings}>
			<img src={setting} alt="settings" class="nav-icon" />
		</div>
		{#if settingsOpen}
			<div class="settings-overlay" onclick={closeSettings}></div>
			<div class="settings-dropdown">
				<button class="menuBtn" onclick={addTab}>New Tab</button>
				<!-- <button class="menuBtn">Bookmarks</button> -->
				<div class="break"></div>
				<p>Proxy</p>
				<select bind:value={letheEngine} disabled={!ready}>
					<option value="sj">scramjet</option>
					<option value="uv">ultraviolet</option>
				</select>
				<p>Transport</p>
				<select bind:value={car} disabled={!ready}>
					<option value="libcurl">libcurl</option>
					<option value="epoxy">epoxy</option>
				</select>
				<p>Wisp</p>
				<input bind:value={customWisp} placeholder="wss://..." type="text" />
				<p>Search Engine</p>
				<select bind:value={searchEngine}>
					<option value="ddg">DuckDuckGo</option>
					<option value="brave">Brave</option>
					<option value="google">Google</option>
				</select>
				<div class="break"></div>
				<button onclick={openInNewWindow}>Open in new window</button>
				<div class="break"></div>
				<button onclick={toggleFullscreen}>Full Screen</button>
				<button onclick={window.eruda.init()}>Inspect Element</button>
			</div>
		{/if}
	</div>
</div>
<div class="frameContainer">
	{#each frames as frame (frame.id)}
		<Iframe id={frame.id} src={frame.url} onnavigate={(info) => handleNavigate(frame.id, info)} />
	{/each}
</div>
