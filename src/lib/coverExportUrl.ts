function isAlreadyProxied(url: string): boolean {
  return (
    url.includes('/api/img-proxy') ||
    url.includes('images.weserv.nl') ||
    url.includes('wsrv.nl')
  );
}

/**
 * Cross-origin cover URLs fail html-to-image's canvas embed (no CORS headers).
 * Route through our own Vercel proxy (/api/img-proxy) which fetches server-side
 * and returns Access-Control-Allow-Origin: *
 * Preview uses the original src; only swap right before export, then restore.
 */
export function coverUrlForRasterExport(resolvedSrc: string): string {
  const t = (resolvedSrc ?? '').trim();
  if (!t || t.startsWith('data:') || t.startsWith('blob:')) return t;
  if (isAlreadyProxied(t)) return t;
  if (!/^https?:\/\//i.test(t)) return t;
  try {
    if (
      typeof window !== 'undefined' &&
      new URL(t, window.location.href).origin === window.location.origin
    ) {
      return t;
    }
  } catch {
    return t;
  }
  return `/api/img-proxy?url=${encodeURIComponent(t)}`;
}
