'use client'

import { useEffect, useState } from 'react'
import { getInquiryStatus } from '@/app/inquiry/status/[ticketId]/actions'
import { Inquiry } from '@/types/inquiry'
import { STATUS_STEPS, STATUS_COLORS, URGENCY_COLORS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, RefreshCw } from 'lucide-react'
import { useLocale } from '@/lib/i18n'

interface Props {
  ticketId: string
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />
}

export function StatusTimeline({ ticketId }: Props) {
  const { t } = useLocale()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    const result = await getInquiryStatus(ticketId)
    if (result.success) {
      setInquiry(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-4">
          {STATUS_STEPS.map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.status.retry}
        </Button>
      </div>
    )
  }

  if (!inquiry) return null

  const currentStepIndex = STATUS_STEPS.indexOf(inquiry.status as typeof STATUS_STEPS[number])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.status.heading}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.status.ticketId} {ticketId}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.status.refresh}
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="flex items-start justify-between">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = currentStepIndex > index
            const isCurrent = currentStepIndex === index
            const stepLabel = t.status.steps[step as keyof typeof t.status.steps] ?? step

            return (
              <div key={step} className="flex flex-1 flex-col items-center gap-2">
                {/* Connector line */}
                <div className="relative flex w-full items-center justify-center">
                  {index > 0 && (
                    <div
                      className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${
                        isCompleted || isCurrent ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'border-primary bg-background text-primary'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Circle className="h-4 w-4 fill-primary" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stepLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {t.status.detailTitle}
            <Badge className={STATUS_COLORS[inquiry.status]}>
              {t.statusLabels[inquiry.status as keyof typeof t.statusLabels] ?? inquiry.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">{t.status.fieldName}</span>
              <p className="font-medium mt-0.5">{inquiry.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t.status.fieldCategoryInput}</span>
              <p className="font-medium mt-0.5">{inquiry.categoryInput}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t.status.fieldAiCategory}</span>
              <p className="font-medium mt-0.5">{inquiry.aiCategory}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t.status.fieldUrgency}</span>
              <p className={`font-medium mt-0.5 ${URGENCY_COLORS[inquiry.aiUrgency]}`}>
                {t.urgencyLabels[inquiry.aiUrgency as keyof typeof t.urgencyLabels] ?? inquiry.aiUrgency}
              </p>
            </div>
          </div>
          {inquiry.aiSummary && (
            <div>
              <span className="text-muted-foreground">{t.status.fieldAiSummary}</span>
              <p className="mt-0.5 rounded bg-muted p-2">{inquiry.aiSummary}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">{t.status.fieldMessage}</span>
            <p className="mt-0.5 whitespace-pre-wrap">{inquiry.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-2 border-t">
            <span>{t.status.receivedAt} {inquiry.createdAt}</span>
            {inquiry.completedAt && <span>{t.status.completedAt} {inquiry.completedAt}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
