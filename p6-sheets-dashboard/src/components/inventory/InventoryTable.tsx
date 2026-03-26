'use client'

import { useState, useMemo, useOptimistic, useCallback } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PAGE_SIZE } from '@/lib/constants'
import type { InventoryItem, Category, InventoryFilters } from '@/types/inventory'
import InventoryFiltersBar from './InventoryFilters'
import InventoryActions from './InventoryActions'
import LowStockAlert from './LowStockAlert'

const krw = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })

type SortKey = 'sku' | 'name' | 'category' | 'quantity' | 'unitPrice' | 'lastUpdated'
type SortDir = 'asc' | 'desc'

interface InventoryTableProps {
  initialItems: InventoryItem[]
  categories: Category[]
  onAdd: () => void
  onEdit: (item: InventoryItem) => void
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 ml-1 inline opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 ml-1 inline" />
    : <ChevronDown className="h-3 w-3 ml-1 inline" />
}

export default function InventoryTable({
  initialItems,
  categories,
  onAdd,
  onEdit,
}: InventoryTableProps) {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: '',
    lowStockOnly: false,
  })
  const [sortKey, setSortKey] = useState<SortKey>('sku')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.name, c.lowStockThreshold])),
    [categories]
  )

  const isLowStock = useCallback(
    (item: InventoryItem) => {
      const threshold = categoryMap.get(item.category) ?? 0
      return item.quantity < threshold
    },
    [categoryMap]
  )

  // useOptimistic for ADD — optimistically append new items
  const [optimisticItems, addOptimistic] = useOptimistic(
    initialItems,
    (state: InventoryItem[], newItem: InventoryItem) => [...state, newItem]
  )

  // Track deleted SKUs client-side (for optimistic deletes via InventoryActions)
  const [deletedSkus, setDeletedSkus] = useState<Set<string>>(new Set())

  const visibleItems = useMemo(() => {
    return optimisticItems.filter((item) => !deletedSkus.has(item.sku))
  }, [optimisticItems, deletedSkus])

  const lowStockCount = useMemo(
    () => visibleItems.filter(isLowStock).length,
    [visibleItems, isLowStock]
  )

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase()
    return visibleItems.filter((item) => {
      if (q && !item.sku.toLowerCase().includes(q) && !item.name.toLowerCase().includes(q)) {
        return false
      }
      if (filters.category && item.category !== filters.category) return false
      if (filters.lowStockOnly && !isLowStock(item)) return false
      return true
    })
  }, [visibleItems, filters, isLowStock])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey]
      let bv: string | number = b[sortKey]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleFiltersChange(f: InventoryFilters) {
    setFilters(f)
    setPage(1)
  }

  function handleDeleted(sku: string) {
    setDeletedSkus((prev) => new Set([...prev, sku]))
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: '상품명' },
    { key: 'category', label: '카테고리' },
    { key: 'quantity', label: '수량' },
    { key: 'unitPrice', label: '단가' },
    { key: 'lastUpdated', label: '최종수정일' },
  ]

  return (
    <div className="space-y-4">
      <LowStockAlert count={lowStockCount} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <InventoryFiltersBar
          filters={filters}
          categories={categories}
          onChange={handleFiltersChange}
        />
        <Button onClick={onAdd} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          항목 추가
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(({ key, label }) => (
                <TableHead
                  key={key}
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort(key)}
                >
                  {label}
                  <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
              ))}
              <TableHead className="text-right">공급업체</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  표시할 항목이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item) => {
                const lowStock = isLowStock(item)
                return (
                  <TableRow
                    key={item.sku}
                    className={lowStock ? 'bg-destructive/5' : undefined}
                  >
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell className="font-medium">
                      {item.name}
                      {lowStock && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          재고부족
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity.toLocaleString('ko-KR')}</TableCell>
                    <TableCell className="whitespace-nowrap">{krw.format(item.unitPrice)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.lastUpdated}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {item.supplier || '-'}
                    </TableCell>
                    <TableCell>
                      <InventoryActions
                        item={item}
                        onEdit={onEdit}
                        onDeleted={handleDeleted}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {sorted.length}개 중 {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, sorted.length)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Button>
            <span className="px-2">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export the addOptimistic dispatcher so the parent page can call it
export type { InventoryTableProps }
