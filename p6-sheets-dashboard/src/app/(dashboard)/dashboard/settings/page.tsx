import { getSpreadsheetInfo, getSpreadsheetId } from '@/lib/google/sheets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { refreshAllDashboard } from './actions'
import SettingsHeading from '@/components/settings/SettingsHeading'
import SettingsStatus from '@/components/settings/SettingsStatus'

export const dynamic = 'force-dynamic'

export const metadata = { title: '설정 | Settings' }

async function SpreadsheetInfoContent() {
  try {
    const info = await getSpreadsheetInfo()
    const spreadsheetId = getSpreadsheetId()
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

    return (
      <SettingsStatus
        connected
        info={{ title: info.title, url: info.url, spreadsheetId, lastSync: now }}
        refreshAction={refreshAllDashboard}
      />
    )
  } catch {
    return (
      <SettingsStatus
        connected={false}
        refreshAction={refreshAllDashboard}
      />
    )
  }
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <SettingsHeading />

      <Card>
        <SettingsCardHeader />
        <CardContent>
          <SpreadsheetInfoContent />
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsCardHeader() {
  return (
    <CardHeader>
      <CardTitle className="text-base">Google Sheets</CardTitle>
      <CardDescription>Spreadsheet connection info</CardDescription>
    </CardHeader>
  )
}
