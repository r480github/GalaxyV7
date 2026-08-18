<script>
	// @ts-nocheck
	import Window from '$lib/utils/window/window.svelte';
	import Notifications from '$lib/utils/notifications.svelte';
	import {
		windowList,
		minimizedSig,
		activeSignal,
		focusWindowTop,
		notif
	} from '$lib/stores/index.js';
	import '$lib/style/os.css';
	import { onMount } from 'svelte';
	import mainBG from '$lib/img/bg/default.jpg';
	import browser from '$lib/img/icons/earthWhite.png';
	import g from '$lib/img/icons/controller.png';
	import a from '$lib/img/icons/apps.png';
	import s from '$lib/img/icons/settings.png';
	import y from '$lib/img/icons/swap.png';
	import p from '$lib/img/icons/pyrite.png';
	import sp from '$lib/img/icons/spotify.png';
	import { get } from 'svelte/store';
	import { applyStartupSettings } from '$lib/utils/cloak.js';
	import gsap from 'gsap';
	import { Warp, LiquidMetal } from '@devmischief/shaders-svelte';
	import { loadSetting, saveSetting, onSettingChange } from '$lib/utils/localspace.js';
	import faviconFetch from 'favicon-fetch';
	import { launchAds } from '$lib/utils/ads';

	let activeButton = $state(null);
	let menuOpen = $state(false);
	let openMenuX = $state(0);
	let menuX = $state(0);
	let menuY = $state(0);
	let menuSender = $state(null);
	let previewOpen = $state(false);
	let previewApp = $state(null);
	let hoverTimeout = null;
	let timeString = $state(null);
	let bgURL = $state(null);
	let hydrated = $state(false);
	let navSizeMulti = $state(0);
	let temp = 0;
	let accumY = 0;
	let dragging = $state(false);
	let windowComps = [];
	let hostname = $state(null);
	let proxApi = '/api?url?&type=prism&&transport=libcurlRaw&autoSW=false';
	function startNavResize(e) {
		dragging = true;
		temp = navSizeMulti;
		accumY = 0;
		e.currentTarget.requestPointerLock();
		addEventListener('mousemove', dragStart);
		addEventListener('mouseup', dragStop);
		document.addEventListener('pointerlockchange', onPointerLockChange);
	}
	function dragStart(e) {
		accumY += e.movementY;
		navSizeMulti = Math.max(Math.min(temp - accumY * 0.2, 39), -15);
	}
	function dragStop(e) {
		removeEventListener('mousemove', dragStart);
		removeEventListener('mouseup', dragStop);
		document.removeEventListener('pointerlockchange', onPointerLockChange);
		if (document.pointerLockElement) document.exitPointerLock();
		dragging = false;
		callTaskbarHeight();
	}
	function onPointerLockChange() {
		if (!document.pointerLockElement) dragStop();
	}
	const baseApps = $derived([
		{
			id: 1,
			url: '/slate',
			name: 'Browser',
			icon: browser,
			height: '50%',
			width: '50%',
			top: 100,
			left: 60
		},
		{
			id: 6,
			url: '/api?url=https://spotify.com&type=prism&notif=Make%20Sure%20To%20Sign%20In%20With%20Google&autoSW=false',
			name: 'Spotify',
			icon: sp,
			height: '50%',
			width: '50%',
			top: 50,
			left: 210
		},
		{
			id: 2,
			url: '/books',
			name: 'Books',
			icon: g,
			height: '50%',
			width: '50%',
			top: 120,
			left: 110
		},
		{
			id: 3,
			url: `https://${hostname}/pyrite/?api=https://${hostname}${proxApi}`,
			name: 'Pyrite',
			icon: p,
			height: '50%',
			width: '50%',
			top: 30,
			left: 110
		},
		{
			id: 4,
			url: '/apps',
			name: 'Apps',
			icon: a,
			height: '50%',
			width: '50%',
			top: 90,
			left: 160
		},
		{
			id: 5,
			url: '/settings',
			name: 'Settings',
			icon: s,
			height: '80%',
			width: '80%',
			top: 0,
			left: 0,
			center: true
		}
	]);
	let customApps = $state([]);
	const apps = $derived([...baseApps, ...customApps]);
	function conertToPixies(size, viewportLength) {
		const sizeAsText = String(size);
		const isPercentage = sizeAsText.endsWith('%');

		if (isPercentage) {
			const percent = parseFloat(sizeAsText);
			const fraction = percent / 100;
			return fraction * viewportLength;
		} else {
			return parseFloat(sizeAsText);
		}
	}

	function getCenteredPosition(width, height) {
		const windowWidthInPixels = conertToPixies(width, window.innerWidth);
		const windowHeightInPixels = conertToPixies(height, window.innerHeight);

		const leftoverWidth = window.innerWidth - windowWidthInPixels;
		const leftoverHeight = window.innerHeight - windowHeightInPixels;

		const centeredLeft = leftoverWidth / 2;
		const centeredTop = leftoverHeight / 2;

		return {
			left: centeredLeft,
			top: centeredTop
		};
	}

	function getAppConfig(appId) {
		for (const app of apps) {
			if (app.id === appId) {
				return app;
			}
		}
		return null;
	}

	$effect(() => {
		activeButton = $activeSignal;
		if (!hydrated) return;
		saveSetting('navbarsize', navSizeMulti);
	});
	let navMounted = false;
	let navIndex = 0;
	function animateNavButton(node) {
		const delay = navMounted ? 0 : 0.1 + navIndex++ * 0.09;
		gsap.fromTo(
			node,
			{
				opacity: 0,
				y: 50
			},
			{
				opacity: 1,
				y: 0,
				delay
			}
		);
	}
	onMount(() => {
		applyStartupSettings();
		navMounted = true;
		hostname = location.hostname;
		if (hostname.includes('localhost')) {
			hostname = 'v7.galxy.it.com';
		}
		document.addEventListener('mousedown', launchAds);
	});

	function getAppWindows(appId) {
		const list = get(windowList);
		const matching = [];
		for (const win of list) {
			if (win.sender === appId || win.parentApp === appId) {
				matching.push(win);
			}
		}
		return matching;``
	}

	function isAppActive(appId) {
		if (activeButton === appId) return true;
		const list = get(windowList);
		for (const win of list) {
			if (win.parentApp === appId && win.sender === activeButton) {
				return true;
			}
		}
		return false;
	}

	function getPreviewWindows() {
		const matching = [];
		for (const win of $windowList) {
			if (win.sender === previewApp || win.parentApp === previewApp) {
				matching.push(win);
			}
		}
		return matching;
	}

	function hasMinimizedWindow(appId) {
		for (const win of $windowList) {
			const belongsToApp = win.sender === appId || win.parentApp === appId;
			if (belongsToApp && win.minimized) {
				return true;
			}
		}
		return false;
	}
	function openWindow(url, name, height, width, top, left, appId) {
		if (localStorage.getItem('firstVisit') == 'false') {
		} else {
			localStorage.setItem('firstVisit', 'false');
			$notif = 'Right click app to open new window!';
		}
		let appWindows = getAppWindows(appId);
		if (appWindows.length > 1) {
			previewApp = appId;
			previewOpen = true;
			return;
		}
		if (appWindows.length === 1) {
			minimizedSig.set(appWindows[0].sender);
			previewOpen = false;
			return;
		}

		activeSignal.set(appId);

		const appConfig = getAppConfig(appId);
		if (appConfig && appConfig.center) {
			const centeredPosition = getCenteredPosition(width, height);
			top = centeredPosition.top;
			left = centeredPosition.left;
		}

		const queryString = url.split('?')[1];
		if (queryString) {
			const params = new URLSearchParams(queryString);
			const notifMsg = params.get('notif');
			if (notifMsg) {
				$notif = notifMsg;
			}
		}
		windowList.update((list) => [
			...list,

			{
				url,
				name,
				height,
				width,
				top,
				left,
				id: `win-${Date.now()}`,
				sender: appId,
				parentApp: appId
			}
		]);
	}

	function openNewWindow(url, name, height, width, top, left, appId) {
		let uniqueSender = `${appId}-${Date.now()}`;
		let newName = String(name) + ' (' + getAppWindows(appId).length + ')';
		name = newName;
		activeSignal.set(uniqueSender);

		const appConfig = getAppConfig(appId);
		if (appConfig && appConfig.center) {
			const centeredPosition = getCenteredPosition(width, height);
			top = centeredPosition.top;
			left = centeredPosition.left;
		}

		windowList.update((list) => [
			...list,
			{
				url,
				name,
				height,
				width,
				top,
				left,
				id: `win-${Date.now()}`,
				sender: uniqueSender,
				parentApp: appId
			}
		]);
		closeMenu();
	}

	function focusWindow(sender) {
		focusWindowTop.set(sender);
		previewOpen = false;
	}
	let menuType = $state(null);
	function openMenu(e, type, appId, url, name, height, width, top, left) {
		e.preventDefault();
		e.stopPropagation();
		menuX = e.clientX;
		menuY = e.clientY;
		openMenuX = e.clientX;
		if (type == 'navBar') {
			menuType = 'nav';
			menuOpen = true;
		} else if (type == 'apps') {
			menuSender = { appId, url, name, height, width, top, left };
			menuType = 'app';
			hoverEnd();
			menuOpen = true;
		}
	}

	function closeMenu() {
		menuOpen = false;
		menuSender = null;
	}

	const proxies = [
		{ value: 'prism', label: 'SJ2' },
		{ value: 'polygon', label: 'SJ' },
		{ value: 'glass', label: 'UV' }
	];
	const transports = [
		{ value: 'libcurl', label: 'Libcurl' },
		{ value: 'epoxy', label: 'Epoxy' }
	];

	let addOpen = $state(false);
	let advancedOpen = $state(false);
	let addError = $state(null);
	let newName = $state('');
	let newUrl = $state('');
	let newIcon = $state('');
	let newProxy = $state('prism');
	let newTransport = $state('libcurl');
	let newWisp = $state('');
	let newNotif = $state('');

	function openAddApp() {
		closeMenu();
		addError = null;
		advancedOpen = false;
		newName = '';
		newUrl = '';
		newIcon = '';
		newProxy = 'prism';
		newTransport = 'libcurl';
		newWisp = '';
		newNotif = '';
		addOpen = true;
	}

	function closeAddApp() {
		addOpen = false;
	}

	function hostnameOf(url) {
		try {
			return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname;
		} catch {
			return null;
		}
	}
	function nextWindowPosition() {
		const step = customApps.length % 6;
		return { top: 60 + step * 24, left: 90 + step * 40 };
	}

	function addApp() {
		const url = newUrl.trim();
		const name = newName.trim();
		if (!url || !name) {
			addError = 'Name and URL are required';
			return;
		}

		const params = new URLSearchParams({ url, type: newProxy, transport: newTransport });
		if (newNotif.trim()) params.set('notif', newNotif.trim());
		if (newWisp.trim()) params.set('wisp', newWisp.trim());

		const host = hostnameOf(url);
		const { top, left } = nextWindowPosition();
		customApps.push({
			id: `custom-${Date.now()}`,
			url: `/api?${params.toString()}`,
			name,
			icon: newIcon.trim() || (host ? faviconFetch({ hostname: host }) : browser),
			height: '50%',
			width: '50%',
			top,
			left
		});
		saveSetting('customApps', $state.snapshot(customApps));
		addOpen = false;
	}

	function removeApp(appId) {
		customApps = customApps.filter((app) => app.id !== appId);
		saveSetting('customApps', $state.snapshot(customApps));
		closeMenu();
	}

	function isCustomApp(appId) {
		for (const app of customApps) {
			if (app.id === appId) return true;
		}
		return false;
	}

	function hoverStart(e, appId) {
		previewOpen = false;
		previewApp = null;
		e.preventDefault();
		e.stopPropagation();
		menuX = e.clientX;
		hoverTimeout = setTimeout(() => {
			let appWindows = getAppWindows(appId);
			if (appWindows.length > 0) {
				previewApp = appId;
				previewOpen = true;
			}
		}, 400);
	}
	let closeTimeout = null;
	function hoverEnd() {
		clearTimeout(hoverTimeout);
		closeTimeout = setTimeout(() => {
			previewOpen = false;
			previewApp = null;
		}, 200);
	}
	function updateTime() {
		const now = new Date();
		timeString = now.toLocaleTimeString();
	}

	onMount(async () => {
		bgURL = await loadSetting('bg', mainBG);
		navSizeMulti = await loadSetting('navbarsize', 0);
		customApps = await loadSetting('customApps', []);
		hydrated = true;
		updateTime();
		const interval = setInterval(updateTime, 1000);
		const unsubscribeBG = onSettingChange('bg', (value) => {
			bgURL = value ?? mainBG;
		});
		const unsubscribeApps = onSettingChange('customApps', (value) => {
			customApps = value ?? [];
		});
		return () => {
			clearInterval(interval);
			unsubscribeBG();
			unsubscribeApps();
		};
	});

	function switchMode() {
		if (localStorage.getItem('mode') == 'website') {
			localStorage.setItem('mode', 'os');
			location.replace('/');
		} else {
			localStorage.setItem('mode', 'website');
			location.replace('/');
		}
	}
	function callTaskbarHeight() {
		for (const comp of windowComps) {
			comp?.updateTaskbarHeight();
		}
	}
	function openChangelogs() {
		openWindow(
			'/changelog',
			'Changelogs',
			'50%',
			'600px',
			'25',
			'0',
			`win-${Date.now()}`,
			Date.now(),
			Date.now()
		);
	}
</script>

<div class="topNav noSelect">
	<div class="topLeft"><p onclick={openChangelogs} class="topNavText topNavHover">GalaxyV7</p></div>
	<div class="topMiddle"></div>
	<div class="topRight">
		<div class="topButton" onclick={switchMode}>
			<img src={y} alt="" />
		</div>
		<p>{timeString}</p>
	</div>
</div>
<Notifications />
<svelte:window
	onclick={() => {
		closeMenu();
	}}
	onkeydown={(e) => {
		if (addOpen && e.key === 'Escape') closeAddApp();
	}}
/>

<div class="background" style="background-image: url({bgURL}); "></div>

{#if menuOpen}
	<div class="contextMenu" style="left: {openMenuX}px;" onclick={(e) => e.stopPropagation()}>
		{#if menuType == 'app'}
			<button
				class="menuOption"
				onclick={() =>
					openNewWindow(
						menuSender.url,
						menuSender.name,
						menuSender.height,
						menuSender.width,
						menuSender.top,
						menuSender.left,
						menuSender.appId
					)}
			>
				Open New Window
			</button>
			{#if isCustomApp(menuSender.appId)}
				<button class="menuOption danger" onclick={() => removeApp(menuSender.appId)}>
					Remove App
				</button>
			{/if}
		{:else if menuType == 'nav'}
			<button class="menuOption" onclick={openAddApp}> Add New App </button>
		{/if}
	</div>
{/if}
{#if addOpen}
	<div class="modalOverlay" onclick={closeAddApp}>
		<div
			class="modal"
			onclick={(e) => e.stopPropagation()}
			{@attach (node) => {
				gsap.fromTo(
					node,
					{ y: 12, opacity: 0, scale: 0.97 },
					{ y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
				);
			}}
		>
			<p class="modalTitle">Add App</p>

			<p class="modalLabel">URL</p>
			<input
				class="modalInput"
				type="text"
				placeholder="example.com"
				bind:value={newUrl}
				oninput={() => (addError = null)}
				onkeydown={(e) => e.key === 'Enter' && addApp()}
			/>

			<p class="modalLabel">Name</p>
			<input
				class="modalInput"
				type="text"
				placeholder="Example"
				bind:value={newName}
				oninput={() => (addError = null)}
				onkeydown={(e) => e.key === 'Enter' && addApp()}
			/>

			<p class="modalLabel">Icon</p>
			<input
				class="modalInput"
				type="text"
				placeholder="leave blank to auto generate"
				bind:value={newIcon}
				onkeydown={(e) => e.key === 'Enter' && addApp()}
			/>

			<button class="advancedToggle" onclick={() => (advancedOpen = !advancedOpen)}>
				<span class="advancedArrow" class:open={advancedOpen}></span> Advanced
			</button>

			{#if advancedOpen}
				<div
					class="advancedPanel"
					{@attach (node) => {
						gsap.fromTo(node, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.2 });
					}}
				>
					<p class="modalLabel">Proxy</p>
					<div class="modalOptions">
						{#each proxies as proxy}
							<button
								class="modalOption"
								class:active={newProxy === proxy.value}
								onclick={() => (newProxy = proxy.value)}>{proxy.label}</button
							>
						{/each}
					</div>

					<p class="modalLabel">Transport</p>
					<div class="modalOptions">
						{#each transports as transport}
							<button
								class="modalOption"
								class:active={newTransport === transport.value}
								onclick={() => (newTransport = transport.value)}>{transport.label}</button
							>
						{/each}
					</div>

					<p class="modalLabel">Wisp</p>
					<input
						class="modalInput"
						type="text"
						placeholder="keep blank for default"
						bind:value={newWisp}
					/>

					<p class="modalLabel">Open Notification</p>
					<input
						class="modalInput"
						type="text"
						placeholder="shown when the app opens"
						bind:value={newNotif}
					/>
				</div>
			{/if}

			{#if addError}
				<p class="modalError">{addError}</p>
			{/if}

			<div class="modalActions">
				<button class="modalBtn" onclick={closeAddApp}>Cancel</button>
				<button class="modalBtn primary" onclick={addApp}>Add</button>
			</div>
		</div>
	</div>
{/if}
{#if previewOpen}
	<div
		style="left:{menuX}px"
		id="previewPanel"
		class="previewPanel"
		onclick={(e) => e.stopPropagation()}
		{@attach (node) => {
			gsap.fromTo(
				node,
				{ y: 20, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.3,
					ease: 'power2.out'
				}
			);
		}}
		onmouseenter={() => clearTimeout(closeTimeout)}
		onmouseleave={() => {
			previewOpen = false;
			previewApp = null;
		}}
	>
		{#each getPreviewWindows() as win}
			<button class="previewCard" onclick={() => focusWindow(win.sender)}>
				<p>{win.name}</p>
			</button>
		{/each}
	</div>
{/if}
<div
	class="nav"
	style="	height: {40 + navSizeMulti}px; 
	
"
>
	<div class="navResize" onmousedown={startNavResize}></div>
	<div class="navStuff noSelect" oncontextmenu={(e) => openMenu(e, 'navBar')}>
		{#each apps as app (app.id)}
			<button
				class="navButton"
				{@attach animateNavButton}
				class:active={isAppActive(app.id)}
				class:hasMinimized={hasMinimizedWindow(app.id) || getAppWindows(app.id).length > 0}
				onclick={() =>
					openWindow(app.url, app.name, app.height, app.width, app.top, app.left, app.id)}
				oncontextmenu={(e) =>
					openMenu(e, 'apps', app.id, app.url, app.name, app.height, app.width, app.top, app.left)}
				onmouseenter={(e) => hoverStart(e, app.id)}
				onmouseleave={hoverEnd}
			>
				<img class="navIcon" src={app.icon} alt={app.name} />
			</button>
		{/each}
	</div>
</div>

{#each $windowList as window, i (window.id)}
	<Window
		bind:this={windowComps[i]}
		url={window.url}
		name={window.name}
		height={window.height}
		width={window.width}
		top={window.top}
		left={window.left}
		id={window.id}
		sender={window.sender}
	/>
{/each}
