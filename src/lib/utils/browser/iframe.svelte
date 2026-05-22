<script>
	import { activeTab } from '$lib/stores/index.js';
	import { getOriginalUrl } from '$lib/lethe/decode';
	let { id, src = null, onnavigate } = $props();
	let frame;

	function reportUrl() {
		try {
			const loc = frame.contentWindow.location;
			const stripped = loc.pathname + loc.search + loc.hash;
			const url = getOriginalUrl(stripped);
			const title = frame.contentWindow.document.title || url;
			onnavigate?.({ url, title });
		} catch (e) {
		}
	}

	function handleLoad() {
		reportUrl();
		try {
			const win = frame.contentWindow;
			win.addEventListener('popstate', reportUrl);
			win.addEventListener('hashchange', reportUrl);
			const titleEl = win.document.querySelector('title');
			if (titleEl) {
				const titleObserver = new MutationObserver(reportUrl);
				titleObserver.observe(titleEl, { childList: true });
			}
		} catch (e) {
		}
	}
</script>

<iframe
	bind:this={frame}
	{src}
	onload={handleLoad}
	frameborder="0"
	style="display: {id === $activeTab ? 'block' : 'none'};"
></iframe>

<style>
	iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>
