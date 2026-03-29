/** Blend extracted RGB toward white for a soft cell background. */
function toPaleTone(r: number, g: number, b: number, mixTowardWhite = 0.75): string {
  const rr = Math.round(r + (255 - r) * mixTowardWhite);
  const gg = Math.round(g + (255 - g) * mixTowardWhite);
  const bb = Math.round(b + (255 - b) * mixTowardWhite);
  return `rgb(${rr},${gg},${bb})`;
}

/**
 * Loads a cover image and returns the most frequent non-extreme color, as a pale RGB string.
 * Uses canvas + quantized histogram. Fails (CORS-tainted, etc.) → null.
 */
export function getPaleDominantCoverBackground(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const finish = (v: string | null) => resolve(v);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = 56;
        const ar = img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 1;
        const h = Math.max(8, Math.round(w * ar));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const counts = new Map<string, { r: number; g: number; b: number; n: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 120) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > 248 || lum < 10) continue;

          const qr = (r >> 3) << 3;
          const qg = (g >> 3) << 3;
          const qb = (b >> 3) << 3;
          const key = `${qr},${qg},${qb}`;
          const prev = counts.get(key);
          if (prev) prev.n += 1;
          else counts.set(key, { r: qr, g: qg, b: qb, n: 1 });
        }

        let best: { r: number; g: number; b: number; n: number } | null = null;
        for (const v of counts.values()) {
          if (!best || v.n > best.n) best = v;
        }
        if (!best || best.n < 4) {
          finish(null);
          return;
        }
        finish(toPaleTone(best.r, best.g, best.b));
      } catch {
        finish(null);
      }
    };

    img.onerror = () => finish(null);
    img.src = imageUrl;
  });
}
