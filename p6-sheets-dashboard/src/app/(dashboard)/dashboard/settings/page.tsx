import { getSpreadsheetInfo, getSpreadsheetId } from '@/lib/google/sheets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { refreshAllDashboard } from './actions'

export const dynamic = 'force-dynamic'

export const metadata = { title: '설정' }

async function SpreadsheetInfo() {
  try {
    const info = await getSpreadsheetInfo()
    const spreadsheetId = getSpreadsheetId()
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span>Google Sheets 연결됨</span>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-medium">스프레드시트 제목</span>
            <span className="font-mono">{info.title}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-medium">스프레드시트 ID</span>
            <span className="font-mono text-xs break-all">{spreadsheetId}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-medium">마지막 동기화</span>
            <span>{now}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            render={<a href={info.url} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Google Sheets에서 열기
          </Button>
          <form action={refreshAllDashboard}>
            <Button type="submit" variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </form>
        </div>
      </div>
    )
  } catch {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Google Sheets 연결 실패</span>
        </div>
        <p className="text-sm text-muted-foreground">
          환경변수를 확인하세요: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY_BASE64, GOOGLE_SPREADSHEET_ID
        </p>
        <form action={refreshAllDashboard}>
          <Button type="submit" variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </form>
      </div>
    )
  }
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">설정</h1>
        <p className="text-sm text-muted-foreground mt-1">Google Sheets 연결 정보 및 대시보드 설정</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google Sheets 연결</CardTitle>
          <CardDescription>현재 연결된 스프레드시트 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <SpreadsheetInfo />
        </CardContent>
      </Card>
    </div>
  )
}
