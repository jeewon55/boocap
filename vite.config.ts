import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Local dev: mirror the Vercel /api/img-proxy function so coverUrl proxy works
    mode === "development" && {
      name: 'img-proxy-dev',
      configureServer(server: any) {
        server.middlewares.use('/api/img-proxy', async (req: any, res: any) => {
          const qs = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
          const targetUrl = new URLSearchParams(qs).get('url') ?? '';
          if (!targetUrl || !isAllowed(targetUrl)) {
            res.statusCode = 400;
            res.end('Missing or disallowed URL');
            return;
          }
          try {
            const upstream = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                Accept: 'image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                Referer: 'https://search.kakao.com/',
              },
              signal: AbortSignal.timeout(10_000),
            });
            if (!upstream.ok) {
              res.statusCode = 502;
              res.end(`Upstream ${upstream.status}`);
              return;
            }
            const buffer = await upstream.arrayBuffer();
            res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'image/jpeg');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.statusCode = 200;
            res.end(Buffer.from(buffer));
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
