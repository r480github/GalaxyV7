/**
 * Inject a <script> tag and resolve when it finishes loading.
 * Used for the proxy runtime bundles (baremux, glass, polygon) which expose
 * their APIs as window globals rather than ES module exports.
 */
export function loadScript(src) {
	return new Promise((resolve, reject) => {
		// Avoid re-injecting on HMR / navigation
		const existing = document.querySelector(`script[data-proxy-src="${src}"]`);
		if (existing) {
			resolve();
			return;
		}

		const s = document.createElement('script');
		s.src = src;
		s.dataset.proxySrc = src;
		s.onload = () => resolve();
		s.onerror = () => reject(new Error(`Failed to load ${src}`));
		document.head.appendChild(s);
	});
}

/**
 * Load several scripts strictly in order (each waits for the previous).
 * Order matters here: glass.bundle.js must run before glass.config.js, etc.
 */
export async function loadScriptsSequential(srcs) {
	for (const src of srcs) {
		await loadScript(src);
	}
}
