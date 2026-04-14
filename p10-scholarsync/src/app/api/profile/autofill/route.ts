import { NextRequest } from 'next/server'
import { generateObject, jsonSchema } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'
import type { AutofillResult } from '@/types/database'

const profileSchema = jsonSchema<AutofillResult>({
  type: 'object',
  properties: {
    university: { type: 'string', description: '대학교명 (예: 경희대학교)' },
    department: { type: 'string', description: '학과/전공명 (예: 산업경영공학과)' },
    grade: { type: 'number', description: '현재 학년 (1~6), 없으면 0' },
    degree_type: { type: 'string', enum: ['undergraduate', 'master', 'doctorate'], description: '학부생/석사/박사' },
    region: { type: 'string', description: '거주 지역 (광역시/도 단위)' },
    interests: { type: 'string', description: '관심 분야 (쉼표 구분)' },
    bio_keywords: { type: 'string', description: '성격, 강점, 가치관 요약' },
    awards: { type: 'string', description: '수상 경력' },
    volunteering: { type: 'string', description: '봉사활동' },
    work_experience: { type: 'string', description: '인턴/직무 경험' },
    projects: { type: 'string', description: '프로젝트/연구 경험' },
    leadership: { type: 'string', description: '리더십/동아리 경험' },
    motivation: { type: 'string', description: '지원 동기, 미래 계획' },
    experiences: { type: 'string', description: '기타 경험 (교환학생, 자격증, 어학성적 등)' },
  },
  required: ['university', 'department', 'grade', 'degree_type', 'region', 'interests', 'bio_keywords', 'awards', 'volunteering', 'work_experience', 'projects', 'leadership', 'motivation', 'experiences'],
  additionalProperties: false,
})

type ImagePart = { type: 'image'; image: URL }
type TextPart = { type: 'text'; text: string }
type PromptContent = Array<TextPart | ImagePart>

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { text, images } = await req.json() as { text?: string; images?: string[] }

  const hasText = text && typeof text === 'string' && text.trim().length >= 20
  const hasImages = Array.isArray(images) && images.length > 0

  if (!hasText && !hasImages) {
    return Response.json({ error: '텍스트(20자 이상) 또는 이미지를 하나 이상 입력해주세요.' }, { status: 400 })
  }

  if (text && text.length > 10000) {
    return Response.json({ error: '텍스트는 10,000자 이내로 입력해주세요.' }, { status: 400 })
  }

  if (images && images.length > 5) {
    return Response.json({ error: '이미지는 최대 5장까지 첨부할 수 있습니다.' }, { status: 400 })
  }

  // Build multimodal prompt content
  const content: PromptContent = []

  content.push({
    type: 'text',
    text: '다음 내용에서 프로필 정보를 추출해주세요:',
  })

  if (hasImages) {
    for (const dataUrl of images) {
      content.push({ type: 'image', image: new URL(dataUrl) })
    }
  }

  if (hasText) {
    content.push({ type: 'text', text: text })
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: profileSchema,
      system: `당신은 한국 대학생/대학원생의 이력서, 자기소개서, 자유 형식 텍스트 및 이미지에서 프로필 정보를 추출하는 전문가입니다.
이미지가 포함된 경우, 이미지에 보이는 모든 텍스트와 정보를 꼼꼼히 읽어서 추출하세요.

규칙:
- 반드시 한국어로 추출하세요.
- 텍스트/이미지에 명시되지 않은 정보는 빈 문자열("")로 남기세요. 추측하거나 지어내지 마세요.
- 학년(grade)은 명시되지 않으면 0으로 반환하세요.
- 거주 지역은 광역시/도 단위로 변환하세요 (예: "강남구" → "서울", "수원시" → "경기").
- 각 경험 필드는 "- " 불릿으로 항목을 구분하여 작성하세요.
- 날짜, 기간 등 구체적 정보가 있으면 최대한 포함하세요.
- degree_type은 학부생이면 undergraduate, 석사과정이면 master, 박사과정이면 doctorate로 설정하세요. 명시되지 않으면 undergraduate로 설정하세요.`,
      messages: [{ role: 'user', content }],
      temperature: 0.2,
    })

    return Response.json(object)
  } catch (err) {
    console.error('[autofill] AI generation error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'AI 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
