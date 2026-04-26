import type { Locale } from '@/contexts/LocaleContext';

/** 사용자가 지정한 항목만 ko에서 한글로 노출합니다. */
export const createFlowMessages: Record<
  Locale,
  {
    markYourDaysTitle: string;
    chooseTemplateCta: string;
    frameYourMonthTitle: string;
    tryThisTemplateCta: string;
    templateStepBack: string;
    archiveVisualizedTitle: string;
    downloadImageCta: string;
    downloadExporting: string;
    downloadFailedToast: string;
    startOverCta: string;
    startOverModalTitle: string;
    startOverModalBody: string;
    startOverModalCancel: string;
    startOverModalConfirm: string;
    maxBooksToast: string;
    deleteBook: string;
    replaceBook: string;
    noBookModalTitle: string;
    noBookModalBody: string;
    noBookModalOk: string;
    monthChangeModalTitle: string;
    monthChangeModalBody: string;
    monthChangeModalCancel: string;
    monthChangeModalConfirm: string;
    cancelLabel: string;
    feedbackQuestion: string;
    feedbackThanks: string;
    feedbackPlaceholder: string;
  }
> = {
  en: {
    markYourDaysTitle: 'Mark Your Days.',
    chooseTemplateCta: 'Choose Template',
    frameYourMonthTitle: 'Frame Your Month.',
    tryThisTemplateCta: 'Try This Template',
    templateStepBack: 'Back',
    archiveVisualizedTitle: 'Your recap is ready.',
    downloadImageCta: 'Download Poster',
    downloadExporting: 'Exporting…',
    downloadFailedToast: 'Failed to save the poster.',
    startOverCta: 'Start over',
    startOverModalTitle: 'Start over?',
    startOverModalBody: 'All books and settings for this recap will be cleared.',
    startOverModalCancel: 'Cancel',
    startOverModalConfirm: 'Start over',
    maxBooksToast: 'You can add up to 12 books.',
    deleteBook: 'Delete',
    replaceBook: 'Replace',
    noBookModalTitle: 'No books added yet',
    noBookModalBody:
      'Add at least one book to the calendar before moving to the template step.',
    noBookModalOk: 'OK',
    monthChangeModalTitle: 'Switch month?',
    monthChangeModalBody:
      'Books you added for this month will be cleared. If you continue, you can pick which month to open next.',
    monthChangeModalCancel: 'Cancel',
    monthChangeModalConfirm: 'Continue',
    cancelLabel: 'Cancel',
    feedbackQuestion: 'How was your poster?',
    feedbackThanks: 'Thank you!',
    feedbackPlaceholder: 'Anything to share? (optional)',
  },
  ko: {
    markYourDaysTitle: '읽은 책을 등록해 주세요.',
    chooseTemplateCta: '템플릿 선택하기',
    frameYourMonthTitle: '템플릿을 선택해 주세요.',
    tryThisTemplateCta: '템플릿 선택하기',
    templateStepBack: '이전 단계로',
    archiveVisualizedTitle: '포스터가 완성됐어요.',
    downloadImageCta: '포스터 다운로드',
    downloadExporting: '이미지 저장 중…',
    downloadFailedToast: '포스터 저장에 실패했어요.',
    startOverCta: '처음부터 다시',
    startOverModalTitle: '처음부터 다시 할까요?',
    startOverModalBody: '지금까지 입력한 독서 데이터가 모두 사라져요.',
    startOverModalCancel: '취소',
    startOverModalConfirm: '처음부터 다시',
    maxBooksToast: '최대 12권까지 추가할 수 있어요.',
    deleteBook: '삭제',
    replaceBook: '책 변경',
    noBookModalTitle: '먼저 책을 추가해 주세요',
    noBookModalBody: '템플릿 단계로 넘어가기 전에 달력에 책을 한 권 이상 추가해 주세요.',
    noBookModalOk: '확인',
    monthChangeModalTitle: '다른 달로 이동할까요?',
    monthChangeModalBody:
      '이번 달에 등록한 책 정보가 모두 사라져요. 되돌릴 수 없어요. 계속하면 달을 고르는 화면이 열려요.',
    monthChangeModalCancel: '취소',
    monthChangeModalConfirm: '계속',
    cancelLabel: '취소',
    feedbackQuestion: '포스터 어떠셨나요?',
    feedbackThanks: '감사해요!',
    feedbackPlaceholder: '좋았던 점이나 아쉬운 점을 적어주세요. (선택)',
  },
};
