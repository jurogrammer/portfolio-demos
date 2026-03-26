import { sheets, auth } from '@googleapis/sheets'

// Rate limit retry wrapper: catches HTTP 429 and retries with exponential backoff
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      lastError = err
      const status =
        (err as { status?: number; code?: number })?.status ??
        (err as { status?: number; code?: number })?.code
      if (status === 429 && attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        continue
      }
      throw err
    }
  }
  throw lastError
}

// Singleton auth client (module-level, reused across requests)
let sheetsClient: ReturnType<typeof sheets> | null = null

export function getSheets() {
  if (sheetsClient) return sheetsClient

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const keyBase64 = process.env.GOOGLE_PRIVATE_KEY_BASE64

  if (!email || !keyBase64) {
    throw new Error(
      'Google Sheets 환경변수가 설정되지 않았습니다. GOOGLE_SERVICE_ACCOUNT_EMAIL과 GOOGLE_PRIVATE_KEY_BASE64를 확인하세요.'
    )
  }

  const privateKey = Buffer.from(keyBase64, 'base64').toString('utf-8')

  const jwtClient = new auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  sheetsClient = sheets({ version: 'v4', auth: jwtClient })
  return sheetsClient
}

export function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID
  if (!id) {
    throw new Error(
      'GOOGLE_SPREADSHEET_ID 환경변수가 설정되지 않았습니다.'
    )
  }
  return id
}

export async function getSpreadsheetInfo(): Promise<{ title: string; url: string }> {
  const client = getSheets()
  const spreadsheetId = getSpreadsheetId()

  const response = await withRetry(() =>
    client.spreadsheets.get({ spreadsheetId })
  )

  const title = response.data.properties?.title ?? '알 수 없음'
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`

  return { title, url }
}
