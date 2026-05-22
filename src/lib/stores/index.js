import { writable } from 'svelte/store';
export const topZ = writable(1);
export const windowList = writable([]);
export const minimizedSig = writable([]);
export const activeSignal = writable(null);
export const focusWindowTop = writable(null);
export const activeTab = writable(null); // active tab id
export const deleteTab = writable(null); // tab id to delete
export const tabID = writable(null); // tab id
// Nav-button signals. "Idle" = null. A button click stamps the active tab's
// id here; the iframe whose id matches acts on it and resets it back to null.
export const reloadSignal = writable(null);
export const goBackSignal = writable(null);
export const goForwardSignal = writable(null);