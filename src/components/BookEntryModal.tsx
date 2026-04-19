import { useState } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { Book } from '@/types/book';
import { BottomSheetKeyboardLift } from '@/components/BottomSheetKeyboardLift';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface BookEntryModalProps {
  day: number;
  month: number;
  onConfirm: (book: Book) => void;
  onClose: () => void;
}

export function BookEntryModal({ day, month, onConfirm, onClose }: BookEntryModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  const handleConfirm = () => {
    if (!title.trim() || !coverUrl.trim()) return;
    onConfirm({
      title: title.trim(),
      author: author.trim(),
      coverUrl: coverUrl.trim(),
      key: `manual-${day}-${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <BottomSheetKeyboardLift>
        <div
          className="flex w-full max-h-[85vh] animate-fade-in flex-col overflow-hidden rounded-t-[4px] border border-border bg-background font-body sm:rounded-[4px]"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between border-b border-border/50 p-5">
          <span className="font-display text-[20px] font-extrabold tracking-[0] text-[#121212]">
            {MONTH_NAMES[month]} {day}
          </span>
          <button onClick={onClose} className="rounded-[4px] p-1 transition-colors hover:bg-secondary">
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
            <label className="mb-2 block text-[10px] font-body tracking-normal text-muted-foreground">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Demian"
              className="w-full border border-border bg-transparent px-3 py-2.5 text-sm font-body outline-none transition-colors placeholder:text-placeholder-muted focus:border-foreground"
            />
          </div>

          {/* Author */}
          <div>
            <label className="mb-2 block text-[10px] font-body tracking-normal text-muted-foreground">
              Author
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Hermann Hesse"
              className="w-full border border-border bg-transparent px-3 py-2.5 text-sm font-body outline-none transition-colors placeholder:text-placeholder-muted focus:border-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-body tracking-normal text-muted-foreground">
              Cover image URL
            </label>
            <input
              value={coverUrl}
              onChange={(e) => { setCoverUrl(e.target.value); setPreviewError(false); }}
              placeholder="https://example.com/cover.jpg"
              className="w-full border border-border bg-transparent px-3 py-2.5 text-sm font-body outline-none transition-colors placeholder:text-placeholder-muted focus:border-foreground"
            />
          </div>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={handleConfirm}
            disabled={!title.trim() || !coverUrl.trim()}
            className="w-full rounded-[4px] bg-foreground py-3 text-xs font-body font-medium tracking-normal text-background transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Save
          </button>
        </div>
        </div>
      </BottomSheetKeyboardLift>
    </div>
  );
}
