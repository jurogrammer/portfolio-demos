'use client';
import { useLocale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      aria-label="Toggle language"
      className="text-xs font-semibold px-2 h-8 min-w-[2.5rem]"
    >
      {locale === 'ko' ? 'EN' : '한'}
    </Button>
  );
}
