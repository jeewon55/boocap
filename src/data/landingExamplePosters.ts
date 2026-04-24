/** 메인 랜딩 하단 — `public/landing-examples/` (`*-en.png` / `*-ko.png`). */
export type LandingExamplePosterDef = {
  id: string;
  imgEn: string;
  imgKo: string;
  altEn: string;
  altKo: string;
};

/** 랜딩 가로 캐러셀 한 칸 (예시 포스터 또는 양끝 템플릿). */
export type LandingCarouselItem = {
  id: string;
  src: string;
  alt: string;
};

/**
 * 랜딩 가로 캐러셀: 예시 3장 + 양끝 템플릿 (왼쪽 8월 · 오른쪽 5월).
 * `public/landing-examples/flank-ko-*.png` / `flank-en-*.png`
 */
export function getLandingCarouselItems(locale: 'ko' | 'en'): LandingCarouselItem[] {
  const examples: LandingCarouselItem[] = LANDING_EXAMPLE_POSTER_DEFS.map((def) => ({
    id: def.id,
    src: locale === 'ko' ? def.imgKo : def.imgEn,
    alt: locale === 'ko' ? def.altKo : def.altEn,
  }));

  if (locale === 'ko') {
    return [
      {
        id: 'flank-ko-august-2025',
        src: '/landing-examples/flank-ko-august-2025.png',
        alt: '예시 템플릿: 2025년 8월 독서 기록',
      },
      ...examples,
      {
        id: 'flank-ko-may-2026',
        src: '/landing-examples/flank-ko-may-2026.png',
        alt: '예시 템플릿: 2026년 5월 독서 기록',
      },
    ];
  }

  return [
    {
      id: 'flank-en-august-2025',
      src: '/landing-examples/flank-en-august-2025.png',
      alt: 'Example template: August 2025 reading recap',
    },
    ...examples,
    {
      id: 'flank-en-may-2026',
      src: '/landing-examples/flank-en-may-2026.png',
      alt: 'Example template: May 2026 reading recap',
    },
  ];
}

export const LANDING_EXAMPLE_POSTER_DEFS: readonly LandingExamplePosterDef[] = [
  {
    id: 'jan-2026',
    imgEn: '/landing-examples/january-2026-en.png',
    imgKo: '/landing-examples/january-2026-ko.png',
    altEn: 'Example: January 2026 reading list poster',
    altKo: '예시: 2026년 1월 독서 기록 포스터',
  },
  {
    id: 'mar-2026',
    imgEn: '/landing-examples/march-2026-en.png',
    imgKo: '/landing-examples/march-2026-ko.png',
    altEn: 'Example: March 2026 reading list poster',
    altKo: '예시: 2026년 3월 독서 기록 포스터',
  },
  {
    id: 'dec-2025',
    imgEn: '/landing-examples/december-2025-en.png',
    imgKo: '/landing-examples/december-2025-ko.png',
    altEn: 'Example: December 2025 reading list poster',
    altKo: '예시: 2025년 12월 독서 기록 포스터',
  },
] as const;
