import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'
import { FREE_ESSAY_LIMIT } from '@/lib/constants'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const scholarship_id: string = body.scholarship_id
  // useCompletion sends user input as 'prompt'; treat it as user_keywords
  const user_keywords: string | undefined = body.prompt || body.user_keywords

  if (!scholarship_id) {
    return Response.json({ error: '장학금 ID가 필요합니다.' }, { status: 400 })
  }

  // Fetch scholarship
  const { data: scholarship, error: scholarshipError } = await supabase
    .from('ss_scholarships')
    .select('id, name, organization, essay_prompts')
    .eq('id', scholarship_id)
    .single()

  if (scholarshipError || !scholarship) {
    return Response.json({ error: '장학금 정보를 찾을 수 없습니다.' }, { status: 404 })
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('ss_profiles')
    .select('university, department, gpa, gpa_by_grade, gpa_scale, grade, region, degree_type, experiences, bio_keywords, awards, volunteering, work_experience, projects, leadership, motivation')
    .eq('user_id', user.id)
    .single()

  // Rate limit check: count this month's generations
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ss_essay_generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('generated_at', monthStart.toISOString())

  if ((count ?? 0) >= FREE_ESSAY_LIMIT) {
    return Response.json(
      { error: `이번 달 자소서 생성 횟수(월 ${FREE_ESSAY_LIMIT}회)를 모두 사용했습니다. 다음 달에 다시 이용해주세요.` },
      { status: 429 }
    )
  }

  const prompts = scholarship.essay_prompts ?? []
  if (prompts.length === 0) {
    return Response.json({ error: '이 장학금에는 자소서 항목이 없습니다.' }, { status: 400 })
  }

  const profileContext = [
    `대학교: ${profile?.university ?? '미입력'}`,
    `학과: ${profile?.department ?? '미입력'}`,
    `학점: ${
      profile?.gpa_by_grade && Object.keys(profile.gpa_by_grade).length > 0
        ? Object.entries(profile.gpa_by_grade)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([g, v]) => `${g}학년 ${v}`)
            .join(', ') + ` (평균 ${profile?.gpa ?? '미산출'})/${profile?.gpa_scale ?? 4.5}`
        : `${profile?.gpa ?? '미입력'}/${profile?.gpa_scale ?? 4.5}`
    }`,
    `학년: ${profile?.grade ?? '미입력'}학년`,
    `지역: ${profile?.region ?? '미입력'}`,
    `학력구분: ${profile?.degree_type ?? '학부생'}`,
    profile?.awards ? `수상 경력:\n${profile.awards}` : '',
    profile?.volunteering ? `봉사활동:\n${profile.volunteering}` : '',
    profile?.work_experience ? `인턴/직무 경험:\n${profile.work_experience}` : '',
    profile?.projects ? `프로젝트/연구:\n${profile.projects}` : '',
    profile?.leadership ? `리더십/동아리:\n${profile.leadership}` : '',
    profile?.motivation ? `지원 동기/미래 계획:\n${profile.motivation}` : '',
    profile?.experiences ? `기타 경험:\n${profile.experiences}` : '',
    profile?.bio_keywords ? `본인 소개 키워드: ${profile.bio_keywords}` : '',
    user_keywords ? `추가 강조 내용: ${user_keywords}` : '',
  ].filter(Boolean).join('\n\n')

  const essayInstructions = prompts
    .map((p: { prompt: string; max_chars: number }, i: number) =>
      `[항목 ${i + 1}] ${p.prompt} (최대 ${p.max_chars}자)`
    )
    .join('\n')

  const result = streamText({
    model: openai('gpt-4o'),
    system: `당신은 한국 장학금 자기소개서 전문 작성 도우미입니다. 지원자의 정보를 바탕으로 진정성 있고 구체적인 자기소개서를 작성해주세요.
규칙:
- 반드시 한국어로 작성하세요.
- 각 항목의 최대 글자 수를 엄격히 지키세요 (공백 포함).
- 지원자 정보를 자연스럽게 녹여내세요.
- 각 항목은 반드시 [ESSAY_번호] 마커로 시작하고 [/ESSAY_번호] 마커로 끝내세요.
- 마커 외에 추가 설명이나 메타 텍스트는 작성하지 마세요.`,
    prompt: `장학금명: ${scholarship.name} (${scholarship.organization})

지원자 정보:
${profileContext}

다음 자기소개서 항목들을 순서대로 작성해주세요:
${essayInstructions}

출력 형식 예시:
[ESSAY_1]
(항목 1 내용)
[/ESSAY_1]
[ESSAY_2]
(항목 2 내용)
[/ESSAY_2]`,
    temperature: 0.8,
  })

  // Record generation (non-blocking, fire-and-forget)
  supabase
    .from('ss_essay_generations')
    .insert({ user_id: user.id, scholarship_id })
    .then(() => {})

  return result.toTextStreamResponse()
}
