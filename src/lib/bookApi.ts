import { Book } from '@/types/book';

// Check if query contains CJK characters
function hasCJK(text: string): boolean {
  return /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(text);
}

function getGoogleCoverUrl(item: any): string | null {
  const links = item.volumeInfo?.imageLinks;
  if (!links) return null;
  // Prefer higher quality, fallback chain
  const url = links.medium || links.small || links.thumbnail || links.smallThumbnail;
  if (!url) return null;
  // Force https, remove curl edge effect, increase zoom
  return url
    .replace('http://', 'https://')
    .replace('&edge=curl', '')
    .replace(/&zoom=\d/, '&zoom=1');
}

async function searchOpenLibrary(query: string): Promise<Book[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=title,author_name,cover_i,key`
  );
  const data = await res.json();
  return (data.docs || [])
    .filter((doc: any) => doc.cover_i)
    .map((doc: any) => ({
      title: doc.title,
      author: doc.author_name?.[0] || 'Unknown',
      coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
      key: doc.key,
    }));
}

async function searchGoogleBooks(query: string): Promise<Book[]> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`
  );
  const data = await res.json();
  return (data.items || [])
    .map((item: any) => {
      const coverUrl = getGoogleCoverUrl(item);
      if (!coverUrl) return null;
      return {
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown',
        coverUrl,
        key: item.id,
      };
    })
    .filter(Boolean) as Book[];
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  if (hasCJK(query)) {
    const google = await searchGoogleBooks(query);
    if (google.length > 0) return google;
    return searchOpenLibrary(query);
  }

  const [openLib, google] = await Promise.all([
    searchOpenLibrary(query),
    searchGoogleBooks(query),
  ]);

  const seen = new Set<string>();
  const merged: Book[] = [];
  for (const book of [...openLib, ...google]) {
    const key = book.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(book);
    }
  }
  return merged.slice(0, 10);
}
