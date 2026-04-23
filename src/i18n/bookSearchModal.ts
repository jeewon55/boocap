import type { Locale } from '@/contexts/LocaleContext';

/** 책 검색 모달 */
export const bookSearchModalMessages: Record<
  Locale,
  {
    tabSearch: string;
    tabManual: string;
    close: string;
    searchPlaceholder: string;
    cantFindEnterManually: string;
    manualUpload: string;
    manualUploadHint: string;
    manualLabelTitle: string;
    manualPlaceholderTitle: string;
    manualLabelAuthor: string;
    manualPlaceholderAuthor: string;
    manualLabelCoverUrl: string;
    manualPlaceholderCoverUrl: string;
    manualSave: string;
    manualCoverImageAlt: string;
  }
> = {
  en: {
    tabSearch: 'Search',
    tabManual: 'Manual entry',
    close: 'Close',
    searchPlaceholder: 'Search by title or author…',
    cantFindEnterManually: "Can't find your book? Enter manually",
    manualUpload: 'Upload',
    manualUploadHint: 'Upload a cover image or paste a URL below.',
    manualLabelTitle: 'Title *',
    manualPlaceholderTitle: 'e.g. Demian',
    manualLabelAuthor: 'Author',
    manualPlaceholderAuthor: 'e.g. Hermann Hesse',
    manualLabelCoverUrl: 'Or cover image URL',
    manualPlaceholderCoverUrl: 'https://example.com/cover.jpg',
    manualSave: 'Save',
    manualCoverImageAlt: 'Book cover',
  },
  ko: {
    tabSearch: '검색',
    tabManual: '직접 입력',
    close: '닫기',
    searchPlaceholder: '제목 또는 저자로 검색…',
    cantFindEnterManually: '책을 찾을 수 없나요? 직접 입력하기',
    manualUpload: '업로드',
    manualUploadHint: '표지 이미지를 업로드하거나 아래에 URL을 붙여넣으세요.',
    manualLabelTitle: '제목 *',
    manualPlaceholderTitle: '예: 데미안',
    manualLabelAuthor: '저자',
    manualPlaceholderAuthor: '예: 헤르만 헤세',
    manualLabelCoverUrl: '표지 이미지 URL',
    manualPlaceholderCoverUrl: 'https://example.com/cover.jpg',
    manualSave: '저장',
    manualCoverImageAlt: '책 표지',
  },
};
