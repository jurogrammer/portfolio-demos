'use client'

import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/i18n'

interface SettingsStatusProps {
  connected: boolean
  info?: {
    title: string
    url: string
    spreadsheetId: string
    lastSync: string
  }
  refreshAction: () => Promise<void>
}

export default function SettingsStatus({ connected, info, refreshAction }: SettingsStatusProps) {
  const { t } = useLocale()

  if (!connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{t.settings.connectionFailed}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t.settings.connectionFailedDesc}
        </p>
        <form action={refreshAction}>
          <Button type="submit" variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.settings.retry}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        <span>{t.settings.connected}</span>
      </div>

      <div className="grid gap-3 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium">{t.settings.spreadsheetTitle}</span>
          <span className="font-mono">{info!.title}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium">{t.settings.spreadsheetId}</span>
          <span className="font-mono text-xs break-all">{info!.spreadsheetId}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium">{t.settings.lastSync}</span>
          <span>{info!.lastSync}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          render={<a href={info!.url} target="_blank" rel="noopener noreferrer" />}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {t.settings.openInSheets}
        </Button>
        <form action={refreshAction}>
          <Button type="submit" variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.settings.refresh}
          </Button>
        </form>
      </div>
    </div>
  )
}
