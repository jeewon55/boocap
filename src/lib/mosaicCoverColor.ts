function fract01(n: number): number {
  return n - Math.floor(n);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** Blend extracted RGB toward white for a soft cell background. */
function toPaleTone(r: number, g: number, b: number, mixTowardWhite = 0.75): string {
  const rr = Math.round(r + (255 - r) * mixTowardWhite);
  const gg = Math.round(g + (255 - g) * mixTowardWhite);
  const bb = Math.round(b + (255 - b) * mixTowardWhite);
  return `rgb(${rr},${gg},${bb})`;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max <= 0) return 0;
  return (max - min) / max;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('img'));
    img.src = url;
  });
}

/**
 * CORS-friendly proxy for hotlinked covers (Kakao CDN, etc.).
 * @see https://images.weserv.nl/docs/quick-reference.html
 */
function proxiedCoverUrl(original: string): string {
  return `https://images.weserv.nl/?url=${encodeURIComponent(original)}&w=96&h=140&fit=cover&output=webp`;
}

function shouldTryProxy(original: string): boolean {
  if (!original || original.startsWith('data:') || original.startsWith('blob:')) return false;
  if (original.includes('images.weserv.nl')) return false;
  return /^https?:\/\//i.test(original);
}

type Bin = { r: number; g: number; b: number; w: number };

/**
 * Weighted histogram: favors saturated pixels so spine/white margins don't steal the bin.
 */
function extractDominantFromImageData(data: Uint8ClampedArray, seed: number): string | null {
  const counts = new Map<string, Bin>();

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 100) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = luminance(r, g, b);
    if (lum > 250 || lum < 5) continue;

    const sat = saturation(r, g, b);
    // Gray gutters / paper: count less
    let weight = 1 + sat * 2.2;
    if (sat < 0.1 && lum > 38 && lum < 215) weight *= 0.35;

    const qr = (r >> 3) << 3;
    const qg = (g >> 3) << 3;
    const qb = (b >> 3) << 3;
    const key = `${qr},${qg},${qb}`;
    const prev = counts.get(key);
    if (prev) prev.w += weight;
    else counts.set(key, { r: qr, g: qg, b: qb, w: weight });
  }

  let best: Bin | null = null;
  for (const v of counts.values()) {
    if (!best || v.w > best.w) best = v;
  }

  if (!best || best.w < 2.5) return null;

  // Tiny hue nudge so adjacent months don't look identical on flat covers
  const j = fract01(seed * 0.001 + best.r * 0.01);
  const bump = (channel: number) => Math.max(0, Math.min(255, Math.round(channel + (j - 0.5) * 6)));

  return toPaleTone(bump(best.r), bump(best.g), bump(best.b));
}

function extractFromBitmap(img: HTMLImageElement, seed: number): string | null {
  try {
    const canvas = document.createElement('canvas');
    const w = 72;
    const ar = img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 1.4;
    const h = Math.max(10, Math.round(w * ar));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    return extractDominantFromImageData(data, seed);
  } catch {
    return null;
  }
}

async function extractFromUrl(url: string, seed: number): Promise<string | null> {
  try {
    const img = await loadImage(url);
    if (img.naturalWidth < 2 || img.naturalHeight < 2) return null;
    return extractFromBitmap(img, seed);
  } catch {
    return null;
  }
}

/**
 * Loads a cover and returns a pale RGB string from the dominant cover color.
 * Tries the original URL, then a CORS-friendly image proxy (for Kakao / blocked CDNs).
 */
export async function getPaleDominantCoverBackground(imageUrl: string): Promise<string | null> {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return null;

  const seed = hashStr(trimmed);

  // Prefer small proxied image first: fast, CORS-friendly; original is often huge or blocked by CORS.
  if (shouldTryProxy(trimmed)) {
    const fromProxy = await extractFromUrl(proxiedCoverUrl(trimmed), seed);
    if (fromProxy) return fromProxy;
  }

  return extractFromUrl(trimmed, seed);
}

const MOSAIC_NEAR_WHITE_LUM = 241;
/** Max R/G/B spread for treating a color as neutral (white / light gray), not a pale tint. */
const MOSAIC_NEAR_WHITE_CHROMA = 18;
const MOSAIC_CELL_LIGHT_GRAY = '#F2F2F2';

function parseRgbCss(s: string): { r: number; g: number; b: number } | null {
  const t = s.trim();
  const m = t.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  const hex = t.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!hex) return null;
  const h = hex[1];
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Mosaic tile backdrop: pure / near-white reads as “no fill” on white posters — use a light gray.
 */
export function mosaicBackdropIfNearlyWhite(cssColor: string): string {
  const p = parseRgbCss(cssColor);
  if (!p) return cssColor;
  const { r, g, b } = p;
  const lum = luminance(r, g, b);
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  if (lum >= MOSAIC_NEAR_WHITE_LUM && chroma <= MOSAIC_NEAR_WHITE_CHROMA) {
    return MOSAIC_CELL_LIGHT_GRAY;
  }
  return cssColor;
}
