<script>
	import '$lib/style/themes.css';
	import { themes, themeLabel, saveTheme, loadTheme } from '$lib/utils/theme.js';
	import { onMount } from 'svelte';

	let active = $state('');

	onMount(async () => {
		active = await loadTheme();
	});

	function select(slug) {
		active = slug;
		saveTheme(slug);
	}
</script>

<div class="head">
	<div class="headText">
		<h1>Themes</h1>
		<p class="hint">Chill lofi vibes~</p>
	</div>
	<div class="preview" aria-hidden="true">
		<iframe src="/slate?preview" title="Theme preview" loading="lazy" inert></iframe>
	</div>
</div>
<div class="themeGrid">
	{#each themes as slug}
		<button
			class="themeCard"
			class:active={active === slug}
			data-theme={slug}
			onclick={() => select(slug)}
		>
			<div class="cardHeader">
				<span class="cardName">{themeLabel(slug)}</span>
			</div>
			<div class="cardBody">
				<div class="swatches">
					<span class="swatch one"></span>
					<span class="swatch two"></span>
					<span class="swatch three"></span>
				</div>
				<div class="cardFooter">
					<div class="dots">
						<span class="dot pin"></span>
						<span class="dot danger"></span>
						<span class="dot success"></span>
					</div>
				</div>
			</div>
		</button>
	{/each}
</div>

<style>
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24px;
		height: auto;
		width: 100%;
		margin-bottom: 32px;
	}
	.headText {
		flex-grow: 1;
		min-width: 0;
	}
	/* Fixed 1216x760 render scaled to 380px wide, so the preview always shows the
	   desktop layout instead of resizing with the settings window. */
	.preview {
		flex: none;
		width: 380px;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		pointer-events: none;
		border: 1px solid var(--color-border-strong);
		border-radius: 10px;
	}
	.preview iframe {
		width: 1216px;
		height: 760px;
		border: 0;
		transform: scale(0.3125);
		transform-origin: top left;
	}
	@media (max-width: 900px) {
		.preview {
			display: none;
		}
	}
	.hint {
		margin: -8px 0 4px;
		color: var(--color-text-subtle);
		font-size: 0.95rem;
	}

	.themeGrid {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		gap: 25px;
	}

	.themeCard {
		flex-grow: 1;
		width: 250px;
		display: flex;
		flex-direction: column;
		padding: 0;
		text-align: left;
		cursor: pointer;
		overflow: hidden;
		border-radius: 16px;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			border-color 0.18s ease;
	}
	.themeCard:hover {
		transform: translateY(-4px);
		border-color: var(--color-border-strong);
		box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
	}
	.themeCard.active {
		border-color: var(--color-pin);
		transform: translateY(0px);
	}

	.cardHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 18px;
		background: var(--color-surface-2);
		border-bottom: 1px solid var(--color-border);
	}
	.cardName {
		font-family: var(--font-family-heading);
		font-weight: 700;
		font-size: 1.05rem;
		color: var(--color-text);
	}

	.cardBody {
		padding: 18px;
	}
	.swatches {
		display: flex;
		gap: 8px;
		margin-bottom: 18px;
	}
	.swatch {
		flex: 1;
		height: 28px;
		border-radius: 8px;
	}
	.swatch.one {
		background: var(--color-surface);
	}
	.swatch.two {
		background: var(--color-surface-3);
	}
	.swatch.three {
		background: var(--color-chrome);
	}

	.cardFooter {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20px;
	}
	.dots {
		display: flex;
		gap: 8px;
	}
	.dot {
		width: 20px;
		height: 10px;
		border-radius: 8px;
		margin-left: 2px;
	}
	.dot.pin {
		margin-left: 2px;
		background: var(--color-pin);
	}
	.dot.danger {
		background: var(--color-window);
	}
	.dot.success {
		background: var(--color-text-muted);
	}
</style>
