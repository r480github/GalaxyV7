export function url(input) {
	if (!input) return '';
	try {
		return new URL(input).toString();
	} catch {}
	try {
		const u = new URL(`http://${input}`);
		if (u.hostname.includes('.')) return u.toString();
	} catch {}
	return `https://duckduckgo.com/?q=${input}`;
}

async function waitReady() {
	while (!window.__proxyReady) {
		await new Promise((r) => setTimeout(r, 20));
	}
	await window.__proxyReady;
}

export async function encodeUrl(input, type = 'default') {
	await waitReady();
	const resolved = url(input);
	if (type === 'uv') {
		return window.__uv$config.prefix + window.__uv$config.encodeUrl(resolved);
	}
	return window.__scramjet.encodeUrl(resolved);
}

export async function setTransport(name) {
	await waitReady();
	return window.__setTransport?.(name);
}