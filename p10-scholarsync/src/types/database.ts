export type ScholarshipOrgType = 'government' | 'foundation' | 'local_gov' | 'university'

// Shared form / API types
export type EssayContent = Record<string, string>

export interface AutofillResult {
  university: string
  department: string
  grade: number
  degree_type: 'undergraduate' | 'master' | 'doctorate'
  region: string
  interests: string
  bio_keywords: string
  awards: string
  volunteering: string
  work_experience: string
  projects: string
  leadership: string
  motivation: string
  experiences: string
}

export interface ProfileUpdateData {
  university: string
  department: string
  grade: string
  semester: string
  gpa_by_grade: Record<string, string>
  gpa_scale: string
  income_quintile: string
  region: string
  degree_type: string
  interests: string
  bio_keywords: string
  experiences: string
  awards: string
  volunteering: string
  work_experience: string
  projects: string
  leadership: string
  motivation: string
}

export interface ScholarshipFilters {
  degree_type?: string
  region?: string
  org_type?: string
  keyword?: string
  gpa?: string
  income_quintile?: string
}
export type DegreeType = 'undergraduate' | 'master' | 'doctorate' | 'all'
export type AmountType = 'full_tuition' | 'half_tuition' | 'fixed' | 'variable'

export interface EssayPrompt {
  prompt: string
  max_chars: number
}

export interface Scholarship {
  id: string
  name: string
  organization: string
  org_type: ScholarshipOrgType
  target_degree: DegreeType[]
  min_gpa: number | null
  max_income_quintile: number | null
  target_regions: string[] | null
  target_majors: string[] | null
  amount_type: AmountType
  amount_value: number | null
  deadline: string
  application_start: string | null
  essay_prompts: EssayPrompt[] | null
  source_url: string
  is_active: boolean
  extra_requirements: string | null
  // 크롤링 추가 필드 (AI 추천용)
  external_id: string | null
  selection_method: string | null
  selection_count: string | null
  required_documents: string | null
  application_method: string | null
  eligibility_details: string | null
  benefits_details: string | null
  contact_info: string | null
  crawl_source: string | null
  crawled_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  university: string | null
  department: string | null
  grade: number | null
  semester: number | null
  gpa: number | null
  gpa_by_grade: Record<string, number> | null
  gpa_scale: number
  income_quintile: number | null
  region: string | null
  degree_type: DegreeType
  interests: string[] | null
  bio_keywords: string | null
  experiences: string | null
  awards: string | null
  volunteering: string | null
  work_experience: string | null
  projects: string | null
  leadership: string | null
  motivation: string | null
  created_at: string
  updated_at: string
}

export interface Essay {
  id: string
  user_id: string
  scholarship_id: string
  content: Record<string, string>
  created_at: string
  updated_at: string
}

export interface EssayGeneration {
  id: string
  user_id: string
  scholarship_id: string
  generated_at: string
}
