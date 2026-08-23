export function loadScript(src) {
	return new Promise((resolve, reject) => {
		const existing = document.querySelector(`script[data-mod="${src}"]`);
		if (existing) {
			resolve();
			return;
		}

		const s = document.createElement('script');
		s.src = src;
		s.dataset.mod = src;
		s.onload = () => resolve();
		s.onerror = () => reject(new Error(`Failed to load ${src}`));
		document.head.appendChild(s);
	});
}

export async function loadScriptsSequential(srcs) {
	for (const src of srcs) {
		await loadScript(src);
	}
}
