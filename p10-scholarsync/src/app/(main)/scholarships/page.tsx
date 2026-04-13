import { Suspense } from 'react'
import { searchScholarships, type ScholarshipFilters as SearchFilters } from './actions'
import { createClient } from '@/lib/supabase/server'
import ScholarshipCard from '@/components/scholarships/ScholarshipCard'
import ScholarshipFilters from '@/components/scholarships/ScholarshipFilters'
import type { Profile, Scholarship } from '@/types/database'

export const metadata = {
  title: '장학금 검색 — ScholarSync KR',
  description: '나에게 맞는 장학금을 검색하세요',
}

function matchesProfile(s: Scholarship, profile: Profile): boolean {
  if (s.min_gpa != null && profile.gpa != null && profile.gpa < s.min_gpa) return false
  if (s.max_income_quintile != null && profile.income_quintile != null && profile.income_quintile > s.max_income_quintile) return false
  if (s.target_regions != null && s.target_regions.length > 0 && profile.region) {
    if (!s.target_regions.includes(profile.region)) return false
  }
  if (!s.target_degree.includes('all') && !s.target_degree.includes(profile.degree_type)) return false
  return true
}

type SearchParams = { [key: string]: string | string[] | undefined }

function getString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0]
  return v
}

export default async function ScholarshipsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await props.searchParams
  const isMatching = getString(searchParams.matching) === 'true'

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

  const displayedScholarships = isMatching && profile
    ? scholarships.filter((s) => matchesProfile(s, profile))
    : scholarships

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">장학금 검색</h1>
        <p className="text-muted-foreground text-sm mt-1">
          총 {scholarships.length}개의 장학금이 검색되었습니다
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
            <div className="flex items-center gap-3 mb-5">
              <MatchingToggle isMatching={isMatching} searchParams={searchParams} />
              {isMatching && (
                <span className="text-sm text-muted-foreground">
                  내 프로필에 맞는 장학금 {displayedScholarships.length}개
                </span>
              )}
            </div>
          )}

          {displayedScholarships.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">검색 결과가 없습니다</p>
              <p className="text-sm mt-1">필터 조건을 변경해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedScholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchingToggle({ isMatching, searchParams }: { isMatching: boolean; searchParams: SearchParams }) {
  // Build URL preserving all existing search params
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
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        isMatching
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
      }`}
    >
      ✨ 내게 맞는 장학금
    </a>
  )
}
