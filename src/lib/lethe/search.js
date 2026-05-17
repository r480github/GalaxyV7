export function search(input, template = 'https://www.duckduckgo.com/search?q=%s') {
	try {
		return new URL(input).toString();
	} catch {}

	try {
		const url = new URL(`http://${input}`);
		if (url.hostname.includes('.')) return url.toString();
	} catch {}

	return template.replace('%s', encodeURIComponent(input));
}
