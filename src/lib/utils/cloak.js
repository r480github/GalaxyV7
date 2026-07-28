import { browser } from '$app/environment';
import { loadSetting, saveSetting } from '$lib/utils/localspace.js';

const decoyThing = 'https://www.google.com';

function topWindow() {
	if (!browser) return null;
	return window.top ?? window;
}

function siteUrl() {
	const top = topWindow();
	return top ? top.location.href : '/';
}

function currentDisguise() {
	const doc = topWindow()?.document;
	const link = /** @type {HTMLLinkElement | null} */ (
		doc?.querySelector('link[rel~="icon"]') ?? null
	);
	return { title: doc?.title || 'Classroom', icon: link?.href || '' };
}

function cloakMarkup({ fixedIframe }) {
	const { title, icon } = currentDisguise();
	const iconTag = icon ? `<link rel="icon" href="${icon}" />` : '';
	const iframeReset = fixedIframe ? 'position: fixed; inset: 0;' : '';
	return `<!DOCTYPE html>
<html>
	<head>
		<title>${title}</title>
		${iconTag}
		<style>
			html, body { margin: 0; height: 100%; overflow: hidden; background: #000; }
			iframe { ${iframeReset} width: 100vw; height: 100vh; border: 0; }
		</style>
	</head>
	<body>
		<iframe src="${siteUrl()}"></iframe>
	</body>
</html>`;
}

function goToDecoything() {
	topWindow()?.location.replace(decoyThing);
}
//ab
export function openAboutBlank() {
	if (!browser) return false;
	const win = window.open('about:blank', '_blank');
	if (!win) return false;
	win.document.documentElement.innerHTML = cloakMarkup({ fixedIframe: false });
	win.document.close();
	goToDecoything();
	return true;
}
// blob
export function openBlob() {
	if (!browser) return false;
	const blob = new Blob([cloakMarkup({ fixedIframe: true })], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const win = window.open(url);
	if (!win) {
		URL.revokeObjectURL(url);
		return false;
	}
	goToDecoything();
	return true;
}

function beforeUnloadGuard(event) {
	event.preventDefault();
}
// changes may not be saved prompt
export function setAntiClose(enabled) {
	const top = topWindow();
	if (!top) return;
	const store = /** @type {any} */ (top);
	if (enabled) {
		if (store.__galaxyAntiClose) return;
		store.__galaxyAntiClose = beforeUnloadGuard;
		top.addEventListener('beforeunload', beforeUnloadGuard);
	} else if (store.__galaxyAntiClose) {
		top.removeEventListener('beforeunload', store.__galaxyAntiClose);
		store.__galaxyAntiClose = null;
	}
}

export function applyTabPreset(name, icon) {
	const doc = topWindow()?.document;
	if (!doc) return;
	if (name) doc.title = name;
	if (icon) {
		let link = /** @type {HTMLLinkElement | null} */ (doc.querySelector('link[rel~="icon"]'));
		if (!link) {
			link = doc.createElement('link');
			link.rel = 'icon';
			doc.head.appendChild(link);
		}
		link.href = icon;
	}
}
export async function saveTabPreset(name, icon) {
	await saveSetting('tabPreset', { name, icon });
	applyTabPreset(name, icon);
}

export async function loadTabPreset() {
	const preset = /** @type {{ name?: string, icon?: string } | null} */ (
		await loadSetting('tabPreset', null)
	);
	if (preset && (preset.name || preset.icon)) applyTabPreset(preset.name, preset.icon);
}

export async function applyStartupSettings() {
	if (!browser) return;

	await loadTabPreset();
	setAntiClose(await loadSetting('antiClose', false));

	if (window.self !== window.top) return;

	const [autoAB, autoBlob] = await Promise.all([
		loadSetting('autoAB', false),
		loadSetting('autoBlob', false)
	]);
	if (autoAB) openAboutBlank();
	else if (autoBlob) openBlob();
}
