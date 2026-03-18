import { Book } from '@/types/book';

// Check if query contains CJK characters
function hasCJK(text: string): boolean {
  return /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(text);
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
    .filter((item: any) => item.volumeInfo?.imageLinks?.thumbnail)
    .map((item: any) => ({
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0] || 'Unknown',
      coverUrl: item.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://'),
      key: item.id,
    }));
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  if (hasCJK(query)) {
    // CJK queries: Google Books first, fallback to Open Library
    const google = await searchGoogleBooks(query);
    if (google.length > 0) return google;
    return searchOpenLibrary(query);
  }

  // Latin queries: both in parallel, merge results
  const [openLib, google] = await Promise.all([
    searchOpenLibrary(query),
    searchGoogleBooks(query),
  ]);

  // Deduplicate by title (case-insensitive)
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
