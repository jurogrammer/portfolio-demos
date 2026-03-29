'use client'

import { DashboardStats } from '@/types/inquiry'
import { Card, CardContent } from '@/components/ui/card'
import { Inbox, CheckCircle2, Clock, Timer } from 'lucide-react'
import { useLocale } from '@/lib/i18n'

interface Props {
  stats: DashboardStats
}

export function StatsCards({ stats }: Props) {
  const { t } = useLocale()

  const cards = [
    {
      label: t.dashboard.todayCount,
      value: stats.todayCount,
      unit: t.dashboard.unit,
      icon: Inbox,
      color: 'text-blue-500',
    },
    {
      label: t.dashboard.completedCount,
      value: stats.completedCount,
      unit: t.dashboard.unit,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: t.dashboard.pendingCount,
      value: stats.pendingCount,
      unit: t.dashboard.unit,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      label: t.dashboard.avgProcessingHours,
      value: stats.avgProcessingHours,
      unit: t.dashboard.hourUnit,
      icon: Timer,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, unit, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-bold">
                  {value}
                  <span className="text-base font-normal text-muted-foreground ml-1">{unit}</span>
                </p>
              </div>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
