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
    startOverCta: string;
    startOverModalTitle: string;
    startOverModalBody: string;
    startOverModalCancel: string;
    startOverModalConfirm: string;
    noBookModalTitle: string;
    noBookModalBody: string;
    noBookModalOk: string;
  }
> = {
  en: {
    markYourDaysTitle: 'Mark Your Days.',
    chooseTemplateCta: 'Choose Template',
    frameYourMonthTitle: 'Frame Your Month.',
    tryThisTemplateCta: 'Try This Template',
    templateStepBack: 'Back',
    archiveVisualizedTitle: 'Archive Visualized.',
    downloadImageCta: 'Download Image',
    downloadExporting: 'Exporting…',
    startOverCta: 'Start over',
    startOverModalTitle: 'Start over?',
    startOverModalBody: 'All books and settings for this recap will be cleared.',
    startOverModalCancel: 'Cancel',
    startOverModalConfirm: 'Start over',
    noBookModalTitle: 'Please select a book first',
    noBookModalBody:
      'Add at least one book to the calendar before moving to the template step.',
    noBookModalOk: 'OK',
  },
  ko: {
    markYourDaysTitle: '읽은 책을 등록해 주세요.',
    chooseTemplateCta: '템플릿 선택하기',
    frameYourMonthTitle: '템플릿을 선택해 주세요.',
    tryThisTemplateCta: '템플릿 선택하기',
    templateStepBack: '이전 단계로',
    archiveVisualizedTitle: '독서 아카이브를 시각화했어요.',
    downloadImageCta: '이미지 다운로드',
    downloadExporting: '이미지 저장 중…',
    startOverCta: '처음부터 다시',
    startOverModalTitle: '처음부터 다시 할까요?',
    startOverModalBody: '지금까지 입력한 독서 데이터가 모두 사라져요.',
    startOverModalCancel: '취소',
    startOverModalConfirm: '처음부터 다시',
    noBookModalTitle: '먼저 책을 추가해 주세요',
    noBookModalBody: '템플릿 단계로 넘어가기 전에 달력에 책을 한 권 이상 추가해 주세요.',
    noBookModalOk: '확인',
  },
};
