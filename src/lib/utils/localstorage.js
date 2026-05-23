import { browser } from '$app/environment';

export function loadSetting(key, fallback) {
	if (!browser) {
		return fallback;
	}
	return localStorage.getItem(key) ?? fallback;
}
