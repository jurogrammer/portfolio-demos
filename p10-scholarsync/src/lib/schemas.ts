import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
})

export const profileUpdateSchema = z.object({
  university: z.string(),
  department: z.string(),
  grade: z.string(),
  semester: z.string(),
  gpa_by_grade: z.record(z.string(), z.string()),
  gpa_scale: z.string(),
  income_quintile: z.string(),
  region: z.string(),
  degree_type: z.string(),
  interests: z.string(),
  bio_keywords: z.string(),
  experiences: z.string(),
  awards: z.string(),
  volunteering: z.string(),
  work_experience: z.string(),
  projects: z.string(),
  leadership: z.string(),
  motivation: z.string(),
})

export const essaySaveSchema = z.object({
  scholarshipId: z.string().uuid('유효하지 않은 장학금 ID입니다.'),
  content: z.record(z.string(), z.string()),
})

export const scholarshipFiltersSchema = z.object({
  degree_type: z.string().optional(),
  region: z.string().optional(),
  org_type: z.string().optional(),
  keyword: z.string().optional(),
  gpa: z.string().optional(),
  income_quintile: z.string().optional(),
})
