/** 메인 랜딩 하단 — `public/landing-examples/` (`*-en.png` / `*-ko.png`). */
export type LandingExamplePosterDef = {
  id: string;
  imgEn: string;
  imgKo: string;
  altEn: string;
  altKo: string;
};

export const LANDING_EXAMPLE_POSTER_DEFS: readonly LandingExamplePosterDef[] = [
  {
    id: 'dec-2025',
    imgEn: '/landing-examples/december-2025-en.png',
    imgKo: '/landing-examples/december-2025-ko.png',
    altEn: 'Example: December 2025 reading list poster',
    altKo: '예시: 2025년 12월 독서 기록 포스터',
  },
  {
    id: 'mar-2026',
    imgEn: '/landing-examples/march-2026-en.png',
    imgKo: '/landing-examples/march-2026-ko.png',
    altEn: 'Example: March 2026 reading list poster',
    altKo: '예시: 2026년 3월 독서 기록 포스터',
  },
  {
    id: 'jan-2026',
    imgEn: '/landing-examples/january-2026-en.png',
    imgKo: '/landing-examples/january-2026-ko.png',
    altEn: 'Example: January 2026 reading list poster',
    altKo: '예시: 2026년 1월 독서 기록 포스터',
  },
] as const;
