'use client'

import { useLocale } from '@/lib/i18n'

export default function SettingsHeading() {
  const { t } = useLocale()
  return (
    <div>
      <h1 className="text-xl font-semibold">{t.settings.title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{t.settings.subtitle}</p>
    </div>
  )
}
