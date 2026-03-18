import { Book } from '@/types/book';

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];
  
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
