
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
		padding: 8px 12px;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.tbtn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: var(--color-surface-2);
		color: var(--color-text);
		border: none;
		padding: 6px 14px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-family: var(--font-family-body);
	}
	.tbtn:hover {
		background: var(--color-chrome);
	}

	.title {
		flex: 1;
		font-family: var(--font-family-title);
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
		background: var(--color-bg);
	}
</style>
