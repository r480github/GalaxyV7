export const codec = {
	encode: (s) => {
		if (!s) return s;

		const k = 'b75f9583b6d8fdc8b1e918a938878cb8d86e2f59817590301085b885cb0b89f8';

		const bytes = new TextEncoder().encode(s);
		let scrambled = '';
		for (let i = 0; i < bytes.length; i++) {
			const keyByte = k.charCodeAt(i % k.length);
			scrambled += String.fromCharCode(bytes[i] ^ keyByte);
		}

		return btoa(scrambled).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	},

	decode: (s) => {
		if (!s) return s;

		const k = 'b75f9583b6d8fdc8b1e918a938878cb8d86e2f59817590301085b885cb0b89f8';

		let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
		while (b64.length % 4) b64 += '=';
		let scrambled;
		try {
			scrambled = atob(b64);
		} catch {
			return s;
		}
		const bytes = new Uint8Array(scrambled.length);
		for (let i = 0; i < scrambled.length; i++) {
			const keyByte = k.charCodeAt(i % k.length);
			bytes[i] = scrambled.charCodeAt(i) ^ keyByte;
		}
		return new TextDecoder().decode(bytes);
	}
};
