<script lang="ts">
	import type { Game } from './types';
	import { formatTag } from './catalog';
	import { favorites } from './favorites.svelte';
	import FillerName from './fillerName.svelte';

	let { game, onopen }: { game: Game; onopen: (game: Game) => void } = $props();

	let failed = $state(false);

	function open() {
		onopen(game);
	}
</script>

<div
	class="bookDiv"
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
	<button
		class="favBtn"
		class:favorited={favorites.has(game.id)}
		title={favorites.has(game.id) ? 'Unfavorite' : 'Favorite'}
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

	{#if failed || !game.thumb}
		<div class="fallback"><FillerName text={game.name} /></div>
	{:else}
		<img
			src={game.thumb}
			alt=""
			class="bookImg"
			loading="lazy"
			decoding="async"
			onerror={() => (failed = true)}
		/>
	{/if}

	<div class="bookMeta">
		<span class="bookName"><FillerName text={game.name} /></span>
		{#if game.tags.length > 0}
			<span class="bookTag">{game.tags.slice(0, 3).map(formatTag).join(' · ')}</span>
		{/if}
	</div>
</div>

<style>
	.bookDiv {
		position: relative;
		aspect-ratio: 16 / 9;
		border-radius: 16px;
		overflow: hidden;
		background: var(--color-surface);
		cursor: pointer;
		contain: layout style paint;
		transition: transform 0.2s ease;
	}
	.bookDiv:hover,
	.bookDiv:focus-visible {
		transform: translateY(-4px);
		outline: none;
	}
	.bookImg {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition-duration: 0.2s;
	}
	.bookDiv:hover .bookImg,
	.bookDiv:focus-visible .bookImg {
		filter: brightness(0.5);
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

	.bookMeta {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 28px 16px 12px;
		background: linear-gradient(to top, var(--color-scrim-strong), transparent);
	}
	.bookName {
		opacity: 0;
		font-family: var(--font-family-heading);
		font-size: 22px;
		font-weight: 600;
		line-height: 1.15;
		color: var(--color-white);
		transition-duration: 0.3s;
		/* Titles run up to ~60 characters, so cap the reveal at two lines. */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	.bookTag {
		opacity: 0;
		font-family: var(--font-family-body);
		font-size: 12px;
		color: var(--color-text-muted);
		transition-duration: 0.3s;
		transition-delay: 0.06s;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.bookDiv:hover .bookName,
	.bookDiv:hover .bookTag,
	.bookDiv:focus-visible .bookName,
	.bookDiv:focus-visible .bookTag {
		opacity: 1;
		margin-left: 5%;
	}

	.favBtn {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: var(--color-scrim-medium);
		color: var(--color-white);
		cursor: pointer;
		opacity: 0;
		backdrop-filter: blur(6px);
		transition:
			opacity 0.2s ease,
			background 0.2s ease;
	}
	.bookDiv:hover .favBtn,
	.bookDiv:focus-visible .favBtn,
	.favBtn:focus-visible {
		opacity: 1;
	}
	.favBtn:hover {
		background: var(--color-scrim-strong);
	}
	.favBtn.favorited {
		opacity: 1;
		background: var(--color-pin);
	}
</style>
