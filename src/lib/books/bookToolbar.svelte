<script lang="ts">
	import y from '$lib/img/icons/swap.png';

	let {
		search = $bindable(''),
		tag = $bindable(''),
		filter = $bindable('all'),
		tags,
		onrandom
	}: {
		search?: string;
		tag?: string;
		filter?: 'all' | 'favorites';
		tags: string[];
		onrandom: () => void;
	} = $props();
	function switchMode() {
		if (localStorage.getItem('mode') == 'website') {
			localStorage.setItem('mode', 'os');
			location.replace('/');
		} else {
			localStorage.setItem('mode', 'website');
			location.replace('/');
		}
	}
</script>

<header>
	<input bind:value={search} placeholder="Search books..." autocomplete="off" />

	<select bind:value={tag}>
		<option value="">All Categories</option>
		{#each tags as t (t)}
			<option value={t}>{t}</option>
		{/each}
	</select>

	<select bind:value={filter}>
		<option value="all">All books</option>
		<option value="favorites">Favorites</option>
	</select>

	<button onclick={onrandom} title="Open a random game">
		<svg
			viewBox="0 0 24 24"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<rect x="3" y="3" width="18" height="18" rx="3" />
			<circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
			<circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
			<circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
			<circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
		</svg>
		Random
	</button>
	<button onclick={switchMode}>
		Switch Mode
		<img src={y} alt="" />
	</button>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 10px;
		flex-wrap: wrap;
		background-color: transparent;
		border-radius: 8px;
	}

	input,
	select,
	button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: var(--color-surface-2);
		color: var(--color-text);
		border: none;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 14px;
		font-family: var(--font-family-body);
		backdrop-filter: blur(20px);
	}
	button img {
		height: 18px;
		margin: 0px;
	}
	input {
		flex: 1;
		min-width: 150px;
	}
	input::placeholder {
		color: var(--color-text-subtle);
	}
	button:hover,
	input:hover,
	select:hover {
		background: var(--color-surface-3);
		cursor: pointer;
	}
</style>
