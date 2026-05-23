export function search(input, template) {
	let searchEngine;
	if (template == 'ddg') {
		searchEngine = 'https://www.duckduckgo.com/search?q=%s';
	} else if (template == 'google') {
		searchEngine = 'https://google.com/search?q=%s';
	} else if (template == 'brave') {
		searchEngine = 'https://search.brave.com/search?q=%s';
	} else {
		searchEngine = 'https://www.duckduckgo.com/search?q=%s';
	}
	try {
		return new URL(input).toString();
	} catch {}

	try {
		const url = new URL(`https://${input}`);
		if (url.hostname.includes('.')) return url.toString();
	} catch {}

	return searchEngine.replace('%s', encodeURIComponent(input));
}
