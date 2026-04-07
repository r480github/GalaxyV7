import { writable } from 'svelte/store';
export const topZ = writable(1);
export const isDraggingAny = writable(false);
export const windowList = writable([]);
export const minimizedSig = writable([]);
export const activeSignal = writable(null);
