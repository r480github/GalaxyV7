<script>
	import { onMount } from 'svelte';
	import searchIcon from '$lib/img/icons/search.png';

	let { ready = false, onsearch } = $props();

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
		event.preventDefault();
		if (!ready) {
			return;
		}
		const trimmed = homeQuery.trim();
		if (!trimmed) {
			return;
		}
		onsearch?.(trimmed);
		homeQuery = '';
	}
</script>

<div class="home">
	<div class="hero">
		<div class="brand-row">
			<h1 class="brand">Galaxy</h1>
			<span class="version">v7</span>
		</div>
		<p class="greeting">{greeting} &middot; {clock}</p>
		<form class="home-search" onsubmit={submitSearch}>
			<img src={searchIcon} class="home-search-icon" alt="" />
			<input
				type="text"
				placeholder=""
				bind:value={homeQuery}
				bind:this={inputEl}
				disabled={!ready}
			/>
		</form>
	</div>
</div>

<style>
	.home {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 40px;
		padding: 40px 20px;
		box-sizing: border-box;
		overflow-y: auto;
		background-color: var(--color-bg);
		background-image: radial-gradient(
			circle at 50% 32%,
			rgba(255, 255, 255, 0.06),
			transparent 60%
		);
    padding-bottom: 20%;
		overflow: hidden;
	}
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 560px;
	}
	.brand-row {
		display: flex;
		align-items: flex-start;
		gap: 6px;
	}
	.brand {
		margin: 0;
		font-family: var(--font-family-heading);
		font-size: 56px;
		font-weight: 800;
		letter-spacing: 0.02em;
		color: var(--color-text);
	}
	.version {
		margin-top: 12px;
		font-family: var(--font-family-body);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-bg);
    background-color: var(--color-text);
    padding: 2px;
    border-radius: 4px;
	}
	.greeting {
		margin: 8px 0 28px;
		font-family: var(--font-family-body);
		font-size: 15px;
		color: var(--color-text-subtle);
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
		filter: brightness(0.7);
		pointer-events: none;
	}
	.home-search input {
		width: 100%;
		height: 40px;
		border: 1px solid var(--color-border);
		border-radius: 24px;
		background-color: var(--color-surface);
		padding: 0 20px 0 46px;
		color: var(--color-white);
		font-size: 16px;
		font-family: var(--font-family-body);
		outline: none;
		box-sizing: border-box;
		transition-duration: 0.2s;
	}
	.home-search input:focus {
		border-color: var(--color-border-strong);
		background-color: var(--color-surface-2);
	}
</style>
