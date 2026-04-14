import { generateObject, jsonSchema } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { Profile, Scholarship } from '@/types/database'

interface EligibilityResult {
  scholarship_id: string
  eligible: boolean
  reason: string
}

const resultSchema = jsonSchema<{ results: EligibilityResult[] }>({
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          scholarship_id: { type: 'string', description: '장학금 ID' },
          eligible: { type: 'boolean', description: '적격 여부' },
          reason: { type: 'string', description: '판단 근거 (한국어, 10자 이내)' },
        },
        required: ['scholarship_id', 'eligible', 'reason'],
        additionalProperties: false,
      },
    },
  },
  required: ['results'],
  additionalProperties: false,
})

function buildProfileSummary(profile: Profile): string {
  const lines: string[] = []
  if (profile.university) lines.push(`대학교: ${profile.university}`)
  if (profile.department) lines.push(`학과/전공: ${profile.department}`)
  if (profile.degree_type) lines.push(`과정: ${profile.degree_type === 'undergraduate' ? '학부생' : profile.degree_type === 'master' ? '석사' : '박사'}`)
  if (profile.grade) lines.push(`학년: ${profile.grade}학년`)
  if (profile.region) lines.push(`거주지역: ${profile.region}`)
  if (profile.awards) lines.push(`수상경력: ${profile.awards}`)
  if (profile.volunteering) lines.push(`봉사활동: ${profile.volunteering}`)
  if (profile.work_experience) lines.push(`인턴/직무경험: ${profile.work_experience}`)
  if (profile.projects) lines.push(`프로젝트: ${profile.projects}`)
  if (profile.leadership) lines.push(`리더십: ${profile.leadership}`)
  if (profile.experiences) lines.push(`기타경험: ${profile.experiences}`)
  return lines.join('\n')
}

function buildScholarshipList(scholarships: Scholarship[]): string {
  return scholarships.map((s, i) => {
    const parts: string[] = [`${i + 1}. [${s.id}] ${s.name}`]
    if (s.target_majors?.length) parts.push(`   대상전공: ${s.target_majors.join(', ')}`)
    if (s.extra_requirements) parts.push(`   기타요건: ${s.extra_requirements}`)
    if (s.eligibility_details) parts.push(`   자격상세: ${s.eligibility_details}`)
    return parts.join('\n')
  }).join('\n')
}

/**
 * AI로 장학금 자격요건 매칭 평가 (배치)
 * 룰 기반 필터(학위/학점/소득/지역)를 통과한 장학금에 대해
 * target_majors, extra_requirements, eligibility_details를 AI로 판단
 */
export async function aiEvaluateEligibility(
  profile: Profile,
  scholarships: Scholarship[],
): Promise<Map<string, { eligible: boolean; reason: string }>> {
  if (scholarships.length === 0) return new Map()

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: resultSchema,
      system: `당신은 한국 장학금 자격요건 매칭 전문가입니다.
학생 프로필과 장학금 자격요건을 비교하여 적격 여부를 판단합니다.

판단 기준:
- 대상 전공이 명시된 경우, 학생의 학과가 해당 전공 계열에 속하는지 판단하세요. 예: "공학" 계열에는 산업공학, 기계공학, 전기공학 등이 포함됩니다.
- 기타 요건(수상실적, 봉사활동, 특정 경험 등)이 명시된 경우, 학생 프로필에 관련 경험이 있는지 확인하세요.
- **보수적으로 필터링**: 확실히 부적격한 경우(전공 계열이 완전히 다른 경우 등)만 eligible: false로 판정하세요.
- 정보가 부족하여 판단이 어려운 경우 eligible: true로 판정하세요.
- reason은 간결하게 한국어로 작성하세요 (예: "전공 일치", "전공 불일치", "요건 충족").`,
      messages: [{
        role: 'user',
        content: `## 학생 프로필
${buildProfileSummary(profile)}

## 평가 대상 장학금
${buildScholarshipList(scholarships)}

각 장학금에 대해 이 학생의 적격 여부를 판단해주세요.`,
      }],
      temperature: 0.1,
    })

    const map = new Map<string, { eligible: boolean; reason: string }>()
    for (const r of object.results) {
      map.set(r.scholarship_id, { eligible: r.eligible, reason: r.reason })
    }
    return map
  } catch (err) {
    console.error('[ai-match] Evaluation failed, falling back to rule-based only:', err)
    return new Map()
  }
}

/** AI 평가가 필요한 장학금인지 확인 (자유형 텍스트 요건이 있는 경우만 — target_majors는 룰 기반으로 처리) */
export function needsAiEvaluation(s: Scholarship): boolean {
  return (
    (s.extra_requirements != null && s.extra_requirements.trim().length > 0) ||
    (s.eligibility_details != null && s.eligibility_details.trim().length > 0)
  )
}
