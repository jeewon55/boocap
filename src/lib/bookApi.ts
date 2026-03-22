import { Book } from '@/types/book';

// ── API Keys ──────────────────────────────────────────────
// 카카오 REST API 키 (https://developers.kakao.com)
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY || 'e8dc40eabf2634c9bfe393fb82b38b47';
// 알라딘 TTBKey (https://www.aladin.co.kr/ttb/wblog_manage.aspx)
const ALADIN_TTB_KEY = import.meta.env.VITE_ALADIN_TTB_KEY as string | undefined;

// ── Kakao Book Search (primary) ───────────────────────────
async function searchKakao(query: string): Promise<Book[]> {
  if (!KAKAO_REST_KEY) return [];
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=12`,
      {
        headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents || [])
      .filter((doc: any) => doc.thumbnail)
      .map((doc: any) => ({
        title: doc.title?.replace(/<[^>]*>/g, '') || '',
        author: (doc.authors?.[0] || '').replace(/<[^>]*>/g, ''),
        coverUrl: doc.thumbnail.replace(/\/R120x174\.q85\//, '/R256x0.q85/'),
        key: doc.isbn || doc.url || `kakao-${Date.now()}-${Math.random()}`,
      }));
  } catch {
    return [];
  }
}

// ── Aladin Search (fallback) ──────────────────────────────
// Note: 알라딘 API는 브라우저 CORS 제한이 있을 수 있습니다.
// CORS 문제 발생 시 Edge Function 프록시가 필요합니다.
async function searchAladin(query: string): Promise<Book[]> {
  if (!ALADIN_TTB_KEY) return [];
  try {
    const params = new URLSearchParams({
      ttbkey: ALADIN_TTB_KEY,
      Query: query,
      QueryType: 'Keyword',
      MaxResults: '12',
      start: '1',
      SearchTarget: 'Book',
      output: 'js',
      Version: '20131101',
      Cover: 'Big', // 고화질 표지
    });
    const res = await fetch(`https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.item || [])
      .filter((item: any) => item.cover)
      .map((item: any) => ({
        title: item.title || '',
        author: item.author?.split('(')[0]?.trim() || '',
        coverUrl: item.cover,
        key: item.isbn13 || item.isbn || `aladin-${Date.now()}-${Math.random()}`,
      }));
  } catch {
    return [];
  }
}

// ── Google Books (last resort, no key needed) ─────────────
function hasCJK(text: string): boolean {
  return /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(text);
}

function getGoogleCoverUrl(item: any): string | null {
  const links = item.volumeInfo?.imageLinks;
  if (!links) return null;
  const url = links.medium || links.small || links.thumbnail || links.smallThumbnail;
  if (!url) return null;
  return url
    .replace('http://', 'https://')
    .replace('&edge=curl', '')
    .replace(/&zoom=\d/, '&zoom=1');
}

async function searchGoogleBooks(query: string): Promise<Book[]> {
  try {
    const langRestrict = hasCJK(query) ? '&langRestrict=ko,zh,ja' : '';
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12${langRestrict}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || [])
      .map((item: any) => {
        const coverUrl = getGoogleCoverUrl(item);
        if (!coverUrl) return null;
        return {
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.[0] || '',
          coverUrl,
          key: item.id,
        };
      })
      .filter(Boolean) as Book[];
  } catch {
    return [];
  }
}

// ── Unified Search ────────────────────────────────────────
// 우선순위: 카카오 → 알라딘 → Google Books
export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  // 1) 카카오 검색 (primary)
  const kakao = await searchKakao(query);
  if (kakao.length > 0) return kakao;

  // 2) 알라딘 검색 (fallback)
  const aladin = await searchAladin(query);
  if (aladin.length > 0) return aladin;

  // 3) Google Books (last resort)
  return searchGoogleBooks(query);
}
