export function getOriginalUrl(url) {
	if (!url) return '';
	if (url.includes('/~/sj/')) {
		try {
			const path = url.split('#')[0].split('?')[0];
			const after = path.split('/~/sj/')[1];
			const encoded = after.split('/').slice(2).join('/'); 
			const decoded = decodeURIComponent(encoded);
			return decoded.startsWith('http') ? decoded : '';
		} catch (e) {
			return '';
		}
	}
	if (url.includes('polygon')) {
		try {
			if (url.startsWith('/polygon/')) {
				const encodedUrl = url.substring('/polygon/'.length);
				try {
					const decoded = decodeURIComponent(encodedUrl);
					if (decoded.startsWith('http')) {
						return decoded;
					}
					const base64Decoded = atob(encodedUrl);
					if (base64Decoded.startsWith('http')) {
						return base64Decoded;
					}
				} catch (e) {}
			}
		} catch (e) {}
	} else {
		return __uv$config.decodeUrl(url.split(__uv$config.prefix)[1]);
	}
}
