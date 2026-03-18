import { useState } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { Book } from '@/types/book';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface BookEntryModalProps {
  day: number;
  month: number;
  onConfirm: (book: Book) => void;
  onClose: () => void;
}

export function BookEntryModal({ day, month, onConfirm, onClose }: BookEntryModalProps) {
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  const handleConfirm = () => {
    if (!title.trim() || !coverUrl.trim()) return;
    onConfirm({
      title: title.trim(),
      author: '',
      coverUrl: coverUrl.trim(),
      key: `manual-${day}-${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background border border-border w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-lg animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">
            {MONTHS[month]} {day}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-secondary transition-colors rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Cover preview */}
          <div className="flex justify-center">
            {coverUrl && !previewError ? (
              <img
                src={coverUrl}
                alt="Book cover"
                className="w-24 h-36 object-cover shadow-lg"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="w-24 h-36 bg-secondary flex items-center justify-center border border-border">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">
              책 제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 데미안"
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
            />
          </div>

          {/* Cover URL */}
          <div>
            <label className="text-[10px] tracking-[0.2em] text-muted-foreground font-body uppercase block mb-2">
              표지 이미지 URL
            </label>
            <input
              value={coverUrl}
              onChange={(e) => { setCoverUrl(e.target.value); setPreviewError(false); }}
              placeholder="https://example.com/cover.jpg"
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-body outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={handleConfirm}
            disabled={!title.trim() || !coverUrl.trim()}
            className="w-full py-3 bg-foreground text-background text-xs font-body tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
