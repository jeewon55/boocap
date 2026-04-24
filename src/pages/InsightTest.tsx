import { analyzeInsight } from '@/lib/insightAnalyzer';
import type { Book } from '@/types/book';

const PH = '/placeholder.svg';

type Scenario = {
  label: string;
  desc: string;
  year: number;
  month: number;
  entries: Record<number, Book>;
};

const SCENARIOS: Scenario[] = [
  {
    label: '무라카미 독점 (4권)',
    desc: '모든 책이 같은 저자 → author_monopoly',
    year: 2026, month: 3,
    entries: {
      3:  { title: '노르웨이의 숲',           author: '무라카미 하루키', coverUrl: PH, key: 'mh1' },
      10: { title: '1Q84',                    author: '무라카미 하루키', coverUrl: PH, key: 'mh2' },
      18: { title: '해변의 카프카',           author: '무라카미 하루키', coverUrl: PH, key: 'mh3' },
      25: { title: '색채가 없는 다자키 쓰쿠루', author: '무라카미 하루키', coverUrl: PH, key: 'mh4' },
    },
  },
  {
    label: '무라카미 우세 (6권 중 3권)',
    desc: '같은 저자 2권 이상이지만 전부는 아님 → author_dominant',
    year: 2026, month: 3,
    entries: {
      2:  { title: '노르웨이의 숲',     author: '무라카미 하루키', coverUrl: PH, key: 'mh1' },
      9:  { title: '킬링 코만단테',     author: '데이브 에거스',    coverUrl: PH, key: 'de1' },
      14: { title: '1Q84',             author: '무라카미 하루키', coverUrl: PH, key: 'mh2' },
      20: { title: '채식주의자',        author: '한강',            coverUrl: PH, key: 'hk1' },
      23: { title: '해변의 카프카',     author: '무라카미 하루키', coverUrl: PH, key: 'mh3' },
      28: { title: '작별하지 않는다',   author: '한강',            coverUrl: PH, key: 'hk2' },
    },
  },
  {
    label: '다독 (10권, 다양한 작가)',
    desc: '9권 이상 → volume_high',
    year: 2026, month: 0,
    entries: {
      1:  { title: '채식주의자',      author: '한강',         coverUrl: PH, key: 'b1' },
      3:  { title: '82년생 김지영',   author: '조남주',       coverUrl: PH, key: 'b2' },
      6:  { title: '아몬드',          author: '손원평',       coverUrl: PH, key: 'b3' },
      9:  { title: '파친코',          author: '이민진',       coverUrl: PH, key: 'b4' },
      12: { title: '불편한 편의점',   author: '김호연',       coverUrl: PH, key: 'b5' },
      15: { title: '달러구트 꿈 백화점', author: '이미예',    coverUrl: PH, key: 'b6' },
      18: { title: '소년이 온다',     author: '한강',         coverUrl: PH, key: 'b7' },
      21: { title: '나는 나로 살기로 했다', author: '김수현', coverUrl: PH, key: 'b8' },
      24: { title: '우리가 빛의 속도로', author: '김초엽',   coverUrl: PH, key: 'b9' },
      27: { title: '저는 무너지지 않겠습니다', author: '이병률', coverUrl: PH, key: 'b10' },
    },
  },
  {
    label: '마라톤 독서 (5일 안에 3권)',
    desc: '짧은 기간에 집중 → marathon',
    year: 2026, month: 1,
    entries: {
      5:  { title: '채식주의자',    author: '한강',   coverUrl: PH, key: 'c1' },
      7:  { title: '소년이 온다',   author: '한강',   coverUrl: PH, key: 'c2' },
      9:  { title: '작별하지 않는다', author: '한강', coverUrl: PH, key: 'c3' },
      20: { title: '흰',            author: '한강',   coverUrl: PH, key: 'c4' },
    },
  },
  {
    label: '얼리버드 (월초 집중)',
    desc: '1~7일에 절반 이상 → early_bird',
    year: 2026, month: 2,
    entries: {
      1: { title: '아몬드',         author: '손원평', coverUrl: PH, key: 'd1' },
      3: { title: '82년생 김지영',  author: '조남주', coverUrl: PH, key: 'd2' },
      6: { title: '불편한 편의점',  author: '김호연', coverUrl: PH, key: 'd3' },
      22: { title: '파친코',        author: '이민진', coverUrl: PH, key: 'd4' },
    },
  },
  {
    label: '막판 스퍼트 (월말 집중)',
    desc: '마지막 7일에 절반 이상 → last_minute',
    year: 2026, month: 4,
    entries: {
      8:  { title: '채식주의자',    author: '한강',   coverUrl: PH, key: 'e1' },
      24: { title: '소년이 온다',   author: '한강',   coverUrl: PH, key: 'e2' },
      27: { title: '흰',            author: '한강',   coverUrl: PH, key: 'e3' },
      30: { title: '작별하지 않는다', author: '한강', coverUrl: PH, key: 'e4' },
    },
  },
  {
    label: '꾸준한 독자 (월 전체 배분)',
    desc: '3구간 모두에 책 존재 → steady',
    year: 2026, month: 5,
    entries: {
      3:  { title: '아몬드',        author: '손원평', coverUrl: PH, key: 'f1' },
      8:  { title: '파친코',        author: '이민진', coverUrl: PH, key: 'f2' },
      14: { title: '82년생 김지영', author: '조남주', coverUrl: PH, key: 'f3' },
      20: { title: '불편한 편의점', author: '김호연', coverUrl: PH, key: 'f4' },
      25: { title: '우리가 빛의 속도로', author: '김초엽', coverUrl: PH, key: 'f5' },
      29: { title: '채식주의자',    author: '한강',   coverUrl: PH, key: 'f6' },
    },
  },
  {
    label: '한 권만',
    desc: '딱 한 권 → single_book',
    year: 2026, month: 6,
    entries: {
      15: { title: '파친코', author: '이민진', coverUrl: PH, key: 'g1' },
    },
  },
  {
    label: '기본 (3권, 특별한 패턴 없음)',
    desc: '해당 없음 → default',
    year: 2026, month: 7,
    entries: {
      10: { title: '아몬드',        author: '손원평', coverUrl: PH, key: 'h1' },
      20: { title: '82년생 김지영', author: '조남주', coverUrl: PH, key: 'h2' },
      28: { title: '불편한 편의점', author: '김호연', coverUrl: PH, key: 'h3' },
    },
  },
];

const MONTHS_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function InsightTest() {
  return (
    <div className="min-h-screen bg-[#fafafa] p-6 font-body">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Insight Copy Test</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            패턴별 문구 출력 확인 — 총 {SCENARIOS.length}개 시나리오
          </p>
        </div>

        <div className="space-y-4">
          {SCENARIOS.map((s, i) => {
            const ko = analyzeInsight(s.year, s.month, s.entries, 'ko');
            const en = analyzeInsight(s.year, s.month, s.entries, 'en');
            const bookList = Object.entries(s.entries)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, book]) => `${day}일: ${book.title} (${book.author})`);

            return (
              <div key={i} className="rounded-lg border border-border bg-white p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-600">
                      {ko.patternLabel}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {MONTHS_EN[s.month]} {s.year}
                    </span>
                  </div>
                </div>

                {/* Book list */}
                <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1">
                  {bookList.map((b, j) => (
                    <span key={j} className="text-[11px] text-muted-foreground">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Copy output */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-stone-50 p-4">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      🇰🇷 한국어
                    </p>
                    <p className="text-[18px] font-bold leading-snug tracking-tight text-foreground">
                      {ko.headline}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{ko.sub}</p>
                  </div>
                  <div className="rounded-md bg-stone-50 p-4">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      🇺🇸 English
                    </p>
                    <p className="text-[18px] font-bold leading-snug tracking-tight text-foreground">
                      {en.headline}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{en.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
