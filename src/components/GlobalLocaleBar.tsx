import { LocaleToggle } from '@/components/LocaleToggle';

/** 모든 화면 우측 상단 고정 한/영 전환 */
export function GlobalLocaleBar() {
  return (
    <div className="fixed right-0 top-0 z-[300] p-2 pr-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-3 sm:pr-4">
      <LocaleToggle />
    </div>
  );
}
