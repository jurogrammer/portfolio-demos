import type { InventoryItem, Category } from '@/types/inventory'
import { INVENTORY_COLUMNS, CATEGORY_COLUMNS, SKU_PREFIX, SKU_PADDING } from '@/lib/constants'

export function rowToInventoryItem(row: string[], rowIndex: number): InventoryItem {
  return {
    rowIndex,
    sku: row[INVENTORY_COLUMNS.SKU] ?? '',
    name: row[INVENTORY_COLUMNS.NAME] ?? '',
    category: row[INVENTORY_COLUMNS.CATEGORY] ?? '',
    quantity: Number(row[INVENTORY_COLUMNS.QUANTITY] ?? 0),
    unitPrice: Number(row[INVENTORY_COLUMNS.UNIT_PRICE] ?? 0),
    supplier: row[INVENTORY_COLUMNS.SUPPLIER] ?? '',
    lastUpdated: row[INVENTORY_COLUMNS.LAST_UPDATED] ?? '',
    notes: row[INVENTORY_COLUMNS.NOTES] ?? '',
  }
}

export function inventoryItemToRow(item: Partial<InventoryItem>): string[] {
  return [
    item.sku ?? '',
    item.name ?? '',
    item.category ?? '',
    String(item.quantity ?? 0),
    String(item.unitPrice ?? 0),
    item.supplier ?? '',
    item.lastUpdated ?? '',
    item.notes ?? '',
  ]
}

export function rowToCategory(row: string[], rowIndex: number): Category {
  return {
    rowIndex,
    name: row[CATEGORY_COLUMNS.NAME] ?? '',
    description: row[CATEGORY_COLUMNS.DESCRIPTION] ?? '',
    lowStockThreshold: Number(row[CATEGORY_COLUMNS.LOW_STOCK_THRESHOLD] ?? 0),
  }
}

export function categoryToRow(cat: Partial<Category>): string[] {
  return [
    cat.name ?? '',
    cat.description ?? '',
    String(cat.lowStockThreshold ?? 0),
  ]
}

export function generateNextSku(existingSkus: string[]): string {
  const nums = existingSkus
    .filter((sku) => sku.startsWith(SKU_PREFIX))
    .map((sku) => parseInt(sku.slice(SKU_PREFIX.length), 10))
    .filter((n) => !isNaN(n))

  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${SKU_PREFIX}${String(next).padStart(SKU_PADDING, '0')}`
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}
