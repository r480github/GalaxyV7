import { browser } from '$app/environment';
import { loadSetting, saveSetting } from '$lib/utils/localspace.js';
export const themes = [
	'ember-dusk',
	'terracotta',
	'amber-haze',
	'honeyed-dusk',
	'dijon',
	'wheatfield',
	'olive-grove',
	'moss-stone',
	'sage-mist',
	'fern-hollow',
	'eucalyptus',
	'seafoam',
	'lagoon',
	'glacier',
	'dusty-denim',
	'twilight-blue',
	'indigo-veil',
	'wisteria',
	'lavender-haze',
	'amethyst-smoke',
	'plum-velvet',
	'mauve-dream',
	'orchid-smoke',
	'rosewood',
	'sepia-tape',
	'slate-fog',
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
