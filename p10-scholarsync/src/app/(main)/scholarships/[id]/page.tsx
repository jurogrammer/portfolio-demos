import { notFound } from 'next/navigation'
import Link from 'next/link'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, CalendarDays, Building2, MapPin, GraduationCap, Banknote, FileText, AlertCircle, ClipboardList, Users, Phone } from 'lucide-react'
import { ORG_TYPE_LABELS, DEGREE_TYPES } from '@/lib/constants'
import type { Profile, Scholarship } from '@/types/database'
import { aiEvaluateEligibility, needsAiEvaluation } from '@/lib/ai/match'

function formatAmount(scholarship: Scholarship): string {
  switch (scholarship.amount_type) {
    case 'full_tuition': return '등록금 전액'
    case 'half_tuition': return '등록금 반액'
    case 'fixed': return scholarship.amount_value != null ? `${scholarship.amount_value.toLocaleString()}원` : '정액 지급'
    case 'variable': return '차등 지급'
    default: return '-'
  }
}

function DeadlineInfo({ deadline }: { deadline: string }) {
  const days = differenceInDays(parseISO(deadline), new Date())
  const formatted = format(parseISO(deadline), 'yyyy년 M월 d일 (eee)', { locale: ko })
  const dLabel = days < 0 ? '마감' : days === 0 ? 'D-Day' : `D-${days}`
  const isUrgent = days >= 0 && days < 7
  return (
    <span className="flex items-center gap-2">
      <span>{formatted}</span>
      <span className={`text-sm font-semibold ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`}>
        {dLabel}
      </span>
    </span>
  )
}

export default async function ScholarshipDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const supabase = await createClient()

  const [{ data: scholarship }, { data: { user } }] = await Promise.all([
    supabase.from('ss_scholarships').select('*').eq('id', id).eq('is_active', true).single(),
    supabase.auth.getUser(),
  ])

  if (!scholarship) notFound()

  const s = scholarship as Scholarship

  // Check eligibility for logged-in users
  let eligibilityWarning: string | null = null
  if (user) {
    const { data: profileData } = await supabase
      .from('ss_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    const profile = profileData as Profile | null
    if (profile?.department) {
      // Rule-based: target_majors check (deterministic)
      if (s.target_majors && s.target_majors.length > 0) {
        const dept = profile.department
        const majorMatch = s.target_majors.some(
          (m) => dept.includes(m) || m.includes(dept)
        )
        if (!majorMatch) {
          eligibilityWarning = `내 전공(${dept})이 대상 전공(${s.target_majors.join(', ')})에 포함되지 않습니다`
        }
      }
      // AI-based: free-text requirements (only if rule-based passed)
      if (!eligibilityWarning && needsAiEvaluation(s)) {
        const aiResults = await aiEvaluateEligibility(profile, [s])
        const result = aiResults.get(s.id)
        if (result && !result.eligible) {
          eligibilityWarning = result.reason
        }
      }
    }
  }

  const degreeLabels = s.target_degree.map((d) => {
    if (d === 'all') return '전체'
    return DEGREE_TYPES.find((t) => t.value === d)?.label ?? d
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/scholarships" className="hover:text-primary transition-colors">
            장학금 검색
          </Link>
          <span>/</span>
          <span className="text-foreground">{s.name}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary">{ORG_TYPE_LABELS[s.org_type] ?? s.org_type}</Badge>
            </div>
            <h1 className="text-2xl font-bold leading-tight">{s.name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {s.organization}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button variant="outline" asChild className="gap-2">
              <a href={s.source_url} target="_blank" rel="noopener noreferrer">
                공식 사이트에서 지원하기
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {eligibilityWarning && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">내 프로필과 맞지 않는 장학금입니다</p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">{eligibilityWarning}</p>
          </div>
        </div>
      )}

      {/* Key info grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <InfoItem icon={<Banknote className="h-4 w-4" />} label="지원 금액">
          <span className="font-semibold text-primary">{formatAmount(s)}</span>
        </InfoItem>

        <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="신청 마감">
          <DeadlineInfo deadline={s.deadline} />
        </InfoItem>

        {s.application_start && (
          <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="접수 시작">
            {format(parseISO(s.application_start), 'yyyy년 M월 d일', { locale: ko })}
          </InfoItem>
        )}

        <InfoItem icon={<GraduationCap className="h-4 w-4" />} label="대상 학위">
          <div className="flex flex-wrap gap-1">
            {degreeLabels.map((l) => (
              <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
            ))}
          </div>
        </InfoItem>

        {s.target_regions && s.target_regions.length > 0 && (
          <InfoItem icon={<MapPin className="h-4 w-4" />} label="대상 지역">
            <div className="flex flex-wrap gap-1">
              {s.target_regions.map((r) => (
                <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
              ))}
            </div>
          </InfoItem>
        )}
      </div>

      {/* Requirements */}
      {(s.min_gpa != null || s.max_income_quintile != null || s.target_majors || s.extra_requirements) && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              지원 요건
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {s.min_gpa != null && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">최저 학점</span>
                <span>{s.min_gpa} / 4.5 이상</span>
              </div>
            )}
            {s.max_income_quintile != null && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">소득 분위</span>
                <span>{s.max_income_quintile}분위 이하</span>
              </div>
            )}
            {s.target_majors && s.target_majors.length > 0 && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">대상 전공</span>
                <span>{s.target_majors.join(', ')}</span>
              </div>
            )}
            {s.extra_requirements && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">기타 요건</span>
                <span className="whitespace-pre-wrap">{s.extra_requirements}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 신청 정보 (크롤링 데이터) */}
      {(s.selection_method || s.required_documents || s.application_method || s.selection_count) && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              신청 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {s.selection_method && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">선발 방법</span>
                <span className="whitespace-pre-wrap">{s.selection_method}</span>
              </div>
            )}
            {s.selection_count && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">선발 인원</span>
                <span>{s.selection_count}</span>
              </div>
            )}
            {s.application_method && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">신청 방법</span>
                <span className="whitespace-pre-wrap">{s.application_method}</span>
              </div>
            )}
            {s.required_documents && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">제출 서류</span>
                <span className="whitespace-pre-wrap">{s.required_documents}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 자격 요건 상세 & 혜택 (크롤링 데이터) */}
      {(s.eligibility_details || s.benefits_details) && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              상세 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {s.eligibility_details && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">자격 요건</span>
                <span className="whitespace-pre-wrap">{s.eligibility_details}</span>
              </div>
            )}
            {s.benefits_details && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">혜택 상세</span>
                <span className="whitespace-pre-wrap">{s.benefits_details}</span>
              </div>
            )}
            {s.contact_info && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24 shrink-0">문의처</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {s.contact_info}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Essay prompts */}
      {s.essay_prompts && s.essay_prompts.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              자기소개서 문항 ({s.essay_prompts.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">이 문항에 맞춰 AI가 초안을 생성합니다</p>
            {s.essay_prompts.map((ep, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">{ep.max_chars.toLocaleString()}자 이내</span>
                </div>
                <p className="text-sm pl-7 leading-relaxed">{ep.prompt}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 text-sm text-muted-foreground">
          {user
            ? 'AI가 내 프로필을 기반으로 자소서 초안을 작성해드립니다'
            : '로그인하면 AI 자소서 생성 기능을 이용할 수 있습니다'}
        </div>
        {user ? (
          <Button asChild>
            <Link href={`/essays/new?scholarship_id=${s.id}`}>✍️ 자소서 생성하기</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/auth/login">로그인하기</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function InfoItem({ icon, label, children }: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
