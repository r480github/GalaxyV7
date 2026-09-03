<!--This page is for debugging purposes-->
<!--For the actual proxy, go to slate/+page.svelte-->
<script>
	import { loadScript } from '$lib/lethe/loader';
	import { search } from '$lib/lethe/search';
	import { createConnection, setCar } from '$lib/lethe/car';
	import { createScramjetController } from '$lib/lethe/poly';
	import { createPrismController, setPrismTransport, getPrismController } from '$lib/lethe/prism';
	import { getOriginalUrl } from '$lib/lethe/decode';

	let query = $state('');
	let letheEngine = $state('prism');
	let iframeEl;
	let polygon;
	let decodedURL = $state('');
	let url = $state('');
	let car = $state('libcurl');
	let connection;
	let prismController;
	let prismFrame;

	//  debugger is vibecoded
	// Nothing loads on mount. Each step is clicked by hand, in order, so the
	// service worker registrations never race each other.
	let steps = $state([
		{ key: 'charon', label: 'Charon', status: 'idle', error: '' },
		{ key: 'glassBundle', label: 'Glass bundle', status: 'idle', error: '' },
		{ key: 'glassConfig', label: 'Glass config', status: 'idle', error: '' },
		{ key: 'polygon', label: 'Polygon engine', status: 'idle', error: '' },
		{ key: 'scramjet', label: 'Glass controller', status: 'idle', error: '' },
		{ key: 'prism', label: 'SJ2 (prism)', status: 'idle', error: '' },
		{ key: 'transport', label: 'Car connection', status: 'idle', error: '' },
		{ key: 'serviceWorker', label: 'Service worker', status: 'idle', error: '' }
	]);

	const runners = {
		charon: () => loadScript('/charon/index.js'),
		glassBundle: () => loadScript('/glass/glass.bundle.js'),
		glassConfig: () => loadScript('/glass/glass.config.js'),
		polygon: () => loadScript('/poly/polygon.all.js'),
		scramjet: async () => {
			if (!navigator.serviceWorker) throw new Error('Service workers not supported');
			polygon = createScramjetController();
			polygon.init();
		},
		prism: async () => {
			await loadScript('/hive/prism.js');
			await loadScript('/hive/prism.api.js');
		},
		transport: async () => {
			connection = createConnection();
			await setCar(connection, car);
		},
		serviceWorker: () => navigator.serviceWorker.register('/servy.js')
	};

	// The first step that is not done yet. Only its button is clickable.
	let stepIndex = $derived(steps.findIndex((step) => step.status !== 'done'));
	let running = $derived(steps.some((step) => step.status === 'running'));
	let ready = $derived(stepIndex === -1);

	async function runStep(index) {
		if (running || index !== stepIndex) return;
		const step = steps[index];
		step.status = 'running';
		step.error = '';
		try {
			await runners[step.key]();
			step.status = 'done';
		} catch (e) {
			step.status = 'error';
			step.error = e instanceof Error ? e.message : String(e);
			console.error(`Failed to load ${step.key}:`, e);
		}
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!ready) return;
		const fixedUrl = search(query);

		if (letheEngine === 'prism') {
			if (!prismController) prismController = await createPrismController(car);
			if (!prismFrame) prismFrame = prismController.createFrame(iframeEl);
			decodedURL = fixedUrl;
			prismFrame.go(fixedUrl);
			return;
		}

		if (letheEngine === 'uv') {
			url = window.__uv$config.prefix + window.__uv$config.encodeUrl(fixedUrl);
		} else {
			url = polygon.encodeUrl(fixedUrl);
		}
		decodedURL = getOriginalUrl(url);
		console.log('decoded is:' + decodedURL);
		iframeEl.src = url;
	}
	$effect(() => {
		if (ready && connection) {
			setCar(connection, car);
		}
		// Keep a live Prism controller's transport in sync with the car dropdown.
		if (getPrismController()) {
			setPrismTransport(car);
		}
	});
</script>

{#if !ready}
	<div class="loading-status">
		<p class="loading-title">Load each piece in order</p>
		{#each steps as step, index (step.key)}
			<div class="loading-item" class:loading-next={index === stepIndex}>
				{#if step.status === 'done'}
					<span class="loading-check">✔</span>
				{:else if step.status === 'running'}
					<span class="loading-pending">…</span>
				{:else if step.status === 'error'}
					<span class="loading-error">✖</span>
				{:else}
					<span class="loading-pending">•</span>
				{/if}
				<span class="loading-label">{index + 1}. {step.label}</span>
				{#if step.status !== 'done'}
					<button
						type="button"
						class="loading-button"
						onclick={() => runStep(index)}
						disabled={running || index !== stepIndex}
					>
						{#if step.status === 'running'}
							Loading…
						{:else if step.status === 'error'}
							Retry
						{:else}
							Load
						{/if}
					</button>
				{/if}
				{#if step.error}
					<span class="loading-error">{step.error}</span>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<form onsubmit={handleSubmit}>
	<input
		type="text"
		class="search-input search"
		placeholder="Search"
		bind:value={query}
		disabled={!ready}
	/>
	<p>{decodedURL}</p>
	<select bind:value={letheEngine} disabled={!ready}>
		<option value="scramjet">Scramjet</option>
		<option value="prism">Scramjet v2</option>
		<option value="uv">Ultraviolet</option>
	</select>
	<select bind:value={car} disabled={!ready}>
		<option value="libcurl">Libcurl</option>
		<option value="epoxy">Epoxy</option>
	</select>
</form>
<iframe bind:this={iframeEl} title=""></iframe>

<style>
	:global(body) {
		height: 100vh;
		width: 100vw;
		margin: 0;
		border: none;
		display: flex;
		flex-direction: column;
	}
	iframe {
		width: 100%;
		flex-grow: 1;
		border: none;
		margin: 0;
	}
	.loading-status {
		padding: 16px;
		font-family: var(--font-family-body);
		color: var(--color-text);
	}
	.loading-title {
		margin: 0 0 8px;
		font-weight: bold;
	}
	.loading-item {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 4px 0;
		color: var(--color-text-subtle);
	}
	.loading-next {
		color: var(--color-text);
	}
	.loading-label {
		min-width: 160px;
	}
	.loading-button {
		font: inherit;
		padding: 2px 10px;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		color: var(--color-text);
		cursor: pointer;
	}
	.loading-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.loading-check {
		color: var(--color-pin);
	}
	.loading-pending {
		color: var(--color-text-subtle);
	}
	.loading-error {
		color: var(--color-danger);
	}
</style>
