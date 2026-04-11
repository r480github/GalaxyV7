import { writable } from 'svelte/store';
export const topZ = writable(1);
export const windowList = writable([]);
export const minimizedSig = writable([]);
export const activeSignal = writable(null);
export const focusWindowTop = writable(null);