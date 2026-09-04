<script>
	import { onMount } from 'svelte';
	import searchIcon from '$lib/img/icons/search.png';
	import getContrast from '$lib/utils/contrast.js';
	import faviconFetch from 'favicon-fetch';
	let { ready = false, onsearch } = $props();
	let fg = $state('');
	let homeQuery = $state('');
	let now = $state(new Date());
	let inputEl;
	onMount(() => {
		inputEl?.focus();
		const timer = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(timer);
	});
	let bg = $state();
	onMount(async () => {
		// bg = await b1g;
		// fg = String(await getContrast(bg));
		// console.log('local color is set to: ' + fg);
	});
	let greeting = $derived.by(() => {
		const hour = now.getHours();
		if (hour < 12) {
			return 'Good morning';
		}
		if (hour < 18) {
			return 'Good afternoon';
		}
		return 'Good evening';
	});

	let clock = $derived.by(() => {
		let hour = now.getHours();
		const minute = now.getMinutes();
		let suffix = 'AM';
		if (hour >= 12) {
			suffix = 'PM';
		}
		hour = hour % 12;
		if (hour === 0) {
			hour = 12;
		}
		let paddedMinute = String(minute);
		if (paddedMinute.length < 2) {
			paddedMinute = '0' + paddedMinute;
		}
		return hour + ':' + paddedMinute + ' ' + suffix;
	});

	function submitSearch(event) {
		if (!ready) {
			return;
		}
		onsearch(homeQuery);
		if (!homeQuery) {
			return;
		}
		homeQuery = '';
	}
	const quickLinks = [
		{ label: 'YouTube', url: 'https://youtube.com' },
		{ label: 'Discord', url: 'https://discord.com/app' },
		{ label: 'Reddit', url: 'https://reddit.com' },
		{ label: 'Geforce', url: 'https://play.geforcenow.com/mall/' },
		{ label: 'GitHub', url: 'https://github.com' },
		{ label: 'Twitch', url: 'https://twitch.tv' }
	];
</script>

<div
	class="home"
	style="
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	"
>
	<div class="brand-row">
		<h1 class="brand" style="color:{fg}">Ga<span class="filler">6767ha</span>laxy</h1>
		<span class="version">v7</span>
	</div>
	<div class="hero">
		<p class="greeting" style="color:{fg}">{greeting} &middot; {clock}</p>
		<form class="home-search" onsubmit={submitSearch}>
			<img src={searchIcon} class="home-search-icon" alt="" />
			<input
				class="noSelect"
				type="text"
				placeholder="Search or enter address"
				bind:value={homeQuery}
				bind:this={inputEl}
				disabled={!ready}
			/>
		</form>
		{#snippet App(label, url)}
			<button
				class="shortcuts noSelect"
				onclick={() => {
					onsearch(url);
				}}
			>
				<img class="noSelect" src={faviconFetch({ hostname: new URL(url).hostname })} alt="" />
				<!-- <p>{label}</p> -->
			</button>
		{/snippet}

		<div class="apps">
			{#each quickLinks as item}
				{@render App(item.label, item.url)}
			{/each}
		</div>
	</div>
</div>

<style>
	/*...claude helped with some css*/
	.home {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: safe center;
		padding: 40px 20px 14vh;
		box-sizing: border-box;
		overflow: hidden auto;
		background-color: var(--color-bg);
		isolation: isolate;
		margin: 0px;
	}
	.home::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	.hero {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 600px;
		animation: rise 0.7s cubic-bezier(0.16, 0.8, 0.24, 1) both;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(9px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.brand-row {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	.brand {
		font-family: var(--font-family-heading);
		font-size: clamp(20px, 30px, 35px);
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1;
		text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
		margin: 15px;
		margin-right: 0px;
	}
	.version {
		margin-top: 14px;
		font-family: var(--font-family-body);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-white);
		background-color: var(--color-scrim-medium);
		border: 1px solid var(--color-border-strong);
		padding: 3px 9px;
		border-radius: 999px;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.greeting {
		margin: 0 0 26px;
		font-family: var(--font-family-heading);
		font-size: clamp(26px, 4.4vw, 34px);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-text);
	}

	.home-search {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
	}
	.home-search-icon {
		position: absolute;
		left: 18px;
		height: 16px;
		opacity: 0.45;
		filter: brightness(0) invert(1);
		pointer-events: none;
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* IE 10 and IE 11 */
		user-select: none; /* Standard syntax */
		-webkit-user-drag: none; /* Chrome, Safari */
	}
	.home-search input {
		width: 100%;
		height: 52px;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		background-color: var(--color-surface-2);
		padding: 0 20px 0 50px;
		color: var(--color-text);
		font-size: 16px;
		font-family: var(--font-family-body);
		outline: none;
		box-sizing: border-box;
		transition:
			border-color 0.18s,
			box-shadow 0.18s;
	}
	.home-search input::placeholder {
		color: var(--color-text-subtle);
	}
	.home-search input:focus {
		border: 1px solid var(--color-border-strong);
	}
	.home-search input:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.apps {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 20px;
		margin-top: 22px;
	}
	.shortcuts {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 60px;
		height: 60px;
		padding: 0 14px;
		box-sizing: border-box;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		background-color: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
		transition:
			transform 0.18s cubic-bezier(0.16, 0.8, 0.24, 1),
			background-color 0.18s,
			border-color 0.18s;
	}
	.shortcuts:hover {
		transform: translateY(-2px);
		background-color: var(--color-surface-2);
		border-color: var(--color-border-hover);
	}
	.shortcuts:active {
		transform: translateY(0);
	}
	.shortcuts img {
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 5px;
		object-fit: contain;
	}
	.shortcuts p {
		margin: 0;
		min-width: 0;
		font-family: var(--font-family-body);
		font-size: 13px;
		font-weight: 500;
		color: inherit;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	@media (max-width: 560px) {
		.apps {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
