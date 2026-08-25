<script lang="ts">
	import type { Game } from './types';
	import FillerName from './fillerName.svelte';

	let { game, onclose }: { game: Game | null; onclose: () => void } = $props();

	let frame = $state<HTMLIFrameElement>();

	$effect(() => {
		document.body.style.overflow = game ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function requestFullscreen() {
		frame?.requestFullscreen?.();
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && game) onclose();
	}
</script>

<svelte:window {onkeydown} />

{#if game}
	<div class="overlay">
		<div class="toolbar">
			<button class="tbtn" onclick={onclose}>
				<svg
					viewBox="0 0 24 24"
					width="14"
					height="14"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back
			</button>

			<span class="title"><FillerName text={game.name} /></span>

			<button class="tbtn" onclick={requestFullscreen} aria-label="Fullscreen">
				<svg
					viewBox="0 0 24 24"
					width="14"
					height="14"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
				</svg>
			</button>
		</div>

		<iframe
			bind:this={frame}
			src={game.url}
			title=""
			sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-pointer-lock"
			allow="autoplay; fullscreen; gamepad"
		></iframe>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 16px;
		background: var(--color-black);
		border-bottom: 1px solid var(--color-border);
	}

	.tbtn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--overlay-hover);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		padding: 8px 18px;
		border-radius: 999px;
		cursor: pointer;
		font-size: 14px;
		font-family: var(--font-family-body);
		backdrop-filter: blur(12px);
		transition:
			background 0.2s,
			color 0.2s;
	}
	.tbtn:hover {
		background: var(--overlay-hover-strong);
		color: var(--color-text);
	}

	.title {
		flex: 1;
		font-family: var(--font-family-heading);
		font-weight: 600;
		font-size: 15px;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	iframe {
		flex: 1;
		width: 100%;
		border: none;
		background: var(--color-black);
	}
</style>
