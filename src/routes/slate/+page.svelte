<script>
	import '$lib/style/browser.css';
	import back from '$lib/img/icons/left-arrow.png';
	import reload from '$lib/img/icons/reload.png';
	import forward from '$lib/img/icons/right-arrow.png';
	import setting from '$lib/img/icons/more.png';
	import Tab from '$lib/utils/browser/tab.svelte';
	import Iframe from '$lib/utils/browser/iframe.svelte';
	import Home from '$lib/utils/browser/home.svelte';
	import { loadSetting, saveSetting } from '$lib/utils/localspace.js';
	import star from '$lib/img/icons/star.png';
	import searchIcon from '$lib/img/icons/search.png';
	import extensions from '$lib/img/icons/puzzle.png';
	import {
		deleteTab,
		activeTab,
		reloadSignal,
		goBackSignal,
		goForwardSignal,
		slotsDragged,
		draggedOverLeft,
		draggedOverRight,
		isTabDragging
	} from '$lib/stores/index.js';
	import { onMount, tick } from 'svelte';
	import { loadScript, loadScriptsSequential } from '$lib/lethe/loader';
	import { search } from '$lib/lethe/search';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
	import { createPrismController, setPrismTransport, getPrismController } from '$lib/lethe/prism';
	import { enablePopupInterceptor } from '$lib/lethe/reflux';
	import { subscribeSettings } from '$lib/utils/settingsSync.js';
	let tabs = $state([]);
	let frames = $state([]);
	let query = $state('');
	let inputEl;
	let tabCounter = 0;
	let inputFocused = $state(false);
	let hydrated = $state(false);
	let letheEngine = $state('sj2');
	let ready = $state(false);
	let polygon;
	let prismController;
	let sjFrame;
	let customWisp = $state('');
	let searchEngine = $state('brave');
	let car = $state('libcurl');
	let bookmarks = $state([]);
	let connection;
	let activeFrame = $derived(frames.find((frame) => frame.id === $activeTab));
	let draggedTab = null;
	let tabID = null;
	let LastPopupIntState = $state(true);

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
			tabID = $activeTab;
		}
	});

	function addTab() {
		// @ts-ignore
		tabID = Date.now();
		// @ts-ignore
		$activeTab = tabID;
		const newTab = {
			id: tabID
		};
		const newFrame = {
			id: tabID,
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
	onMount(async () => {
		LastPopupIntState = popupInterceptor;
		addTab();

		// hydrate saved settings
		const [lethe, savedCar, wisp, engine, marks, intercept, LastPopupIntStateX] = await Promise.all(
			[
				loadSetting('lethe', 'sj2'),
				loadSetting('car', 'libcurl'),
				loadSetting('customWisp', ''),
				loadSetting('searchEngine', 'brave'),
				loadSetting('bookmarks', [], JSON.parse),
				loadSetting('popupInterceptor', true, (raw) => raw === 'true'),
				loadSetting('LastPopupIntState', true)
			]
		);
		letheEngine = lethe;
		car = savedCar;
		customWisp = wisp;
		searchEngine = engine;
		bookmarks = marks;
		LastPopupIntState = LastPopupIntStateX;
		popupInterceptor = LastPopupIntState; //intercept
		hydrated = true;

		await loadScriptsSequential([
			'/charon/index.js',
			'/glass/glass.bundle.js',
			'/glass/glass.config.js',
			'/poly/polygon.all.js'
		]);
		polygon = createScramjetController();
		connection = createConnection();
		await setCar(connection, car, customWisp);
		await enablePopupInterceptor();
		ready = true;
	});

	onMount(() =>
		subscribeSettings((key, value) => {
			if (key === 'lethe') letheEngine = value;
			else if (key === 'car') car = value;
			else if (key === 'customWisp') customWisp = value;
			else if (key === 'searchEngine') searchEngine = value;
		})
	);

	async function ensurePrism() {
		if (sjFrame) return sjFrame;
		prismController = await createPrismController(car, customWisp || undefined);
		sjFrame = prismController.createFrame();
		return sjFrame;
	}
	function prismEncode(fixedUrl) {
		// @ts-ignore
		return window.$scramjet.rewriteUrl(fixedUrl, sjFrame.context, {
			origin: new URL(location.href),
			base: new URL(location.href)
		});
	}

	async function navigateTo(rawQuery) {
		if (!ready || !activeFrame) {
			return;
		}
		const fixedUrl = search(rawQuery, searchEngine);
		let encoded;
		if (letheEngine === 'sj2') {
			await ensurePrism();
			encoded = prismEncode(fixedUrl);
		} else if (letheEngine === 'uv') {
			// @ts-ignore
			encoded = window.__uv$config.prefix + window.__uv$config.encodeUrl(fixedUrl);
		} else {
			encoded = polygon.encodeUrl(fixedUrl);
		}
		activeFrame.url = encoded;
		if (rawQuery.includes('discord')) {
			LastPopupIntState = popupInterceptor;
			popupInterceptor = false;
		}
		if (!rawQuery.includes('discord')) {
			popupInterceptor = LastPopupIntState;
		}
	}

	let lastOpenedUrl = '';
	let lastOpenedTime = 0;
	async function openInNewTab(targetUrl) {
		if (!targetUrl || !popupInterceptor) {
			return;
		}
		const currentTime = Date.now();
		const timeSinceLastOpen = currentTime - lastOpenedTime;
		const isSameUrl = targetUrl === lastOpenedUrl;
		if (isSameUrl && timeSinceLastOpen < 800) {
			return;
		}
		lastOpenedUrl = targetUrl;
		lastOpenedTime = currentTime;
		addTab();
		await tick();
		navigateTo(targetUrl);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		navigateTo(query);
		inputEl?.blur();
	}
	let bookmarkMenu = $state(false);
	let activeFrameURL = $state();
	let activeFrameTitle = $state();
	let activeFrameEngine = $state();

	function startBookmark() {
		settingsOpen = false;
		activeFrameURL = activeFrame.displayUrl;
		activeFrameTitle = activeFrame.title;
		activeFrameEngine = letheEngine;
		bookmarkMenu = true;
	}
	function toggleBookmarks() {
		bookmarkMenu = !bookmarkMenu;
	}
	function addBookmark() {
		if (!activeFrame?.displayUrl) return;
		bookmarks.push({ url: activeFrameURL, title: activeFrameTitle, lethe: activeFrameEngine });
		bookmarkMenu = false;
	}
	function removeBookmark(index) {
		bookmarks.splice(index, 1);
	}
	async function bookmarkSearch(url, lethe) {
		let encoded;
		if (lethe === 'sj2') {
			await ensurePrism();
			encoded = prismEncode(url);
		} else if (lethe === 'uv') {
			// @ts-ignore
			encoded = window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
		} else {
			encoded = polygon.encodeUrl(url);
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
	let activeIndex;
	$effect(() => {
		console.log($slotsDragged);
		if ($isTabDragging) {
			activeIndex = tabs.findIndex((tab) => tab.id === $activeTab);
			if (activeIndex > activeIndex + $slotsDragged) {
				$draggedOverRight = tabs[activeIndex + $slotsDragged].id;
			} else if (activeIndex < activeIndex + $slotsDragged) {
				$draggedOverLeft = tabs[$slotsDragged].id;
			}
		}
	});
	function moveTab(id) {
		const from = tabs.findIndex((tab) => tab.id === id);
		if (from === -1) return;
		const temp = tabs.splice(from, 1)[0];
		const newIndex = Math.max(0, Math.min(from + ($slotsDragged ?? 0), tabs.length));
		tabs.splice(newIndex, 0, temp);
		$slotsDragged = null;
		$draggedOverLeft = null;
		$draggedOverRight = null;
	}
	$effect(() => {
		if (ready && connection) {
			setCar(connection, car, customWisp);
		}
		if (getPrismController()) {
			setPrismTransport(car, customWisp || undefined);
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
	let extensionsOpen = $state(false);
	let popupInterceptor = $state(true); // hydrated from localspace in onMount
	function toggleSettings() {
		settingsOpen = !settingsOpen;
	}
	function closeSettings() {
		settingsOpen = false;
	}
	function toggleExtensions() {
		extensionsOpen = !extensionsOpen;
	}
	function togglePopupInterceptor() {
		popupInterceptor = !popupInterceptor;
	}
	function openInNewWindow() {
		if (!activeFrame || !activeFrame.url) {
			return;
		}
		window.open(activeFrame.url, '_blank', 'noopener');
		closeSettings();
	}

	async function openInspector() {
		closeSettings();
		try {
			await loadScript('https://cdn.jsdelivr.net/npm/eruda');
			window.eruda?.init();
			inputEl;
			window.eruda?.show();
		} catch (e) {
			console.error('Failed to load inspector:', e);
		}
	}

	function toggleFullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			const iframes = document.querySelectorAll('.frameContainer iframe');
			const activeIframe = Array.from(iframes).find((el) => el.offsetParent !== null);
			if (activeIframe) {
				activeIframe.requestFullscreen();
			}
		}
		closeSettings();
	}

	$effect(() => {
		if (!hydrated) return;
		saveSetting('lethe', letheEngine);
		saveSetting('car', car);
		saveSetting('customWisp', customWisp);
		saveSetting('searchEngine', searchEngine);
		saveSetting('bookmarks', $state.snapshot(bookmarks));
		saveSetting('popupInterceptor', popupInterceptor);
		saveSetting('LastPopupIntState', LastPopupIntState);
	});
	function registerSW() {
		inputFocused = true;

		try {
			if (navigator.serviceWorker) {
				polygon.init();
				navigator.serviceWorker.register('/servy.js');
			} else {
				console.warn('Service workers not supported');
			}
		} catch (error) {
			console.error('Failed to initialize SJ:', error);
		}
	}
</script>

<div class="tab-bar noSelect">
	{#each tabs as tab (tab.id)}
		{@const frame = frames.find((frame) => frame.id === tab.id)}
		<Tab id={tab.id} title={frame.title} displayUrl={frame?.displayUrl ?? ''} onDrop={moveTab} />
	{/each}
	<div class="newTab noSelect" onclick={addTab}><p class="plus">+</p></div>
</div>
<div class="nav-bar noSelect">
	<div class="nav-left">
		<div class="button" onclick={goBack}>
			<img src={back} alt="back" class="nav-icon noSelect" />
		</div>
		<div class="button" onclick={goForward}>
			<img src={forward} alt="forward" class="nav-icon noSelect" />
		</div>
		<div class="button" onclick={reloadTab}>
			<img src={reload} alt="reload" class="nav-icon noSelect" />
		</div>
	</div>
	<div class="nav-middle">
		<form onsubmit={handleSubmit}>
			<img src={searchIcon} class="searchIcon" />
			<input
				type="text"
				class="search-input search"
				placeholder="Search or enter address"
				bind:value={query}
				bind:this={inputEl}
				onfocus={registerSW}
				//onclick={inputEl.select}
				onblur={() => {
					inputFocused = false;
				}}
				disabled={!ready}
			/>
			<div class="star" onclick={startBookmark}>
				<img class="starIcon noSelect" src={star} alt="" />
			</div>
		</form>
		{#if bookmarkMenu}
			<div class="settings-overlay" onclick={toggleBookmarks}></div>

			<div class="bookmarkContainer">
				<p class="bookmarkTitle">Add bookmark</p>
				<span class="bookmarkLabel">Name</span>
				<input class="bookmark-input" bind:value={activeFrameTitle} autofocus />
				<span class="bookmarkLabel">URL</span>
				<input class="bookmark-input" bind:value={activeFrameURL} />
				<div class="flex">
					<p class="randomthing">Right click a bookmark to remove</p>
					<button class="bookmarkDone" onclick={addBookmark}>Done</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="nav-right">
		<div class="button" onclick={toggleExtensions}>
			<img src={extensions} alt="extensions" class="nav-icon noSelect puzzle" />
		</div>
		{#if extensionsOpen}
			<div class="settings-overlay" onclick={toggleExtensions}></div>
			<div class="extensionContainer">
				<div class="extensionBlock">
					<div class="aboutExtension">
						<p class="extensionName">Popup Interceptor</p>
						<p class="extensionDesc">
							Intercepts popup requests and opens them in Galaxy instead of the native browser.
						</p>
					</div>
					<button
						type="button"
						class="extensionToggle"
						class:on={popupInterceptor}
						role="switch"
						aria-checked={popupInterceptor}
						aria-label="Toggle Popup Interceptor"
						onclick={togglePopupInterceptor}
					>
						<span class="toggleKnob"></span>
					</button>
				</div>
			</div>
		{/if}
		<div class="button" onclick={toggleSettings}>
			<img src={setting} alt="settings" class="nav-icon noSelect" />
		</div>
		{#if settingsOpen}
			<div class="settings-overlay" onclick={toggleSettings}></div>
			<div class="settings-dropdown">
				<button class="menuBtn" onclick={addTab}>New Tab</button>
				<button class="menuBtn" onclick={startBookmark}>Bookmark Site</button>
				<div class="break"></div>
				<p>Pr<span class="filler">ha67</span>oxy</p>
				<select bind:value={letheEngine} disabled={!ready}>
					<option value="sj2">SJ2</option>
					<option value="sj">SJ</option>
					<option value="uv">UV</option>
				</select>
				<p>Tran<span class="filler">ha67</span>sport</p>
				<select bind:value={car} disabled={!ready}>
					<option value="libcurl">Lib</option>
					<option value="epoxy">Epox</option>
				</select>
				<p>Wi<span class="filler">ha67</span>sp</p>
				<input bind:value={customWisp} placeholder="keep blank for default" type="text" />
				<p>Sea<span class="filler">ha67</span>rch Engine</p>
				<select bind:value={searchEngine}>
					<option value="ddg">DuckDuckGo</option>
					<option value="brave">Brave</option>
					<option value="google"><p>Google</p></option>
				</select>
				<div class="break"></div>
				<button onclick={openInNewWindow}>Open in new tab</button>
				<div class="break"></div>
				<button onclick={toggleFullscreen}>Full Screen</button>
				<button onclick={openInspector}>Inspect Element</button>
			</div>
		{/if}
	</div>
</div>
{#snippet mark(bm, i)}
	<div
		class="mark"
		onclick={() => bookmarkSearch(bm.url, bm.lethe)}
		oncontextmenu={(e) => {
			e.preventDefault();
			removeBookmark(i);
		}}
	>
		<p class="markName">{bm.title}</p>
	</div>
{/snippet}

{#if bookmarks.length > 0}
	<div class="bookmarks">
		{#each bookmarks as bm, i}
			{@render mark(bm, i)}
		{/each}
	</div>
{/if}

<div class="frameContainer">
	{#each frames as frame (frame.id)}
		<Iframe
			id={frame.id}
			src={frame.url}
			onnavigate={(info) => handleNavigate(frame.id, info)}
			onnewtab={(url) => openInNewTab(url)}
			interceptEnabled={popupInterceptor}
		/>
		{#if frame.id === $activeTab && !frame.url}
			<Home {ready} onsearch={(rawQuery) => navigateTo(rawQuery)} />
		{/if}
	{/each}
</div>
