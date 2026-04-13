import { Book } from '@/types/book';

function coercePositiveInt(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.round(v);
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

/** Pull ISBN-like tokens from Kakao/Aladin `key` or raw isbn string for Google lookup */
function extractIsbnCandidates(keyOrIsbn: string): string[] {
  const s = keyOrIsbn.trim();
  if (!s) return [];
  const out: string[] = [];
  for (const part of s.split(/\s+/)) {
    const d = part.replace(/[^0-9Xx]/g, '');
    if (d.length === 13 || d.length === 10) out.push(d.replace(/x$/i, 'X'));
  }
  const all = s.replace(/[^0-9Xx]/g, '');
  if (all.length >= 13) out.push(all.slice(-13));
  else if (all.length === 10) out.push(all.replace(/x$/i, 'X'));
  return [...new Set(out)];
}

/** Google Books: first matching volume’s page count for an ISBN-10/13 */
export async function fetchPageCountFromGoogleBooksByIsbn(keyOrIsbn: string): Promise<number | undefined> {
  for (const isbn of extractIsbnCandidates(keyOrIsbn)) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&maxResults=3`,
      );
      if (!res.ok) continue;
      const data = await res.json();
      const items = data.items as { volumeInfo?: { pageCount?: number } }[] | undefined;
      if (!items?.length) continue;
      const pc = coercePositiveInt(items[0].volumeInfo?.pageCount);
      if (pc != null) return pc;
    } catch {
      /* try next candidate */
    }
  }
  return undefined;
}

/** Fill `pageCount` when missing (e.g. Kakao search has no 쪽수 — resolve via Google by ISBN). */
export async function enrichBookWithPageCount(book: Book): Promise<Book> {
  if (coercePositiveInt(book.pageCount) != null) return book;
  const n = await fetchPageCountFromGoogleBooksByIsbn(book.key);
  if (n == null) return book;
  return { ...book, pageCount: n };
}

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
      .map((doc: any) => {
        const key = doc.isbn || doc.url || `kakao-${Date.now()}-${Math.random()}`;
        return {
          title: doc.title?.replace(/<[^>]*>/g, '') || '',
          author: (doc.authors?.[0] || '').replace(/<[^>]*>/g, ''),
          coverUrl: doc.thumbnail,
          key,
        } satisfies Book;
      });
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
      .map((item: any) => {
        const pageCount = coercePositiveInt(item.itemPage);
        return {
          title: item.title || '',
          author: item.author?.split('(')[0]?.trim() || '',
          coverUrl: item.cover,
          key: item.isbn13 || item.isbn || `aladin-${Date.now()}-${Math.random()}`,
          ...(pageCount != null ? { pageCount } : {}),
        } satisfies Book;
      });
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
        const pageCount = coercePositiveInt(item.volumeInfo?.pageCount);
        return {
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.[0] || '',
          coverUrl,
          key: item.id,
          ...(pageCount != null ? { pageCount } : {}),
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
