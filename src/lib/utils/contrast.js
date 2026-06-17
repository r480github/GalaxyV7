import { extractColors } from 'extract-colors';

export default async function getContrast(bg) {
	function textColor(hex) {
		const c = hex.replace('#', '');
		const r = parseInt(c.slice(0, 2), 16);
		const g = parseInt(c.slice(2, 4), 16);
		const b = parseInt(c.slice(4, 6), 16);
		const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return lum > 0.5 ? 'var(--color-text)' : 'var(--color-text-dark)';
	}
	const y = await extractColors(bg);
	const x = y[0].hex;
	console.log('dominant color is: ' + x);
	let z = textColor(x);
	console.log('inverse dominant color is: ' + z);
	return z;
}
