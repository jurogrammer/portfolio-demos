'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { InventoryItem } from '@/types/inventory'
import { useLocale } from '@/lib/i18n'

export default function RecentActivity({ items }: { items: InventoryItem[] }) {
  const { t } = useLocale()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.dashboard.recentActivity}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t.dashboard.noItems}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.inventory.sku}</TableHead>
                  <TableHead>{t.inventory.name}</TableHead>
                  <TableHead className="text-right">{t.inventory.quantity}</TableHead>
                  <TableHead>{t.inventory.lastUpdated}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell>
                      <Link
                        href="/dashboard/inventory"
                        className="hover:underline text-primary"
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity.toLocaleString('ko-KR')}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
