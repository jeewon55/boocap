import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, PenLine, Upload, BookOpen } from 'lucide-react';
import { searchBooks } from '@/lib/bookApi';
import { Book } from '@/types/book';
import { motion } from 'framer-motion';

function BookCoverThumb({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="w-10 h-[60px] flex-shrink-0 rounded overflow-hidden bg-secondary relative">
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
      {status === 'error' ? (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
          <BookOpen className="w-4 h-4" style={{ color: '#DFFF00' }} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface BookSearchModalProps {
  day: number;
  month: number;
  onSelect: (book: Book) => void;
  onClose: () => void;
}

export function BookSearchModal({ day, month, onSelect, onClose }: BookSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'manual'>('search');

  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualCoverUrl, setManualCoverUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setManualCoverUrl(reader.result as string);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const books = await searchBooks(q);
      setResults(books);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (mode !== 'search') return;
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search, mode]);

  const handleManualConfirm = () => {
    if (!manualTitle.trim()) return;
    onSelect({
      title: manualTitle.trim(),
      author: manualAuthor.trim() || '',
      coverUrl: manualCoverUrl.trim() || '/placeholder.svg',
      key: `manual-${day}-${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border w-full sm:max-w-md sm:mx-4 max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">
            {MONTHS[month]} {day}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-secondary transition-colors rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 py-2.5 text-xs font-body tracking-[0.1em] uppercase transition-colors ${
              mode === 'search' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            검색
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2.5 text-xs font-body tracking-[0.1em] uppercase transition-colors ${
              mode === 'manual' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            직접 입력
          </button>
        </div>

        {mode === 'search' ? (
          <>
            <div className="flex items-center gap-2 p-4 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="책 제목을 검색하세요..."
                className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
            </div>

            <div className="overflow-y-auto flex-1">
              {results.map((book) => (
                <button
                  key={book.key}
                  onClick={() => onSelect(book)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left border-b border-border last:border-0"
                >
                  <BookCoverThumb src={book.coverUrl} alt={book.title} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{book.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                  </div>
                </button>
              ))}

              {query && !loading && results.length === 0 && (
                <div className="p-4 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
                  <button
                    onClick={() => { setMode('manual'); setManualTitle(query); }}
                    className="inline-flex items-center gap-1.5 text-xs font-body text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    <PenLine className="w-3 h-3" />
                    직접 입력하기
                  </button>
                </div>
              )}

              {(!query || results.length > 0) && (
                <button
                  onClick={() => setMode('manual')}
                  className="w-full flex items-center gap-2 p-3 text-muted-foreground hover:bg-secondary transition-colors text-left"
                >
                  <PenLine className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-body">찾는 책이 없나요? 직접 입력하기</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            <div className="flex flex-col items-center gap-3">
              {manualCoverUrl && !previewError ? (
                <div className="relative group">
                  <img
                    src={manualCoverUrl}
                    alt="Book cover"
                    className="w-24 h-36 object-cover shadow-lg rounded"
                    onError={() => setPreviewError(true)}
                  />
                  <button
                    type="button"
                    onClick={() => { setManualCoverUrl(''); setPreviewError(false); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-36 bg-secondary flex flex-col items-center justify-center border border-dashed border-border hover:border-primary transition-colors cursor-pointer gap-1.5 rounded"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground font-body">업로드</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              {!manualCoverUrl && (
                <p className="text-[10px] text-muted-foreground font-body">이미지를 업로드하거나 아래에 URL을 입력하세요</p>
              )}
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">책 제목 *</label>
              <input
                autoFocus={mode === 'manual'}
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="예: 데미안"
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-primary transition-colors placeholder:text-muted-foreground rounded"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">저자</label>
              <input
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                placeholder="예: 헤르만 헤세"
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-primary transition-colors placeholder:text-muted-foreground rounded"
              />
            </div>

            {!manualCoverUrl && (
              <div>
                <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">또는 이미지 URL</label>
                <input
                  value={manualCoverUrl}
                  onChange={(e) => { setManualCoverUrl(e.target.value); setPreviewError(false); }}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-primary transition-colors placeholder:text-muted-foreground rounded"
                />
              </div>
            )}

            <button
              onClick={handleManualConfirm}
              disabled={!manualTitle.trim()}
              className="w-full py-3 bg-primary text-primary-foreground text-xs font-body font-bold tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-30 rounded-lg"
            >
              확인
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
