import { useLocale } from '@/contexts/LocaleContext';

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      className="font-display text-[11px] font-semibold tracking-normal rounded-[4px] border border-border px-2.5 py-1.5 text-foreground transition-colors hover:bg-muted/60"
      aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      {locale === 'ko' ? 'EN' : 'KO'}
    </button>
  );
}
