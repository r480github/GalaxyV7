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

export function applyTheme(slug) {
	if (!browser) return;
	applyToDocument(document, slug);
	const top = window.top;
	if (top && top !== window) {
		try {
			applyToDocument(top.document, slug);
		} catch {}
	}
}

export async function saveTheme(slug) {
	await saveSetting('theme', slug);
	applyTheme(slug);
}

export async function loadTheme() {
	return await loadSetting('theme', '');
}

export async function applySavedTheme() {
	applyTheme(await loadTheme());
}
