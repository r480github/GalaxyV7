import { browser } from '$app/environment';
import { loadSetting, saveSetting } from '$lib/utils/localspace.js';
export const themes = [
	'crimson',
	'ember-dusk',
	'terracotta',
	'tangerine',
	'amber-haze',
	'marigold',
	'citron',
	'olive-grove',
	'clover',
	'fern-hollow',
	'emerald',
	'eucalyptus',
	'aqua',
	'glacier',
	'azure',
	'indigo-veil',
	'violet',
	'amethyst-smoke',
	'plum-velvet',
	'fuchsia',
	'orchid-smoke',
	'rosewood',
	'default'
];

export function themeLabel(slug) {
	const spaced = slug.replace(/-/g, ' ');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function applyToDocument(doc, slug) {
	if (!doc?.documentElement) return;
	if (slug) doc.documentElement.dataset.theme = slug;
	else delete doc.documentElement.dataset.theme;
}

const themeThingy = 'galaxy-theme';
let channel = null;
function getChannel() {
	if (!browser || typeof BroadcastChannel === 'undefined') return null;
	if (!channel) channel = new BroadcastChannel(themeThingy);
	return channel;
}

export function applyTheme(slug) {
	if (!browser) return;
	applyToDocument(document, slug);
}

export async function saveTheme(slug) {
	await saveSetting('theme', slug);
	applyTheme(slug);
	getChannel()?.postMessage(slug);
}

export async function loadTheme() {
	return await loadSetting('theme', '');
}

export function initTheme() {
	if (!browser) return () => {};
	loadTheme().then(applyTheme);
	const ch = getChannel();
	if (!ch) return () => {};
	const onMessage = (event) => applyTheme(event.data);
	ch.addEventListener('message', onMessage);
	return () => ch.removeEventListener('message', onMessage);
}
