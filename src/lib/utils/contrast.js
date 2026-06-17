// all this math stuff is vibe coded
// window resize logic has fried my brain enough
import { extractColors } from 'extract-colors';
const TEXT_LIGHT = { css: 'var(--color-text)' };
const TEXT_DARK = { css: 'var(--color-text-dark)' };
function relativeLuminance(hex) {
	const c = hex.replace('#', '');
	const linear = [c.slice(0, 2), c.slice(2, 4), c.slice(4, 6)].map((pair) => {
		const s = parseInt(pair, 16) / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(l1, l2) {
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}
export default async function getContrast(bg) {
	const colors = await extractColors(bg);
	if (!colors.length) return TEXT_LIGHT.css;
	const totalArea = colors.reduce((sum, c) => sum + c.area, 0) || 1;
	const bgLum = colors.reduce((sum, c) => sum + relativeLuminance(c.hex) * c.area, 0) / totalArea;

	const lightContrast = contrast(bgLum, relativeLuminance(TEXT_LIGHT.hex));
	const darkContrast = contrast(bgLum, relativeLuminance(TEXT_DARK.hex));

	return lightContrast >= darkContrast ? TEXT_LIGHT.css : TEXT_DARK.css;
}
