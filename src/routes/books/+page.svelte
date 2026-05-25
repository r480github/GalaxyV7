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
	let tag = $state('');
	let filter = $state<'all' | 'favorites'>('all');
	let displayedCount = $state(BATCH);
	let activeGame = $state<Game | null>(null);

	const tagList = $derived(collectTags(data.games));

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return data.games.filter((g) => {
			const matchesSearch = !q || g.name.toLowerCase().includes(q);
			const matchesTag = !tag || g.tags.includes(tag);
			const matchesFav = filter === 'all' || favorites.has(g.id);
			return matchesSearch && matchesTag && matchesFav;
		});
	});

	const favoriteGames = $derived(data.games.filter((g) => favorites.has(g.id)));
	const visible = $derived(filtered.slice(0, displayedCount));

	$effect(() => {
		search;
		tag;
		filter;
		displayedCount = BATCH;
	});

	function loadMore() {
		displayedCount = Math.min(displayedCount + BATCH, filtered.length);
	}

	function openGame(game: Game) {
		trackVisit('game', game.id, game.name, game.cover);
		activeGame = game;
	}

	function openRandom() {
		const pool = filtered.length ? filtered : data.games;
		if (pool.length) openGame(pool[Math.floor(Math.random() * pool.length)]);
	}
</script>

<GameToolbar
	bind:search
	bind:tag
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

<div class="section-header">All Books ({filtered.length})</div>

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
		background: var(--color-surface);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
		padding: 16px;
		content-visibility: auto;
		contain-intrinsic-size: 500px;
	}

	.section-header {
		padding: 12px;
		font-family: var(--font-family-heading);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.section-header::before {
		content: '';
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--color-text-subtle);
	}

	.empty {
		padding: 40px 12px;
		text-align: center;
		font-family: var(--font-family-body);
		color: var(--color-text-subtle);
	}

	.load-more-row {
		display: flex;
		justify-content: center;
		padding: 12px;
	}
	.load-more {
		padding: 16px 32px;
		background: var(--color-surface-2);
		color: var(--color-text);
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		font-family: var(--font-family-body);
		cursor: pointer;
		transition: background 0.2s;
	}
	.load-more:hover {
		background: var(--color-surface-3);
	}
</style>
