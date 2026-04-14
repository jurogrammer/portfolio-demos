import { Suspense } from 'react'
import { searchScholarships } from './actions'
import type { ScholarshipFilters as SearchFilters } from '@/types/database'
import { createClient } from '@/lib/supabase/server'
import ScholarshipCard from '@/components/scholarships/ScholarshipCard'
import ScholarshipFilters from '@/components/scholarships/ScholarshipFilters'
import type { Profile, Scholarship } from '@/types/database'
import { aiEvaluateEligibility, needsAiEvaluation } from '@/lib/ai/match'

export const metadata = {
  title: '장학금 검색 — ScholarSync KR',
  description: '나에게 맞는 장학금을 검색하세요',
}

function getMatchDetails(s: Scholarship, profile: Profile): { matches: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Check degree
  if (s.target_degree.includes('all') || s.target_degree.includes(profile.degree_type)) {
    reasons.push('학위 일치')
  } else {
    return { matches: false, reasons: [] }
  }

  // Check GPA
  if (s.min_gpa != null && profile.gpa != null) {
    if (profile.gpa >= s.min_gpa) reasons.push('학점 충족')
    else return { matches: false, reasons: [] }
  }

  // Check income
  if (s.max_income_quintile != null && profile.income_quintile != null) {
    if (profile.income_quintile <= s.max_income_quintile) reasons.push('소득분위 충족')
    else return { matches: false, reasons: [] }
  }

  // Check region
  if (s.target_regions != null && s.target_regions.length > 0 && profile.region) {
    if (s.target_regions.includes(profile.region)) reasons.push('지역 일치')
    else return { matches: false, reasons: [] }
  }

  // Check major (rule-based substring matching)
  if (s.target_majors != null && s.target_majors.length > 0 && profile.department) {
    const dept = profile.department
    const majorMatch = s.target_majors.some(
      (m) => dept.includes(m) || m.includes(dept)
    )
    if (majorMatch) reasons.push('전공 일치')
    else return { matches: false, reasons: [] }
  }

  return { matches: true, reasons }
}

type SearchParams = { [key: string]: string | string[] | undefined }

function getString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0]
  return v
}

type SortOption = 'deadline' | 'amount' | 'newest'

function sortScholarships(scholarships: Scholarship[], sort: SortOption): Scholarship[] {
  if (sort === 'deadline') return scholarships // already sorted from DB
  const sorted = [...scholarships]
  if (sort === 'amount') {
    sorted.sort((a, b) => {
      if (a.amount_value == null && b.amount_value == null) return 0
      if (a.amount_value == null) return 1
      if (b.amount_value == null) return -1
      return b.amount_value - a.amount_value
    })
  } else if (sort === 'newest') {
    sorted.sort((a, b) => {
      if (!a.created_at && !b.created_at) return 0
      if (!a.created_at) return 1
      if (!b.created_at) return -1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }
  return sorted
}

export default async function ScholarshipsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await props.searchParams
  const isMatching = getString(searchParams.matching) === 'true'
  const sortParam = (getString(searchParams.sort) ?? 'deadline') as SortOption
  const sort: SortOption = ['deadline', 'amount', 'newest'].includes(sortParam) ? sortParam : 'deadline'

  const filters: SearchFilters = {
    degree_type: getString(searchParams.degree_type),
    region: getString(searchParams.region),
    org_type: getString(searchParams.org_type),
    keyword: getString(searchParams.keyword),
    gpa: getString(searchParams.gpa),
    income_quintile: getString(searchParams.income_quintile),
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [scholarships, profileResult] = await Promise.all([
    searchScholarships(filters),
    user
      ? supabase.from('ss_profiles').select('*').eq('user_id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const profile = profileResult.data as Profile | null

  const totalCount = scholarships.length

  // Compute match details when matching is on
  const matchDetailsMap = new Map<string, string[]>()
  let filteredScholarships: Scholarship[]

  if (isMatching && profile) {
    // Phase 1: Rule-based filtering (degree, GPA, income, region)
    const rulePassedScholarships: Scholarship[] = []
    const ruleReasonsMap = new Map<string, string[]>()
    for (const s of scholarships) {
      const { matches, reasons } = getMatchDetails(s, profile)
      if (matches) {
        rulePassedScholarships.push(s)
        ruleReasonsMap.set(s.id, reasons)
      }
    }

    // Phase 2: AI evaluation for scholarships with eligibility criteria
    const needsAi = rulePassedScholarships.filter(needsAiEvaluation)
    const noAi = rulePassedScholarships.filter((s) => !needsAiEvaluation(s))

    let aiResults = new Map<string, { eligible: boolean; reason: string }>()
    if (needsAi.length > 0) {
      aiResults = await aiEvaluateEligibility(profile, needsAi)
    }

    // Merge results
    filteredScholarships = []
    for (const s of noAi) {
      filteredScholarships.push(s)
      matchDetailsMap.set(s.id, ruleReasonsMap.get(s.id) ?? [])
    }
    for (const s of needsAi) {
      const aiResult = aiResults.get(s.id)
      // Fallback: if AI didn't return a result for this scholarship, include it
      if (!aiResult || aiResult.eligible) {
        filteredScholarships.push(s)
        const reasons = ruleReasonsMap.get(s.id) ?? []
        if (aiResult?.reason) reasons.push(aiResult.reason)
        matchDetailsMap.set(s.id, reasons)
      }
    }
  } else {
    filteredScholarships = scholarships
  }

  const displayedScholarships = sortScholarships(filteredScholarships, sort)

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">장학금 검색</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMatching && profile
            ? `총 ${totalCount}개 중 ${displayedScholarships.length}개 매칭`
            : `총 ${totalCount}개의 장학금이 검색되었습니다`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar (desktop) + Sheet trigger (mobile) — single render */}
        <Suspense>
          <ScholarshipFilters />
        </Suspense>

        <div className="flex-1 min-w-0">
          {/* Matching toggle */}
          {user && profile && (
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <MatchingToggle isMatching={isMatching} searchParams={searchParams} />
                <span className="text-sm text-foreground">내 조건에 맞는 장학금만 보기</span>
              </div>
              {isMatching && hasFilters && (
                <span className="text-xs text-muted-foreground">
                  프로필 기반 매칭 결과에 추가 필터를 적용합니다
                </span>
              )}
            </div>
          )}

          {/* Sort + count row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {displayedScholarships.length}개
            </span>
            <SortDropdown sort={sort} searchParams={searchParams} />
          </div>

          {displayedScholarships.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">검색 결과가 없습니다</p>
              <p className="text-sm mt-1">필터 조건을 변경해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedScholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  matchReasons={isMatching ? matchDetailsMap.get(scholarship.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchingToggle({ isMatching, searchParams }: { isMatching: boolean; searchParams: SearchParams }) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'matching') continue
    const v = Array.isArray(value) ? value[0] : value
    if (v) params.set(key, v)
  }
  if (!isMatching) {
    params.set('matching', 'true')
  }
  const href = `/scholarships${params.toString() ? `?${params.toString()}` : ''}`

  return (
    <a
      href={href}
      aria-label={isMatching ? '매칭 끄기' : '매칭 켜기'}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
        isMatching ? 'bg-primary' : 'bg-input'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          isMatching ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </a>
  )
}

function SortDropdown({ sort, searchParams }: { sort: SortOption; searchParams: SearchParams }) {
  const options: { value: SortOption; label: string }[] = [
    { value: 'deadline', label: '마감일순' },
    { value: 'amount', label: '금액순' },
    { value: 'newest', label: '최신등록순' },
  ]

  return (
    <div className="flex items-center gap-1">
      {options.map(({ value, label }) => {
        const params = new URLSearchParams()
        for (const [k, v] of Object.entries(searchParams)) {
          if (k === 'sort') continue
          const val = Array.isArray(v) ? v[0] : v
          if (val) params.set(k, val)
        }
        if (value !== 'deadline') params.set('sort', value)
        const href = `/scholarships${params.toString() ? `?${params.toString()}` : ''}`
        const isActive = sort === value
        return (
          <a
            key={value}
            href={href}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </a>
        )
      })}
    </div>
  )
}
