'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLocale } from '@/lib/i18n'

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLocale()

  useEffect(() => {
    console.error('Inventory error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h2 className="text-lg font-semibold">{t.error.inventoryLoadFailed}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t.error.inventoryFetchFailed}
            </p>
          </div>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t.error.retry}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
