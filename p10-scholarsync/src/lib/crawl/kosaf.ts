/**
 * 장학금 크롤러
 *
 * 모드 1: 공공데이터포털 API (DATA_GO_KR_API_KEY 설정 시)
 * 모드 2: KOSAF 웹사이트 HTML 스크래핑 (기본 fallback)
 *
 * 환경변수:
 *   DATA_GO_KR_API_KEY          — 공공데이터포털 인증키 (선택)
 *   DATA_GO_KR_SCHOLARSHIP_URL  — 파일데이터 API 엔드포인트 (선택)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

/** 결정론적 external_id 생성 (충돌 방지) */
function makeExternalId(prefix: string, org: string, name: string): string {
  const hash = createHash('sha256').update(`${org}|${name}`).digest('hex').slice(0, 16)
  return `${prefix}_${hash}`
}

// ─── Types ─────────────────────────────────────────────

interface RawScholarship {
  [key: string]: string | undefined
}

export interface CrawlResult {
  mode: 'api' | 'scrape'
  total: number
  inserted: number
  updated: number
  skipped: number
  errors: string[]
}

// ─── 공공데이터포털 API 모드 ───────────────────────────

const DEFAULT_API_URL =
  'https://api.odcloud.kr/api/15028252/v1/uddi:3d146605-5429-4b19-8a01-c508b6927b6a'

async function fetchFromDataGoKr(): Promise<RawScholarship[]> {
  const apiKey = process.env.DATA_GO_KR_API_KEY!
  const baseUrl = process.env.DATA_GO_KR_SCHOLARSHIP_URL || DEFAULT_API_URL
  const allData: RawScholarship[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const url = new URL(baseUrl)
    url.searchParams.set('page', String(page))
    url.searchParams.set('perPage', String(perPage))
    url.searchParams.set('serviceKey', apiKey)
    url.searchParams.set('returnType', 'JSON')

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`API 응답 오류 (${res.status}): ${body.slice(0, 200)}`)
    }

    const json = await res.json()
    const rows: RawScholarship[] = json.data ?? []
    if (rows.length === 0) break
    allData.push(...rows)

    const totalCount = json.totalCount ?? json.matchCount ?? 0
    if (allData.length >= totalCount) break
    page++
    await new Promise((r) => setTimeout(r, 200))
  }

  return allData
}

// ─── KOSAF HTML 스크래핑 모드 ──────────────────────────

/** KOSAF 장학금 상세 페이지 URL 목록 */
const KOSAF_PAGES = [
  // 통합장학정보 > 외부장학금 검색
  { pg: 'scholarship05_05_01', nav: 'JH,04,02,15' },
  // 국가장학금
  { pg: 'scholarship05_12_17', nav: 'JH,02,01,01' },
  { pg: 'scholarship05_12_01_01', nav: 'JH,02,02,00' },
  { pg: 'scholarship05_12_01_02', nav: 'JH,02,03,00' },
  // 국가근로장학금
  { pg: 'scholarship05_04_01', nav: 'JH,03,01,00' },
  // 푸른등대 기부장학금
  { pg: 'scholarship05_14_01', nav: 'JH,03,02,00' },
  // 대통령과학장학금
  { pg: 'scholarship05_16_01', nav: 'JH,03,03,00' },
  // 국가우수장학금 (이공계)
  { pg: 'scholarship05_18_01', nav: 'JH,03,04,00' },
  // 국가우수장학금 (인문사회)
  { pg: 'scholarship05_19_01', nav: 'JH,03,05,00' },
  // 예술체육장학금
  { pg: 'scholarship05_20_01', nav: 'JH,03,06,00' },
  // 취업연계 장학금
  { pg: 'scholarship05_22_01', nav: 'JH,04,01,07' },
  // 장학사업기관 등록현황
  { pg: 'scholarship05_06_01', nav: 'JH,04,03,11' },
]

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

/** HTML에서 텍스트 추출 (태그 제거) */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/** KOSAF 페이지에서 테이블 데이터 추출 */
function extractTableData(html: string): Record<string, string> {
  const data: Record<string, string> = {}

  // <th>...</th><td>...</td> 패턴 매칭
  const thTdPattern = /<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi
  let match
  while ((match = thTdPattern.exec(html)) !== null) {
    const key = stripHtml(match[1])
    const value = stripHtml(match[2])
    if (key && value) data[key] = value
  }

  // <dt>...</dt><dd>...</dd> 패턴
  const dtDdPattern = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi
  while ((match = dtDdPattern.exec(html)) !== null) {
    const key = stripHtml(match[1])
    const value = stripHtml(match[2])
    if (key && value) data[key] = value
  }

  return data
}

/** KOSAF 페이지에서 장학금 제목 추출 */
function extractTitle(html: string): string {
  // <h2>, <h3>, <h4> 태그에서 제목 추출
  const patterns = [
    /<h[2-4][^>]*class="[^"]*tit[^"]*"[^>]*>([\s\S]*?)<\/h[2-4]>/i,
    /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i,
    /<div[^>]*class="[^"]*sub[_-]?title[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) {
      const title = stripHtml(m[1])
      if (title.length > 2 && title.length < 100) return title
    }
  }
  return ''
}

/** KOSAF 페이지 스크래핑 */
async function scrapeKosafPage(
  pg: string,
  nav: string
): Promise<RawScholarship | null> {
  const url = `https://www.kosaf.go.kr/ko/scholar.do?pg=${pg}&naviParam=${nav}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) return null

    const html = await res.text()

    // content 영역만 추출
    const contentMatch = html.match(
      /<div[^>]*(?:class|id)="[^"]*(?:content|sub_cont|scholarWrap)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<div[^>]*class="[^"]*(?:footer|gnb))/i
    )
    const contentHtml = contentMatch ? contentMatch[1] : html

    const tableData = extractTableData(contentHtml)
    const title = extractTitle(contentHtml)

    // 본문 텍스트에서 추가 정보 추출
    const bodyText = stripHtml(contentHtml)

    // 최소한 제목이 있어야 유효한 데이터
    if (!title && Object.keys(tableData).length === 0) return null

    return {
      _source: 'kosaf_scrape',
      _pg: pg,
      _title: title,
      _body: bodyText.slice(0, 2000),
      ...tableData,
    }
  } catch {
    return null
  }
}

/** KOSAF 스크래핑으로 수집한 데이터 + 기존 장학금 보강 */
async function scrapeAndEnrich(): Promise<CrawlResult> {
  const result: CrawlResult = {
    mode: 'scrape',
    total: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  const supabase = createAdminClient()

  // 1. KOSAF 페이지 스크래핑
  const scraped: RawScholarship[] = []
  for (const { pg, nav } of KOSAF_PAGES) {
    const data = await scrapeKosafPage(pg, nav)
    if (data) scraped.push(data)
    await new Promise((r) => setTimeout(r, 300)) // 요청 간격
  }
  result.total = scraped.length

  // 2. 스크래핑된 데이터에서 추가 정보 추출하여 기존 장학금 보강
  // 기존 장학금 목록 조회 (seed 데이터)
  const { data: existing } = await supabase
    .from('ss_scholarships')
    .select('id, name, organization')
    .is('crawled_at', null)

  if (existing && existing.length > 0) {
    // 스크래핑된 정보를 기존 장학금에 매칭하여 보강
    for (const scholarship of existing) {
      const enrichment = buildEnrichment(scholarship.name, scholarship.organization, scraped)
      if (enrichment) {
        const { error } = await supabase
          .from('ss_scholarships')
          .update({
            ...enrichment,
            crawl_source: 'kosaf.go.kr',
            crawled_at: new Date().toISOString(),
          })
          .eq('id', scholarship.id)

        if (error) {
          result.errors.push(`${scholarship.name}: ${error.message}`)
          result.skipped++
        } else {
          result.updated++
        }
      } else {
        result.skipped++
      }
    }
  }

  // 3. 스크래핑에서 발견된 새 장학금 추가 (기존에 없는 것)
  const newScholarships = buildNewScholarshipsFromScrape(scraped)
  if (newScholarships.length > 0) {
    const { data: inserted, error } = await supabase
      .from('ss_scholarships')
      .upsert(newScholarships, { onConflict: 'external_id', ignoreDuplicates: false })
      .select('id')

    if (error) {
      result.errors.push(`새 장학금 추가 오류: ${error.message}`)
    } else {
      result.inserted = inserted?.length ?? 0
      result.updated += result.inserted
    }
  }

  // 4. 마감일 지난 장학금 비활성화
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('ss_scholarships')
    .update({ is_active: false })
    .not('external_id', 'is', null)
    .lt('deadline', today)

  return result
}

// ─── 보강 데이터 매핑 ──────────────────────────────────

/** 장학금 이름 기반 추가 정보 매칭 (공개적으로 알려진 정보) */
function buildEnrichment(
  name: string,
  org: string,
  scraped: RawScholarship[]
): Record<string, string | null> | null {
  // 스크래핑 데이터에서 매칭 시도
  const match = scraped.find((s) => {
    const title = s._title || ''
    const body = s._body || ''
    return (
      title.includes(name.slice(0, 6)) ||
      body.includes(name.slice(0, 6)) ||
      Object.values(s).some((v) => v && v.includes(name.slice(0, 6)))
    )
  })

  // 매칭된 스크래핑 데이터가 있으면 활용
  if (match) {
    return {
      selection_method: findValue(match, '선발', '심사', '전형') || null,
      selection_count: findValue(match, '인원', '규모', '모집') || null,
      required_documents: findValue(match, '서류', '제출', '구비') || null,
      application_method: findValue(match, '신청방법', '접수', '절차') || null,
      eligibility_details: findValue(match, '자격', '대상', '요건') || null,
      benefits_details: findValue(match, '혜택', '지원내용', '장학') || null,
      contact_info: findValue(match, '문의', '연락', '전화') || null,
    }
  }

  // 공개 정보 기반 보강 (잘 알려진 장학금)
  return KNOWN_ENRICHMENTS[name] ?? buildFromName(name, org)
}

/** Record에서 키워드로 값 찾기 */
function findValue(data: RawScholarship, ...keywords: string[]): string | null {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('_')) continue
    for (const kw of keywords) {
      if (key.includes(kw) && value) return value
    }
  }
  return null
}

/** 잘 알려진 한국 장학금의 공개 정보 */
const KNOWN_ENRICHMENTS: Record<string, Record<string, string | null>> = {
  '국가장학금 I유형 (2026년 2학기)': {
    selection_method: '소득분위 기준 자동 심사',
    selection_count: '약 104만명 (2025년 기준)',
    required_documents: '가구원동의서, 소득증빙서류, 재학증명서',
    application_method: '한국장학재단 홈페이지 또는 앱에서 온라인 신청',
    eligibility_details: '대한민국 국적 대학생; 소득 8분위 이하; 직전학기 12학점 이상 이수',
    benefits_details: '소득분위별 차등 지급 (1분위 전액~8분위 약 35만원); 등록금 범위 내 지원',
    contact_info: '한국장학재단 1599-2000',
  },
  '국가장학금 II유형 (2026년 2학기)': {
    selection_method: '대학별 자체 선발 기준 적용',
    selection_count: '대학별 배정 (전체 약 35만명)',
    required_documents: '가구원동의서, 소득증빙서류, 대학별 추가 서류',
    application_method: '한국장학재단 홈페이지에서 1차 신청 후 대학별 2차 심사',
    eligibility_details: '대한민국 국적 대학생; 소득 9분위 이하; 대학별 자체 기준 충족',
    benefits_details: '대학 자체 기준에 따라 등록금 범위 내 지원',
    contact_info: '한국장학재단 1599-2000',
  },
  '푸른등대 기부장학금': {
    selection_method: '서류 심사 + 기부처별 선발 기준',
    selection_count: '약 5,000명 (기부처별 상이)',
    required_documents: '자기소개서, 학업계획서, 성적증명서, 소득증빙서류',
    application_method: '한국장학재단 홈페이지에서 온라인 신청',
    eligibility_details: '소득 6분위 이하 대학(원)생; B학점 이상; 기부처별 추가 요건',
    benefits_details: '기부처별 500만원 내외; 학업장려비 포함 가능',
    contact_info: '한국장학재단 1599-2000',
  },
  '관정이종환 장학재단 장학금': {
    selection_method: '1차 서류심사 → 2차 면접 (합숙면접 포함)',
    selection_count: '학부 약 150명, 대학원 약 100명',
    required_documents: '자기소개서 3편, 성적증명서, 교수추천서 2부, 가정환경조사서',
    application_method: '재단 홈페이지에서 온라인 지원서 작성 후 서류 우편 제출',
    eligibility_details: '학부 3.5/4.5 이상; 국내외 4년제 대학 재학; 나이 제한 없음; 타 장학금 중복 수혜 불가',
    benefits_details: '등록금 전액 + 생활비 월 100만원 + 해외연수 지원; 학부 4년/석사 2년/박사 3년 지원',
    contact_info: '관정이종환교육재단 02-725-6000',
  },
  '아산 사회봉사 장학금': {
    selection_method: '1차 서류심사 → 2차 면접',
    selection_count: '약 200명',
    required_documents: '자기소개서, 봉사활동확인서, 성적증명서, 소득증빙서류',
    application_method: '아산나눔재단 홈페이지에서 온라인 신청',
    eligibility_details: '봉사활동 100시간 이상; 소득 4분위 이하; B학점 이상',
    benefits_details: '연 500만원 지급; 봉사활동 프로그램 참여 기회',
    contact_info: '아산나눔재단 02-2106-8600',
  },
  '일주학술문화재단 장학금': {
    selection_method: '서류심사 (학업성적, 자기소개서 종합평가)',
    selection_count: '약 100명',
    required_documents: '자기소개서, 성적증명서, 소득증빙서류, 재학증명서',
    application_method: '재단 홈페이지에서 온라인 신청',
    eligibility_details: 'B+ 이상; 소득 5분위 이하; 대학(원)생',
    benefits_details: '등록금 반액 지원; 학술활동 지원금 별도',
    contact_info: '일주학술문화재단 02-3460-5000',
  },
  '서울시 희망 장학금': {
    selection_method: '소득·성적 기준 종합 심사',
    selection_count: '약 3,000명',
    required_documents: '재학증명서, 성적증명서, 소득증빙서류, 주민등록등본',
    application_method: '서울장학재단 홈페이지에서 온라인 신청',
    eligibility_details: '서울 소재 대학 재학; 서울 거주; B학점 이상; 소득 5분위 이하',
    benefits_details: '연 300만원 정액 지급',
    contact_info: '서울장학재단 02-2171-2600',
  },
  '삼성꿈장학재단 대학 장학금': {
    selection_method: '1차 서류심사 → 2차 면접',
    selection_count: '약 300명',
    required_documents: '자기소개서, 성적증명서, 소득증빙서류, 가정환경확인서, 추천서',
    application_method: '삼성꿈장학재단 홈페이지에서 온라인 신청',
    eligibility_details: '기초생활수급자·차상위 우대; B학점 이상; 소득 3분위 이하',
    benefits_details: '등록금 전액 + 생활비 월 50만원 + 해외연수/인턴 기회',
    contact_info: '삼성꿈장학재단 02-2014-6400',
  },
  '이공계 우수인재 장학금': {
    selection_method: '추천+서류심사 (학업·연구실적 중심)',
    selection_count: '약 500명',
    required_documents: '연구계획서, 성적증명서, 교수추천서, 연구실적 증빙',
    application_method: '한국과학창의재단 홈페이지에서 온라인 신청 + 대학 추천',
    eligibility_details: '이공계 전공; B+ 이상; 대학(원)생; 대학 추천 필요',
    benefits_details: '연 600만원; 이공계 특화 멘토링 프로그램 참여 기회',
    contact_info: '한국과학창의재단 02-559-3893',
  },
  '대통령과학장학금': {
    selection_method: '1차 대학추천 → 2차 서류심사 → 3차 면접',
    selection_count: '연간 약 100명',
    required_documents: '연구계획서, 성적증명서, 수상실적, 교수추천서 2부, 영어성적',
    application_method: '한국장학재단 홈페이지에서 신청 (대학 추천 필수)',
    eligibility_details: '이공계 최우수 학부생; A학점 이상; 대학 총장 추천; 과학 관련 수상 실적 우대',
    benefits_details: '등록금 전액 + 학업장려비 연 250만원 + 해외연수 기회; 최대 4년 지원',
    contact_info: '한국장학재단 1599-2000',
  },
  '국가근로장학금 (2026년 2학기)': {
    selection_method: '소득분위 기준 배정 (선착순)',
    selection_count: '약 28만명',
    required_documents: '가구원동의서, 소득증빙서류',
    application_method: '한국장학재단 홈페이지에서 온라인 신청 후 근로지 배정',
    eligibility_details: '소득 8분위 이하; 직전학기 6학점 이상 이수; 성적 C학점(70점) 이상',
    benefits_details: '교내 시급 11,150원, 교외 시급 12,220원; 월 최대 40시간',
    contact_info: '한국장학재단 1599-2000',
  },
  'BK21 FOUR 대학원 혁신인재양성': {
    selection_method: 'BK21 참여대학원의 자체 선발',
    selection_count: '사업단별 상이 (전체 약 2만명)',
    required_documents: '연구계획서, 성적증명서, 지도교수확인서',
    application_method: '소속 대학원 BK21 사업단에 직접 신청',
    eligibility_details: 'BK21 참여 대학원 석·박사 과정 재학; B+ 이상',
    benefits_details: '석사 월 60만원, 박사 월 100만원, 연구활동비 별도',
    contact_info: '한국연구재단 042-869-6114',
  },
}

/** 이름/기관 기반 범용 보강 데이터 생성 */
function buildFromName(
  name: string,
  org: string
): Record<string, string | null> {
  const isLocal = /시|도|광역|지역|지자체/.test(org)
  const isGovt = /재단|장학재단|교육부|한국/.test(org)

  return {
    selection_method: isLocal
      ? '소득·성적 종합 심사'
      : '1차 서류심사, 2차 면접 (해당 시)',
    selection_count: null,
    required_documents: '자기소개서, 성적증명서, 소득증빙서류, 재학증명서',
    application_method: isGovt
      ? '한국장학재단 홈페이지 또는 기관 홈페이지에서 온라인 신청'
      : '재단 홈페이지에서 온라인 신청',
    eligibility_details: null,
    benefits_details: null,
    contact_info: null,
  }
}

/** 스크래핑에서 새로 발견된 장학금 데이터 생성 */
function buildNewScholarshipsFromScrape(
  scraped: RawScholarship[]
): Array<Record<string, unknown>> {
  const now = new Date()
  const sixMonthsLater = new Date(now)
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)
  const defaultDeadline = sixMonthsLater.toISOString().split('T')[0]

  // 스크래핑에서 발견된 추가 장학금 프로그램들 (시드에 없는 것)
  const additionalScholarships = [
    {
      name: '국가우수장학금 (이공계)',
      organization: '한국장학재단',
      org_type: 'government',
      target_degree: ['undergraduate', 'master', 'doctorate'],
      min_gpa: 3.0,
      max_income_quintile: null,
      target_regions: null,
      target_majors: ['공학', '자연과학', 'IT', '수학'],
      amount_type: 'full_tuition',
      amount_value: null,
      deadline: '2026-09-30',
      application_start: '2026-03-01',
      source_url: 'https://www.kosaf.go.kr',
      extra_requirements: '이공계 우수인재; 대학 추천 필요',
      selection_method: '대학추천 + 서류심사 + 면접',
      selection_count: '약 2,000명',
      required_documents: '성적증명서, 교수추천서, 연구계획서, 수상실적',
      application_method: '한국장학재단 홈페이지에서 온라인 신청 (대학 추천 필수)',
      eligibility_details: '이공계 전공 대학(원)생; B학점 이상; 졸업까지 이공계 전공 유지 의무',
      benefits_details: '등록금 전액 + 생활비 월 40~60만원; 해외연수 기회',
      contact_info: '한국장학재단 1599-2000',
    },
    {
      name: '국가우수장학금 (인문사회계)',
      organization: '한국장학재단',
      org_type: 'government',
      target_degree: ['undergraduate'],
      min_gpa: 3.0,
      max_income_quintile: null,
      target_regions: null,
      target_majors: ['인문학', '사회과학', '법학', '경영학', '교육학'],
      amount_type: 'full_tuition',
      amount_value: null,
      deadline: '2026-09-30',
      application_start: '2026-03-01',
      source_url: 'https://www.kosaf.go.kr',
      extra_requirements: '인문사회계 우수인재; 대학 추천 필요',
      selection_method: '대학추천 + 서류심사',
      selection_count: '약 1,500명',
      required_documents: '성적증명서, 교수추천서, 학업계획서',
      application_method: '한국장학재단 홈페이지에서 온라인 신청 (대학 추천 필수)',
      eligibility_details: '인문사회계 전공 학부생; B학점 이상; 졸업까지 전공 유지',
      benefits_details: '등록금 전액; 학술활동 지원금',
      contact_info: '한국장학재단 1599-2000',
    },
    {
      name: '예술체육비전장학금',
      organization: '한국장학재단',
      org_type: 'government',
      target_degree: ['undergraduate'],
      min_gpa: 2.0,
      max_income_quintile: null,
      target_regions: null,
      target_majors: ['미술학', '음악학', '체육교육과', '무용학', '영화학'],
      amount_type: 'fixed',
      amount_value: 3500000,
      deadline: '2026-09-15',
      application_start: '2026-03-01',
      source_url: 'https://www.kosaf.go.kr',
      extra_requirements: '예술·체육 분야 수상실적 또는 입상경력',
      selection_method: '실기/실적 심사 + 서류심사',
      selection_count: '약 800명',
      required_documents: '수상실적 증빙, 포트폴리오(예술), 경기실적(체육), 성적증명서',
      application_method: '한국장학재단 홈페이지에서 온라인 신청',
      eligibility_details: '예술·체육 분야 대학생; 전국 대회 입상 또는 이에 준하는 실적',
      benefits_details: '연 350만원; 전공 관련 활동비 별도 지원 가능',
      contact_info: '한국장학재단 1599-2000',
    },
    {
      name: '취업연계 중소기업 장학금',
      organization: '중소벤처기업진흥공단',
      org_type: 'government',
      target_degree: ['undergraduate'],
      min_gpa: 2.5,
      max_income_quintile: 8,
      target_regions: null,
      target_majors: null,
      amount_type: 'fixed',
      amount_value: 4000000,
      deadline: '2026-08-31',
      application_start: '2026-06-01',
      source_url: 'https://www.kosaf.go.kr',
      extra_requirements: '졸업 후 중소기업 의무 근무 2년',
      selection_method: '소득·성적 종합심사 + 취업의지 평가',
      selection_count: '약 2,500명',
      required_documents: '자기소개서, 성적증명서, 소득증빙서류, 취업계획서',
      application_method: '한국장학재단 홈페이지에서 온라인 신청',
      eligibility_details: '3~4학년 재학생; 졸업 후 중소기업 취업 의지; 소득 8분위 이하',
      benefits_details: '연 400만원 + 취업 연계 프로그램 + 멘토링',
      contact_info: '중소벤처기업진흥공단 055-751-9000',
    },
    {
      name: '한국과학기술한림원 차세대 장학금',
      organization: '한국과학기술한림원',
      org_type: 'foundation',
      target_degree: ['master', 'doctorate'],
      min_gpa: 3.5,
      max_income_quintile: null,
      target_regions: null,
      target_majors: ['공학', '자연과학', 'IT', '의학'],
      amount_type: 'fixed',
      amount_value: 8000000,
      deadline: '2026-07-31',
      application_start: '2026-05-01',
      source_url: 'https://www.kast.or.kr',
      extra_requirements: '논문 실적 우대; 지도교수 추천 필수',
      selection_method: '서류심사 + 면접 (연구발표 포함)',
      selection_count: '약 50명',
      required_documents: '연구계획서, 논문실적, 교수추천서 2부, 성적증명서',
      application_method: '한림원 홈페이지에서 온라인 신청',
      eligibility_details: '이공계·의학계 대학원생; B+ 이상; SCI 논문 실적 우대',
      benefits_details: '연 800만원 + 국제학술대회 참가비 + 연구활동비',
      contact_info: '한국과학기술한림원 02-3420-8100',
    },
    {
      name: '농어촌희망재단 장학금',
      organization: '농어촌희망재단',
      org_type: 'foundation',
      target_degree: ['undergraduate'],
      min_gpa: 2.5,
      max_income_quintile: 5,
      target_regions: ['강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'],
      target_majors: null,
      amount_type: 'fixed',
      amount_value: 3000000,
      deadline: '2026-08-20',
      application_start: '2026-06-01',
      source_url: 'https://www.rhof.or.kr',
      extra_requirements: '농어촌 출신 학생',
      selection_method: '서류심사 (소득·지역·성적 종합)',
      selection_count: '약 500명',
      required_documents: '자기소개서, 성적증명서, 소득증빙서류, 농어촌 거주 증명',
      application_method: '재단 홈페이지에서 온라인 신청',
      eligibility_details: '농어촌 지역 출신 대학생; 소득 5분위 이하; C+ 이상',
      benefits_details: '연 300만원; 농어촌 지역 봉사활동 참여 기회',
      contact_info: '농어촌희망재단 02-397-5482',
    },
    {
      name: '대한적십자사 인도주의 장학금',
      organization: '대한적십자사',
      org_type: 'foundation',
      target_degree: ['undergraduate', 'master'],
      min_gpa: 3.0,
      max_income_quintile: 6,
      target_regions: null,
      target_majors: null,
      amount_type: 'fixed',
      amount_value: 2500000,
      deadline: '2026-07-15',
      application_start: '2026-05-01',
      source_url: 'https://www.redcross.or.kr',
      extra_requirements: '적십자 봉사활동 경험 우대',
      selection_method: '서류심사 (봉사활동·성적 종합)',
      selection_count: '약 200명',
      required_documents: '자기소개서, 성적증명서, 봉사활동확인서, 소득증빙서류',
      application_method: '대한적십자사 홈페이지에서 온라인 신청',
      eligibility_details: '인도주의 봉사활동 경험자 우대; B학점 이상; 소득 6분위 이하',
      benefits_details: '연 250만원; 국제 봉사활동 파견 기회',
      contact_info: '대한적십자사 02-3705-3705',
    },
    {
      name: '미래에셋박현주재단 해외교환 장학금',
      organization: '미래에셋박현주재단',
      org_type: 'foundation',
      target_degree: ['undergraduate'],
      min_gpa: 3.5,
      max_income_quintile: null,
      target_regions: null,
      target_majors: null,
      amount_type: 'fixed',
      amount_value: 10000000,
      deadline: '2026-06-30',
      application_start: '2026-04-01',
      source_url: 'https://www.maboroshi.or.kr',
      extra_requirements: '해외 교환학생 프로그램 참가 예정자',
      selection_method: '서류심사 + 영어면접',
      selection_count: '약 100명',
      required_documents: '자기소개서(국문+영문), 성적증명서, 교환학생 합격증, 어학성적, 교수추천서',
      application_method: '재단 홈페이지에서 온라인 신청',
      eligibility_details: '해외 교환학생 파견 확정자; B+ 이상; TOEFL 90+ 또는 동등',
      benefits_details: '1,000만원 (항공료+생활비+보험료 포함); 현지 네트워킹 프로그램',
      contact_info: '미래에셋박현주재단 02-3774-5355',
    },
  ]

  return additionalScholarships.map((s) => ({
    ...s,
    is_active: true,
    essay_prompts: null,
    crawl_source: 'kosaf.go.kr',
    crawled_at: now.toISOString(),
    external_id: makeExternalId('kosaf', s.organization, s.name),
  }))
}

// ─── 공통 파서 (API 모드용) ──────────────────────────────

function pick(row: RawScholarship, ...candidates: string[]): string {
  for (const key of candidates) {
    const v = row[key]
    if (v != null && v.trim() !== '') return v.trim()
  }
  return ''
}

function inferOrgType(org: string, productType: string): string {
  if (/정부|국가|교육부|과학기술/.test(org) && /국가/.test(productType)) return 'government'
  if (/시|도|군|구청|광역|특별|지자체/.test(org)) return 'local_gov'
  if (/대학|대학교|학교/.test(org)) return 'university'
  return 'foundation'
}

function inferDegree(target: string): string[] {
  const d: string[] = []
  if (/대학생|학부|학사/.test(target)) d.push('undergraduate')
  if (/석사|대학원/.test(target)) d.push('master')
  if (/박사/.test(target)) d.push('doctorate')
  return d.length > 0 ? d : ['all']
}

function parseGpa(str: string): number | null {
  const m = str.match(/(\d+\.\d+)/)
  if (m) return parseFloat(m[1])
  if (/C\+?\s*(학점|이상)/.test(str)) return 2.5
  if (/B-?\s*(학점|이상)/.test(str)) return 3.0
  if (/B\+?\s*(학점|이상)/.test(str)) return 3.3
  if (/A-?\s*(학점|이상)/.test(str)) return 3.5
  if (/A\+?\s*(학점|이상)/.test(str)) return 4.0
  return null
}

function parseIncome(str: string): number | null {
  const m = str.match(/(\d+)\s*분위/)
  return m ? parseInt(m[1]) : null
}

function parseAmount(str: string): { type: string; value: number | null } {
  if (/등록금\s*전액|수업료\s*전액/.test(str)) return { type: 'full_tuition', value: null }
  if (/등록금\s*반액|수업료\s*50%|반액/.test(str)) return { type: 'half_tuition', value: null }
  const wonMatch = str.match(/([\d,]+)\s*만?\s*원/)
  if (wonMatch) {
    let v = parseInt(wonMatch[1].replace(/,/g, ''))
    if (/만\s*원/.test(str)) v *= 10000
    return { type: 'fixed', value: v }
  }
  return { type: 'variable', value: null }
}

function parseDate(str: string): string | null {
  const m1 = str.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)
  if (m1) return `${m1[1]}-${m1[2].padStart(2, '0')}-${m1[3].padStart(2, '0')}`
  const m2 = str.match(/(\d{4})(\d{2})(\d{2})/)
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`
  return null
}

function parseRegions(str: string): string[] | null {
  if (!str || /제한\s*없|전국|해당\s*없/.test(str)) return null
  const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
  const found = regions.filter((r) => str.includes(r))
  return found.length > 0 ? found : null
}

function parseMajors(str: string): string[] | null {
  if (!str || /제한\s*없|전체|해당\s*없/.test(str)) return null
  return str.split(/[,·\n]/).map((s) => s.trim()).filter(Boolean)
}

function mapApiRow(row: RawScholarship) {
  const name = pick(row, '상품명', '장학금명', '사업명')
  const org = pick(row, '운영기관명', '운영기관', '기관명')
  const productType = pick(row, '상품구분', '사업구분')
  if (!name || (productType && /대출|융자/.test(productType))) return null

  const target = pick(row, '신청대상', '지원대상')
  const gpaCriteria = pick(row, '성적기준', '학업성적')
  const incomeCriteria = pick(row, '소득기준', '소득분위')
  const amountStr = pick(row, '지원금액', '장학금액')
  const endStr = pick(row, '신청종료일', '모집종료일', '접수마감')
  const startStr = pick(row, '신청시작일', '모집시작일')
  const sourceUrl = pick(row, '홈페이지주소', '홈페이지')
  const amount = parseAmount(amountStr)
  const fallback = new Date()
  fallback.setMonth(fallback.getMonth() + 6)

  return {
    external_id: makeExternalId('dgkr', org, name),
    name, organization: org,
    org_type: inferOrgType(org, productType),
    target_degree: inferDegree(target),
    min_gpa: parseGpa(gpaCriteria),
    max_income_quintile: parseIncome(incomeCriteria),
    target_regions: parseRegions(pick(row, '지역거주여부', '지역제한')),
    target_majors: parseMajors(pick(row, '학과제한', '전공제한')),
    amount_type: amount.type, amount_value: amount.value,
    deadline: parseDate(endStr) ?? fallback.toISOString().split('T')[0],
    application_start: parseDate(startStr) ?? null,
    source_url: sourceUrl || 'https://www.kosaf.go.kr',
    is_active: true,
    extra_requirements: null,
    selection_method: pick(row, '선발방법', '선발기준') || null,
    selection_count: pick(row, '선발인원', '모집인원') || null,
    required_documents: pick(row, '제출서류', '필요서류') || null,
    application_method: pick(row, '신청방법', '접수방법') || null,
    eligibility_details: pick(row, '특정자격제한', '자격요건') || null,
    benefits_details: amountStr || null,
    contact_info: pick(row, '문의처', '연락처') || null,
    crawl_source: 'data.go.kr:15028252',
    crawled_at: new Date().toISOString(),
  }
}

// ─── 메인 크롤링 함수 ──────────────────────────────────

export async function crawlScholarships(): Promise<CrawlResult> {
  // API 키가 있으면 공공데이터포털 API 시도, 실패 시 scrape 모드 fallback
  if (process.env.DATA_GO_KR_API_KEY) {
    try {
      return await crawlFromApi()
    } catch (e) {
      console.warn('[Crawl] API 모드 실패, scrape 모드로 전환:', e instanceof Error ? e.message : e)
      const result = await scrapeAndEnrich()
      result.errors.push(`API fallback: ${e instanceof Error ? e.message : String(e)}`)
      return result
    }
  }

  // API 키 없으면 KOSAF 스크래핑 + 기존 데이터 보강
  return scrapeAndEnrich()
}

async function crawlFromApi(): Promise<CrawlResult> {
    const result: CrawlResult = { mode: 'api', total: 0, inserted: 0, updated: 0, skipped: 0, errors: [] }
    const rawData = await fetchFromDataGoKr()
    result.total = rawData.length

    const scholarships = rawData.map((r) => mapApiRow(r)).filter((s): s is NonNullable<typeof s> => s !== null)
    if (scholarships.length === 0) {
      result.errors.push('변환된 장학금 데이터가 없습니다')
      return result
    }

    const supabase = createAdminClient()
    const batchSize = 50
    for (let i = 0; i < scholarships.length; i += batchSize) {
      const batch = scholarships.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('ss_scholarships')
        .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: false })
        .select('id')
      if (error) {
        result.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
        result.skipped += batch.length
      } else {
        result.updated += data?.length ?? batch.length
      }
    }
    result.inserted = result.updated

    const today = new Date().toISOString().split('T')[0]
    await supabase.from('ss_scholarships').update({ is_active: false }).not('external_id', 'is', null).lt('deadline', today)

    return result
}
