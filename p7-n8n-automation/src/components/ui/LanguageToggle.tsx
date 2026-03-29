'use client'

import { useLocale } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      className="text-xs font-semibold px-2 h-8 min-w-[2rem]"
      aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      {locale === 'ko' ? 'EN' : '한'}
    </Button>
  )
}
