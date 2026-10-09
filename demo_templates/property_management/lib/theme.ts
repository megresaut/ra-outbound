/**
 * Generates a coherent color system from the prospect's primary color.
 * Used to inject CSS custom properties at the root of the app.
 *
 * The base aesthetic is light operational software. The primary color
 * is used as an accent, NOT as the dominant color, so any reasonable
 * hex value should produce a usable theme on a light background.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function generateTheme(primaryHex: string) {
  const { r, g, b } = hexToRgb(primaryHex);
  const [h, s] = rgbToHsl(r, g, b);

  // Cap saturation to keep things looking refined regardless of input
  const cappedS = Math.min(s, 75);

  // Mid lightness for accent — readable on white, distinguishable from text.
  // `bright` is darker (used for hover/emphasis on light bg).
  return {
    "--accent-h": String(h),
    "--accent-s": `${cappedS}%`,
    "--accent": `hsl(${h} ${cappedS}% 48%)`,
    "--accent-bright": `hsl(${h} ${cappedS}% 38%)`,
    "--accent-dim": `hsl(${h} ${cappedS}% 60%)`,
    "--accent-glow": `hsla(${h}, ${cappedS}%, 50%, 0.10)`,
    "--accent-border": `hsla(${h}, ${cappedS}%, 50%, 0.28)`,
  };
}
