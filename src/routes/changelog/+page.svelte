<script>
	import releases from '$lib/changelog/entries.json';
	import Cloak from '$lib/changelog/cloak.svelte';
</script>

<svelte:head>
	<title>Updates - Classroom</title>
</svelte:head>

<div class="blur"></div>
<div class="card">
	{#each releases as release, i (release.key)}
		{#if i > 0}<div class="spacer"></div>{/if}
		<h1><Cloak text={release.title} /></h1>
		<p><b>{release.date}</b></p>
		<p><b>Don't see the changes? Do ctrl + shift + r</b></p>

		<div class="divider"></div>
		<h2>What's new?</h2>
		<div class="updateInfo">
			{#each release.sections as section (section.area)}
				<div class="block">
					<div class="area">- <Cloak text={section.area} /></div>
					{#each section.items as item, n (n)}
						<div class="item">- <Cloak text={item} /></div>
					{/each}
				</div>
				<div class="dividerSmall"></div>
			{/each}
		</div>
	{/each}
</div>

<style>
	:global(body) {
		background: var(--color-bg);
		margin: 0;
	}

	.blur {
		position: fixed;
		inset: 0;
		z-index: -1;
		background: var(--color-glass);
		backdrop-filter: blur(20px);
	}

	.card {
		max-width: 860px;
		margin: 0 auto;
		padding: 40px 32px 80px;
		box-sizing: border-box;
	}

	h1 {
		margin: 0;
		font-family: var(--font-family-heading);
		font-size: 30px;
		font-weight: 600;
		color: var(--color-text);
	}

	h2 {
		margin: 0 0 12px;
		font-family: var(--font-family-heading);
		font-size: 19px;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	p {
		margin: 6px 0 0;
		font-size: 14px;
		color: var(--color-text-subtle);
	}

	.divider {
		width: 20%;
		height: 10px;
		border-bottom: 1px solid var(--color-border);
		margin-top: 20px;
		margin-bottom: 20px;
	}

	.dividerSmall {
		width: 60px;
		height: 1px;
		background: var(--color-border);
		margin: 14px 0 14px 24px;
	}
	.dividerSmall:last-child {
		display: none;
	}

	.updateInfo {
		border-radius: 12px;
		padding: 18px 10px;
	}

	.block {
		font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
		font-size: 13.5px;
		line-height: 1.75;
		overflow-wrap: anywhere;
	}

	.area {
		padding-left: 6ch;
		color: var(--color-text);
		font-weight: 700;
	}

	.item {
		padding-left: 14ch;
		text-indent: -2ch;
	}

	.spacer {
		height: 90px;
	}

	@media (max-width: 640px) {
		.card {
			padding: 28px 16px 60px;
		}
		h1 {
			font-size: 24px;
		}
		.block {
			font-size: 12.5px;
		}
		.area {
			padding-left: 2ch;
		}
		.item {
			padding-left: 6ch;
		}
		.divider {
			width: 40%;
		}
	}
</style>
