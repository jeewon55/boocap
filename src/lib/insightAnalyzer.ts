import type { Book } from '@/types/book';
import type { Locale } from '@/contexts/LocaleContext';

const MONTHS_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export interface InsightCopy {
  headline: string;
  sub: string;
  patternLabel: string;
}

function normalizeAuthor(a: string) {
  return a.trim().toLowerCase();
}

function dominantAuthor(books: Book[]): { display: string; count: number } | null {
  if (books.length < 2) return null;
  const map = new Map<string, { display: string; count: number }>();
  for (const b of books) {
    const norm = normalizeAuthor(b.author);
    if (!norm) continue;
    const entry = map.get(norm);
    if (entry) entry.count++;
    else map.set(norm, { display: b.author, count: 1 });
  }
  let best: { display: string; count: number } | null = null;
  for (const v of map.values()) {
    if (!best || v.count > best.count) best = v;
  }
  return best && best.count >= 2 ? best : null;
}

function readDays(entries: Record<number, Book>): number[] {
  return Object.keys(entries).map(Number).sort((a, b) => a - b);
}

/** 5일 이내에 3권 이상 읽은 구간이 있으면 true */
function hasMarathon(days: number[]): boolean {
  if (days.length < 3) return false;
  for (let i = 0; i <= days.length - 3; i++) {
    if ((days[i + 2] ?? 0) - (days[i] ?? 0) <= 5) return true;
  }
  return false;
}

/** 읽은 책의 절반 이상이 월 첫 7일 + 최소 2권 */
function isEarlyBird(days: number[]): boolean {
  const early = days.filter(d => d <= 7).length;
  return early >= 2 && early >= Math.ceil(days.length / 2);
}

/** 읽은 책의 절반 이상이 월 마지막 7일 + 최소 2권 */
function isLastMinute(days: number[], daysInMonth: number): boolean {
  const threshold = daysInMonth - 6;
  const late = days.filter(d => d >= threshold).length;
  return late >= 2 && late >= Math.ceil(days.length / 2);
}

/** 월을 3구간으로 나눴을 때 각 구간에 최소 1권 */
function isSteady(days: number[], daysInMonth: number): boolean {
  const t = Math.floor(daysInMonth / 3);
  return (
    days.some(d => d <= t) &&
    days.some(d => d > t && d <= t * 2) &&
    days.some(d => d > t * 2)
  );
}

export function analyzeInsight(
  year: number,
  month: number,
  entries: Record<number, Book>,
  locale: Locale,
): InsightCopy {
  const allBooks = Object.values(entries).filter(Boolean) as Book[];
  const unique = Array.from(new Map(allBooks.map(b => [b.key, b])).values());
  const n = unique.length;
  const mKo = MONTHS_KO[month] ?? '';
  const mEn = MONTHS_EN[month] ?? '';
  const days = readDays(entries);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (n === 0) {
    return {
      patternLabel: 'empty',
      headline: locale === 'ko' ? '아직 책이 없어요.' : 'No books yet.',
      sub: locale === 'ko' ? '책을 추가하면 인사이트가 생성돼요.' : 'Add books to generate an insight.',
    };
  }

  // 1. 모든 책이 같은 저자 (2권 이상)
  const dom = dominantAuthor(unique);
  if (dom && dom.count === n && n >= 2) {
    return {
      patternLabel: 'author_monopoly',
      headline: locale === 'ko'
        ? `온전히 ${dom.display}의 달이었습니다.`
        : `A month that belonged entirely to ${dom.display}.`,
      sub: locale === 'ko'
        ? `${n}권을 내리 읽었어요.`
        : `${n} books, cover to cover.`,
    };
  }

  // 2. 특정 저자 우세 (2권 이상, 전부는 아님)
  if (dom) {
    return {
      patternLabel: 'author_dominant',
      headline: locale === 'ko'
        ? `이달은 유독 ${dom.display}에게 자주 손이 갔네요.`
        : `${dom.display} kept calling you back this month.`,
      sub: locale === 'ko'
        ? `${n}권 중 ${dom.count}권이 같은 작가였어요.`
        : `${dom.count} out of ${n} books from the same author.`,
    };
  }

  // 3. 다독 (9권 이상)
  if (n >= 9) {
    return {
      patternLabel: 'volume_high',
      headline: locale === 'ko'
        ? `${n}권. ${mKo}은 온통 활자로 가득했군요.`
        : `${n} books. Your ${mEn} was made of pages.`,
      sub: locale === 'ko'
        ? '이렇게 많이 읽다니, 대단해요.'
        : 'An impressive reading month, by any measure.',
    };
  }

  // 4. 마라톤 (5일 이내 3권 이상)
  if (hasMarathon(days)) {
    return {
      patternLabel: 'marathon',
      headline: locale === 'ko'
        ? '단숨에 읽어낸 한 달.'
        : "On a roll — couldn't stop turning pages.",
      sub: locale === 'ko'
        ? `${n}권을 짧은 텀으로 읽었어요.`
        : `${n} books, read back to back.`,
    };
  }

  // 5. 얼리버드 (월초 집중)
  if (isEarlyBird(days)) {
    return {
      patternLabel: 'early_bird',
      headline: locale === 'ko'
        ? `${mKo}의 첫날부터 책을 펼쳤군요.`
        : `You started ${mEn} with a book in hand.`,
      sub: locale === 'ko'
        ? `${n}권 대부분이 월초에 집중됐어요.`
        : `${n} books, most of them in the opening days.`,
    };
  }

  // 6. 막판 스퍼트 (월말 집중)
  if (isLastMinute(days, daysInMonth)) {
    return {
      patternLabel: 'last_minute',
      headline: locale === 'ko'
        ? '월말에 몰아 읽었지만, 다 채웠어요.'
        : 'A final-week sprint — and you made it count.',
      sub: locale === 'ko'
        ? `${n}권이 모두 마지막 주에 집중됐어요.`
        : `All ${n} books packed into the closing days.`,
    };
  }

  // 7. 꾸준한 독자 (3구간 골고루, 3권 이상)
  if (isSteady(days, daysInMonth) && n >= 3) {
    return {
      patternLabel: 'steady',
      headline: locale === 'ko'
        ? '꾸준히, 그리고 고르게.'
        : 'Steady and even — the best kind of month.',
      sub: locale === 'ko'
        ? `${mKo} 내내 빠짐없이 책을 읽었어요.`
        : `Books spread consistently throughout ${mEn}.`,
    };
  }

  // 8. 단 한 권
  if (n === 1) {
    return {
      patternLabel: 'single_book',
      headline: locale === 'ko'
        ? '단 한 권. 그래도 다 읽었잖아요.'
        : 'Just one book. But you read it.',
      sub: locale === 'ko'
        ? `${mKo}의 한 권은 충분히 의미있어요.`
        : 'One book is still a book well read.',
    };
  }

  // 9. 기본
  return {
    patternLabel: 'default',
    headline: locale === 'ko'
      ? `${n}권으로 채운 ${mKo}.`
      : `${n} books to remember ${mEn} by.`,
    sub: locale === 'ko'
      ? '이달도 잘 읽었어요.'
      : 'Well read, well done.',
  };
}
