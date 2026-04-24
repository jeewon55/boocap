/** Enough resolution for 1080px-wide poster export. */
const EXPORT_PROXY_W = 900;
const EXPORT_PROXY_H = Math.round(EXPORT_PROXY_W * (7 / 5));

function isAlreadyProxied(url: string): boolean {
  return url.includes('images.weserv.nl') || url.includes('wsrv.nl');
}

/**
 * Cross-origin cover URLs fail html-to-image’s fetch (no CORS). Same URL via
 * images.weserv.nl is fetchable and embeds into the PNG. Preview stays direct;
 * only use this right before export, then restore the original src.
 */
export function coverUrlForRasterExport(resolvedSrc: string): string {
  const t = (resolvedSrc ?? '').trim();
  if (!t || t.startsWith('data:') || t.startsWith('blob:')) return t;
  if (isAlreadyProxied(t)) return t;
  if (!/^https?:\/\//i.test(t)) return t;
  try {
    if (typeof window !== 'undefined' && new URL(t, window.location.href).origin === window.location.origin) {
      return t;
    }
  } catch {
    return t;
  }
  return `https://images.weserv.nl/?url=${encodeURIComponent(t)}&w=${EXPORT_PROXY_W}&h=${EXPORT_PROXY_H}&fit=cover&output=webp`;
}
