<script lang="ts">
	import { formatTag } from './catalog';
	import searchIcon from '$lib/img/icons/search.png';
	import shuffle from '$lib/img/icons/shuffle.png';
	import y from '$lib/img/icons/swap.png';

	let {
		search = $bindable(''),
		selected = $bindable<string[]>([]),
		filter = $bindable('all'),
		tags,
		onrandom
	}: {
		search?: string;
		selected?: string[];
		filter?: 'all' | 'favorites';
		tags: string[];
		onrandom: () => void;
	} = $props();

	const VISIBLE_TAGS = 8;
	let expanded = $state(false);

	const shownTags = $derived.by(() => {
		if (expanded) return tags;
		const head = tags.slice(0, VISIBLE_TAGS);
		for (const t of selected) {
			if (!head.includes(t)) head.push(t);
		}
		return head;
	});

	function toggleTag(t: string) {
		selected = selected.includes(t) ? selected.filter((s) => s !== t) : selected.concat([t]);
	}

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

<div class="search">
	<img src={searchIcon} alt="" class="searchIcon" />
	<input type="text" placeholder="Search Books or Tags" bind:value={search} autocomplete="off" />
</div>

<div class="filters">
	<button
		class="pill"
		class:active={filter === 'all' && selected.length === 0}
		onclick={() => {
			filter = 'all';
			selected = [];
		}}
	>
		All
	</button>
	<button class="pill" class:active={filter === 'favorites'} onclick={() => (filter = 'favorites')}>
		Favorites
	</button>
	{#each shownTags as t (t)}
		<button class="pill" class:active={selected.includes(t)} onclick={() => toggleTag(t)}>
			{formatTag(t)}
		</button>
	{/each}
	{#if tags.length > VISIBLE_TAGS}
		<button class="pill subtle" onclick={() => (expanded = !expanded)}>
			{expanded ? 'Less' : `+${tags.length - VISIBLE_TAGS} More`}
		</button>
	{/if}

	<div class="actions">
		<button class="pill" onclick={onrandom} title="Open a random book">
			<img src={shuffle} alt="" class="pillIcon" />
			Random
		</button>
		<button class="pill" onclick={switchMode}>
			Switch Mode
			<img src={y} alt="" class="pillIcon" />
		</button>
	</div>
</div>

<style>
	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		max-width: 420px;
		margin: 28px 0 18px 24px;
		padding: 12px 18px;
		background-color: transparent;
		border-bottom: 1px solid var(--color-border);
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
		color: var(--color-text-muted);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0 24px 24px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-left: auto;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
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
	.pill.subtle {
		background: transparent;
		color: var(--color-text-subtle);
	}
	.pill.subtle:hover {
		background: var(--overlay-hover);
		color: var(--color-text);
	}
	.pill.active {
		background: var(--color-white);
		color: var(--color-black);
		border-color: var(--color-white);
	}
	.pillIcon {
		height: 16px;
		width: auto;
	}
</style>
