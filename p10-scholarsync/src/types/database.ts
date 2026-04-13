export type ScholarshipOrgType = 'government' | 'foundation' | 'local_gov' | 'university'
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
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  university: string | null
  department: string | null
  grade: number | null
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
