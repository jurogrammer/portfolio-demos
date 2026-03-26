'use client'

import { useState, useOptimistic, useCallback } from 'react'
import type { InventoryItem, Category } from '@/types/inventory'
import InventoryTable from '@/components/inventory/InventoryTable'
import InventoryForm from '@/components/inventory/InventoryForm'

interface InventoryPageClientProps {
  initialItems: InventoryItem[]
  categories: Category[]
}

export default function InventoryPageClient({
  initialItems,
  categories,
}: InventoryPageClientProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<InventoryItem | undefined>()

  // useOptimistic for ADD — instantly appends to list before server round-trip
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    initialItems,
    (state: InventoryItem[], newItem: InventoryItem) => [...state, newItem]
  )

  const handleAdd = useCallback(() => {
    setEditTarget(undefined)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((item: InventoryItem) => {
    setEditTarget(item)
    setFormOpen(true)
  }, [])

  const handleCreated = useCallback(
    (item: InventoryItem) => {
      addOptimisticItem(item)
    },
    [addOptimisticItem]
  )

  return (
    <>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">재고관리</h1>
          <p className="text-muted-foreground text-sm mt-1">
            전체 재고 목록을 조회하고 관리합니다.
          </p>
        </div>

        <InventoryTable
          initialItems={optimisticItems}
          categories={categories}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      </div>

      <InventoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categories}
        initialData={editTarget}
        onCreated={handleCreated}
      />
    </>
  )
}
