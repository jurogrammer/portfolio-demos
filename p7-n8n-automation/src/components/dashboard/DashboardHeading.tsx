'use client'

import { useLocale } from '@/lib/i18n'

export function DashboardHeading() {
  const { t } = useLocale()
  return <h1 className="text-3xl font-bold">{t.dashboard.heading}</h1>
}

export function RecentListHeading() {
  const { t } = useLocale()
  return <h2 className="text-xl font-semibold mb-4">{t.dashboard.recentList}</h2>
}
