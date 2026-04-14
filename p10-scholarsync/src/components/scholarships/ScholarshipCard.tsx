import Link from 'next/link'
import { differenceInDays, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Building2 } from 'lucide-react'
import { ORG_TYPE_LABELS, DEGREE_TYPES } from '@/lib/constants'
import type { Scholarship } from '@/types/database'

function formatAmount(scholarship: Scholarship): string {
  switch (scholarship.amount_type) {
    case 'full_tuition':
      return '등록금 전액'
    case 'half_tuition':
      return '등록금 반액'
    case 'fixed':
      return scholarship.amount_value != null
        ? `${scholarship.amount_value.toLocaleString()}원`
        : '정액 지급'
    case 'variable':
      return '차등 지급'
    default:
      return '-'
  }
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = differenceInDays(parseISO(deadline), new Date())
  const label = days < 0 ? '마감' : days === 0 ? 'D-Day' : `D-${days}`
  const isUrgent = days >= 0 && days < 7
  return (
    <span className={`text-xs font-semibold ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`}>
      {label}
    </span>
  )
}

export default function ScholarshipCard({
  scholarship,
  matchReasons,
}: {
  scholarship: Scholarship
  matchReasons?: string[]
}) {
  const degreeLabels = scholarship.target_degree.map((d) => {
    if (d === 'all') return '전체'
    return DEGREE_TYPES.find((t) => t.value === d)?.label ?? d
  })

  const daysLeft = differenceInDays(parseISO(scholarship.deadline), new Date())
  const isUrgent = daysLeft >= 0 && daysLeft < 7

  return (
    <Link href={`/scholarships/${scholarship.id}`} className="block group">
      <Card className={`h-full transition-all duration-200 group-hover:shadow-md hover:-translate-y-0.5 ${isUrgent ? 'border-l-4 border-destructive' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{scholarship.organization}</span>
              </p>
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {scholarship.name}
              </h3>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {ORG_TYPE_LABELS[scholarship.org_type] ?? scholarship.org_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="text-base font-bold text-primary">{formatAmount(scholarship)}</div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{scholarship.deadline.slice(0, 10)}</span>
            <span className="mx-1">·</span>
            <DeadlineBadge deadline={scholarship.deadline} />
          </div>

          <div className="flex flex-wrap gap-1">
            {degreeLabels.map((label) => (
              <Badge key={label} variant="outline" className="text-xs px-1.5 py-0">
                {label}
              </Badge>
            ))}
          </div>

          {matchReasons && matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
              {matchReasons.map(reason => (
                <span key={reason} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{reason}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
