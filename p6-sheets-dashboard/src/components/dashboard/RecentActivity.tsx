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

export default function RecentActivity({ items }: { items: InventoryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">최근 변경 항목</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">항목이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                  <TableHead>최종수정일</TableHead>
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
