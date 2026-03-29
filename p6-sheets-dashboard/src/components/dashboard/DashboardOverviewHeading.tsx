'use client'

import { useLocale } from '@/lib/i18n'

export default function DashboardOverviewHeading() {
  const { t } = useLocale()
  return (
    <div>
      <h1 className="text-xl font-semibold">{t.dashboard.title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{t.dashboard.subtitle}</p>
    </div>
  )
}
