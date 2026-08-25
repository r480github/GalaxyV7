<!--This g a m e page is from Endis-->

<script lang="ts">
	import type { Game } from '$lib/books/types';
	import { collectTags } from '$lib/books/catalog';
	import { favorites } from '$lib/books/favorites.svelte';
	import { trackVisit } from '$lib/books/history';
	import { intersect } from '$lib/books/intersect';
	import GameToolbar from '$lib/books/bookToolbar.svelte';
	import GameCard from '$lib/books/bookCard.svelte';
	import GameOverlay from '$lib/books/bookOverlay.svelte';
	import type { PageData } from './$types';

	const BATCH = 60;

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let selectedTags = $state<string[]>([]);
	let filter = $state<'all' | 'favorites'>('all');
	let displayedCount = $state(BATCH);
	let activeGame = $state<Game | null>(null);

	const tagList = $derived(collectTags(data.games));

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return data.games.filter((g) => {
			const matchesSearch =
				!q || g.name.toLowerCase().includes(q) || g.tags.some((t) => t.toLowerCase().includes(q));
			const matchesTag = !selectedTags.length || g.tags.some((t) => selectedTags.includes(t));
			const matchesFav = filter === 'all' || favorites.has(g.id);
			return matchesSearch && matchesTag && matchesFav;
		});
	});

	const favoriteGames = $derived(data.games.filter((g) => favorites.has(g.id)));
	const visible = $derived(filtered.slice(0, displayedCount));

	$effect(() => {
		search;
		selectedTags;
		filter;
		displayedCount = BATCH;
	});

	function loadMore() {
		displayedCount = Math.min(displayedCount + BATCH, filtered.length);
	}

	function openGame(game: Game) {
		trackVisit('game', game.id, game.name, game.thumb);
		activeGame = game;
	}

	function openRandom() {
		const pool = filtered.length ? filtered : data.games;
		if (pool.length) openGame(pool[Math.floor(Math.random() * pool.length)]);
	}
</script>

<GameToolbar
	bind:search
	bind:selected={selectedTags}
	bind:filter
	tags={tagList}
	onrandom={openRandom}
/>

{#if favoriteGames.length > 0 && filter !== 'favorites'}
	<div class="section-header">Favorites</div>
	<div class="grid">
		{#each favoriteGames.slice(0, 12) as game (game.id)}
			<GameCard {game} onopen={openGame} />
		{/each}
	</div>
{/if}

<div class="section-header">
	{filter === 'favorites' ? 'Favorites' : 'All Books'} ({filtered.length})
</div>

{#if filtered.length === 0}
	<p class="empty">No books match your filters.</p>
{:else}
	<div class="grid">
		{#each visible as game (game.id)}
			<GameCard {game} onopen={openGame} />
		{/each}
	</div>

	{#if displayedCount < filtered.length}
		<div class="load-more-row">
			<button class="load-more" onclick={loadMore}>
				Load More ({filtered.length - displayedCount} remaining)
			</button>
		</div>
		<div use:intersect={loadMore}></div>
	{/if}
{/if}

<GameOverlay game={activeGame} onclose={() => (activeGame = null)} />

<style>
	:global(body) {
		background: var(--color-bg);
	}
	.grid {
		display: grid;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 16px;
		padding: 0 24px 24px;
		content-visibility: auto;
		contain-intrinsic-size: 500px;
	}

	.section-header {
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

	.load-more-row {
		display: flex;
		justify-content: center;
		padding: 12px 24px 32px;
	}
	.load-more {
		padding: 12px 28px;
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
	.load-more:hover {
		background: var(--overlay-hover-strong);
		color: var(--color-text);
	}
</style>
