const k = 'b75f9583b6d8fdc8b1e918a938878cb8d86e2f59817590301085b885cb0b89f8';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const LOOKUP = (() => {
	const table = new Int16Array(128).fill(-1);
	for (let i = 0; i < ALPHABET.length; i++) table[ALPHABET.charCodeAt(i)] = i;
	table['+'.charCodeAt(0)] = 62;
	table['/'.charCodeAt(0)] = 63;
	return table;
})();

function toBase64Url(bytes) {
	let out = '';
	for (let i = 0; i < bytes.length; i += 3) {
		const b0 = bytes[i];
		const b1 = i + 1 < bytes.length ? bytes[i + 1] : -1;
		const b2 = i + 2 < bytes.length ? bytes[i + 2] : -1;

		out += ALPHABET[b0 >> 2];
		out += ALPHABET[((b0 & 3) << 4) | (b1 < 0 ? 0 : b1 >> 4)];
		if (b1 < 0) break;
		out += ALPHABET[((b1 & 15) << 2) | (b2 < 0 ? 0 : b2 >> 6)];
		if (b2 < 0) break;
		out += ALPHABET[b2 & 63];
	}
	return out;
}

function fromBase64Url(str) {
	const out = [];
	let buffer = 0;
	let bits = 0;

	for (let i = 0; i < str.length; i++) {
		const code = str.charCodeAt(i);
		if (code === 61) break;
		const value = code < 128 ? LOOKUP[code] : -1;
		if (value < 0) return null;

		buffer = ((buffer << 6) | value) & 0xffff;
		bits += 6;
		if (bits >= 8) {
			bits -= 8;
			out.push((buffer >> bits) & 0xff);
		}
	}

	return Uint8Array.from(out);
}

export const codec = {
	encode: (s) => {
		if (!s) return s;

		const bytes = new TextEncoder().encode(s);
		const scrambled = new Uint8Array(bytes.length);
		for (let i = 0; i < bytes.length; i++) {
			scrambled[i] = bytes[i] ^ k.charCodeAt(i % k.length);
		}

		return toBase64Url(scrambled);
	},

	decode: (s) => {
		if (!s) return s;

		const scrambled = fromBase64Url(s);
		if (!scrambled) return s;

		const bytes = new Uint8Array(scrambled.length);
		for (let i = 0; i < scrambled.length; i++) {
			bytes[i] = scrambled[i] ^ k.charCodeAt(i % k.length);
		}
		return new TextDecoder().decode(bytes);
	}
};
