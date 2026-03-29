'use client'

import { useState, useOptimistic, useCallback } from 'react'
import type { InventoryItem, Category } from '@/types/inventory'
import InventoryTable from '@/components/inventory/InventoryTable'
import InventoryForm from '@/components/inventory/InventoryForm'
import { useLocale } from '@/lib/i18n'

interface InventoryPageClientProps {
  initialItems: InventoryItem[]
  categories: Category[]
}

export default function InventoryPageClient({
  initialItems,
  categories,
}: InventoryPageClientProps) {
  const { t } = useLocale()
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
          <h1 className="text-2xl font-bold">{t.inventory.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.inventory.subtitle}
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
