import { DashboardStats } from '@/types/inquiry'
import { Card, CardContent } from '@/components/ui/card'
import { Inbox, CheckCircle2, Clock, Timer } from 'lucide-react'

interface Props {
  stats: DashboardStats
}

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: '오늘 접수',
      value: stats.todayCount,
      unit: '건',
      icon: Inbox,
      color: 'text-blue-500',
    },
    {
      label: '처리완료',
      value: stats.completedCount,
      unit: '건',
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: '미응답',
      value: stats.pendingCount,
      unit: '건',
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      label: '평균 처리시간',
      value: stats.avgProcessingHours,
      unit: '시간',
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
