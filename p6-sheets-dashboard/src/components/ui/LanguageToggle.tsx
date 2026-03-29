'use client'

import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/i18n'

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs font-medium px-2 h-8"
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      {locale === 'ko' ? 'EN' : '한'}
    </Button>
  )
}
