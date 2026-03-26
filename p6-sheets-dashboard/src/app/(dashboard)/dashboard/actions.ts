'use server'

import { revalidatePath } from 'next/cache'
import { getInventoryItems, getCategories } from '@/lib/google/inventory'
import type { InventoryItem } from '@/types/inventory'

export interface DashboardStats {
  totalItems: number
  lowStockCount: number
  totalValue: number
  categoryCount: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [items, categories] = await Promise.all([
    getInventoryItems(),
    getCategories(),
  ])

  const categoryMap = new Map(categories.map((c) => [c.name, c.lowStockThreshold]))

  const lowStockCount = items.filter((item) => {
    const threshold = categoryMap.get(item.category) ?? 0
    return item.quantity < threshold
  }).length

  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  return {
    totalItems: items.length,
    lowStockCount,
    totalValue,
    categoryCount: categories.length,
  }
}

export async function getRecentChanges(): Promise<InventoryItem[]> {
  const items = await getInventoryItems()

  return [...items]
    .sort((a, b) => {
      // lastUpdated is YYYY-MM-DD — lexicographic sort works
      if (b.lastUpdated > a.lastUpdated) return 1
      if (b.lastUpdated < a.lastUpdated) return -1
      return 0
    })
    .slice(0, 5)
}

export async function refreshDashboard(): Promise<void> {
  revalidatePath('/dashboard')
}
