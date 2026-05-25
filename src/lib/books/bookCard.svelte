<script lang="ts">
	import type { Game } from './types';
	import { favorites } from './favorites.svelte';
	import FillerName from './fillerName.svelte';

	let { game, onopen }: { game: Game; onopen: (game: Game) => void } = $props();

	let failed = $state(false);

	function open() {
		onopen(game);
	}
</script>

<div
	class="zone"
	role="button"
	tabindex="0"
	data-zone-id={game.id}
	onclick={open}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			open();
		}
	}}
>
	{#if failed}
		<div class="fallback"><FillerName text={game.name} /></div>
	{:else}
		<img src={game.thumb} alt="" loading="lazy" decoding="async" onerror={() => (failed = true)} />
	{/if}

	<div class="zone-name"><FillerName text={game.name} /></div>

	<button
		class="favorite-btn"
		class:active={favorites.has(game.id)}
		aria-label={favorites.has(game.id) ? 'Remove from favorites' : 'Add to favorites'}
		onclick={(e) => {
			e.stopPropagation();
			favorites.toggle(game.id);
		}}
	>
		<svg
			viewBox="0 0 24 24"
			width="15"
			height="15"
			fill={favorites.has(game.id) ? 'currentColor' : 'none'}
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				d="M12 21s-7.5-4.9-10-9.3C.5 8.6 2 5 5.5 5 8 5 9.5 6.8 12 9c2.5-2.2 4-4 6.5-4C22 5 23.5 8.6 22 11.7 19.5 16.1 12 21 12 21z"
			/>
		</svg>
	</button>
</div>

<style>
	.zone {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		cursor: pointer;
		border-radius: 8px;
		background: var(--color-surface);
		contain: layout style paint;
		transition:
			transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.zone img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
		filter: brightness(0.9);
	}

	.zone:hover img,
	.zone:focus-visible img {
		transform: scale(1.1);
		filter: brightness(0.6);
	}

	.fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 8px;
		text-align: center;
		font-family: var(--font-family-body);
		font-size: 13px;
		color: var(--color-text-subtle);
	}

	.zone-name {
		position: absolute;
		inset: auto 0 0 0;
		padding: 8px 6px;
		background: rgba(0, 0, 0, 0.85);
		text-align: center;
		font-family: var(--font-family-body);
		font-size: 13px;
		font-weight: 500;
		opacity: 0;
		transition: opacity 0.15s;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.zone:hover .zone-name,
	.zone:focus-visible .zone-name {
		opacity: 1;
	}

	.favorite-btn {
		position: absolute;
		top: 6px;
		left: 6px;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.6);
		border: none;
		color: var(--color-text-subtle);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
	}
	.zone:hover .favorite-btn,
	.zone:focus-visible .favorite-btn {
		opacity: 1;
	}
	.favorite-btn:hover {
		background: rgba(0, 0, 0, 0.8);
		color: var(--color-text);
	}
	.favorite-btn.active {
		opacity: 1;
		color: var(--color-danger);
	}
</style>
