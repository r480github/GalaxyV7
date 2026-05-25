const KEY = 0x5a;

function toBytes(name: string): Uint8Array {
	return new TextEncoder().encode(name);
}

export function encodeName(name: string): string {
	let bin = '';
	for (const b of toBytes(name)) bin += String.fromCharCode(b ^ KEY);
	return btoa(bin);
}

export function decodeName(value: string): string {
	try {
		const bin = atob(value);
		const bytes = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ KEY;
		const out = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
		return out;
	} catch {
		return value;
	}
}
