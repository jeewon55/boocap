import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_HOSTS = [
  'search1.kakaocdn.net',
  'search2.kakaocdn.net',
  't1.daumcdn.net',
  't2.daumcdn.net',
  'books.google.com',
  'books.googleusercontent.com',
  'lh3.googleusercontent.com',
  'images-na.ssl-images-amazon.com',
  'images.gr-assets.com',
  'image.aladin.co.kr',
  'cover.nl.go.kr',
  'picsum.photos',
];

function isAllowed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

  if (!url || !isAllowed(url)) {
    return res.status(400).json({ error: 'Missing or disallowed URL' });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Boocap/1.0)',
        Accept: 'image/*,*/*;q=0.8',
      },
      // 10-second timeout via AbortSignal
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream ${upstream.status}` });
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await upstream.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ error: 'Fetch failed', detail: String(err) });
  }
}
