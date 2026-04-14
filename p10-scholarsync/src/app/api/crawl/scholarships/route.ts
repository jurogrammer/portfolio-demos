import { NextResponse } from 'next/server'
import { crawlScholarships } from '@/lib/crawl/kosaf'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

/**
 * POST /api/crawl/scholarships
 * 공공데이터포털에서 장학금 데이터를 크롤링하여 DB에 저장
 *
 * 인증: CRON_SECRET 또는 SUPABASE_SERVICE_ROLE_KEY 헤더
 * Vercel Cron에서 자동 호출되거나 수동으로 호출 가능
 */
export async function POST(request: Request) {
  // 인증 확인
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  try {
    const result = await crawlScholarships()

    return NextResponse.json({
      success: true,
      message: `크롤링 완료: ${result.total}건 수집, ${result.updated}건 처리, ${result.skipped}건 스킵`,
      result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    console.error('[Crawl Error]', message)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

/** GET — Vercel Cron에서 호출 (cron job은 GET 요청) */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  try {
    const result = await crawlScholarships()
    return NextResponse.json({
      success: true,
      message: `크롤링 완료: ${result.total}건 수집, ${result.updated}건 처리`,
      result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    console.error('[Crawl Error]', message)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
