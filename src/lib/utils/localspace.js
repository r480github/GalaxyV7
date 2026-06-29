

// yes, these are ai comments
/* https://www.jsdelivr.com/package/npm/localspace */

import { browser } from '$app/environment';
import localspace from 'localspace';

// One namespaced store for all Galaxy settings (IndexedDB, falling back to
// localStorage/memory automatically). Null on the server — there is no storage
// during SSR, so every read returns its fallback.
const store = browser ? localspace.createInstance({ name: 'galaxy', storeName: 'settings' }) : null;

// IndexedDB fires no change events, and our settings UI lives in an <iframe>
// separate from the pages that consume those settings (e.g. the OS desktop).
// A BroadcastChannel lets a `saveSetting` in one context notify every other
// same-origin context so they can live-update instead of waiting for a reload.
const channel = browser ? new BroadcastChannel('galaxy-settings') : null;

/**
 * Subscribe to live changes for a single setting key. The callback fires with
 * the new value whenever `saveSetting(key, ...)` runs in any same-origin
 * context (this page, another tab, or an <iframe>).
 *
 * @param {string} key
 * @param {(value: *) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onSettingChange(key, callback) {
	if (!browser || !channel) return () => {};
	const handler = (event) => {
		if (event.data?.key === key) callback(event.data.value);
	};
	channel.addEventListener('message', handler);
	return () => channel.removeEventListener('message', handler);
}

/**
 * Read a persisted setting.
 *
 * The first time a key is read, if nothing is in localspace yet but a legacy
 * `localStorage` value exists, it is migrated across (and the old key removed)
 * so existing users keep their settings. `migrate` converts the legacy string
 * into the native value (e.g. JSON.parse for arrays, `=== 'true'` for booleans).
 *
 * @template T
 * @param {string} key
 * @param {T} fallback - returned when nothing is stored
 * @param {(raw: string) => *} [migrate] - convert a legacy localStorage string
 * @returns {Promise<T>}
 */
export async function loadSetting(key, fallback, migrate = (raw) => raw) {
	if (!browser || !store) return fallback;

	let value = await store.getItem(key);

	if (value === null || value === undefined) {
		const legacy = localStorage.getItem(key);
		if (legacy !== null) {
			try {
				value = migrate(legacy);
				await store.setItem(key, value);
				localStorage.removeItem(key); // only drop the old copy once safely migrated
			} catch {
				// Corrupt legacy value (e.g. bad JSON): leave it in localStorage so it
				// isn't lost, and fall back to the default for this session.
				value = null;
			}
		}
	}

	// `??` (not `||`) so stored `false`, `0`, or `''` are preserved.
	return value ?? fallback;
}

/**
 * Persist a setting. Pass plain values only — unwrap Svelte state proxies with
 * `$state.snapshot(...)` before calling, since IndexedDB cannot clone proxies.
 *
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void>}
 */
export async function saveSetting(key, value) {
	if (!browser || !store) return;
	// Callers persist fire-and-forget (e.g. inside a Svelte $effect), so swallow
	// rejections here (quota exceeded, IndexedDB blocked) instead of leaking an
	// unhandled promise rejection.
	try {
		await store.setItem(key, value);
		// Notify other contexts (other tabs, the OS desktop behind the settings
		// iframe) so they can react without a reload. Same structured-clone rules
		// as IndexedDB, so a value that persisted above is safe to post here.
		channel?.postMessage({ key, value });
	} catch (error) {
		console.error(`Failed to persist setting "${key}":`, error);
	}
}
