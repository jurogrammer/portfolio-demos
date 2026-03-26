'use server'

import { revalidatePath } from 'next/cache'
import type { InventoryItem, Category, ActionResult } from '@/types/inventory'
import {
  getInventoryItems,
  getCategories,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/lib/google/inventory'

export async function fetchInventory(): Promise<{
  items: InventoryItem[]
  categories: Category[]
}> {
  const [items, categories] = await Promise.all([
    getInventoryItems(),
    getCategories(),
  ])
  return { items, categories }
}

export async function createItem(
  formData: FormData
): Promise<ActionResult<InventoryItem>> {
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantityStr = formData.get('quantity') as string
  const unitPriceStr = formData.get('unitPrice') as string
  const supplier = (formData.get('supplier') as string) ?? ''
  const notes = (formData.get('notes') as string) ?? ''

  // Validation
  if (!name?.trim()) {
    return { success: false, error: '상품명은 필수 항목입니다.' }
  }
  if (!category?.trim()) {
    return { success: false, error: '카테고리는 필수 항목입니다.' }
  }
  const quantity = parseInt(quantityStr, 10)
  if (isNaN(quantity) || quantity < 0) {
    return { success: false, error: '수량은 0 이상의 정수여야 합니다.' }
  }
  const unitPrice = parseInt(unitPriceStr, 10)
  if (isNaN(unitPrice) || unitPrice < 1) {
    return { success: false, error: '단가는 1원 이상이어야 합니다.' }
  }

  const result = await addInventoryItem({
    name: name.trim(),
    category: category.trim(),
    quantity,
    unitPrice,
    supplier: supplier.trim(),
    notes: notes.trim(),
  })

  if (result.success) {
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
  }

  return result
}

export async function editItem(
  formData: FormData
): Promise<ActionResult<void>> {
  const sku = formData.get('sku') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantityStr = formData.get('quantity') as string
  const unitPriceStr = formData.get('unitPrice') as string
  const supplier = (formData.get('supplier') as string) ?? ''
  const notes = (formData.get('notes') as string) ?? ''

  if (!sku?.trim()) {
    return { success: false, error: 'SKU가 누락되었습니다.' }
  }
  if (!name?.trim()) {
    return { success: false, error: '상품명은 필수 항목입니다.' }
  }
  if (!category?.trim()) {
    return { success: false, error: '카테고리는 필수 항목입니다.' }
  }
  const quantity = parseInt(quantityStr, 10)
  if (isNaN(quantity) || quantity < 0) {
    return { success: false, error: '수량은 0 이상의 정수여야 합니다.' }
  }
  const unitPrice = parseInt(unitPriceStr, 10)
  if (isNaN(unitPrice) || unitPrice < 1) {
    return { success: false, error: '단가는 1원 이상이어야 합니다.' }
  }

  const result = await updateInventoryItem(sku.trim(), {
    name: name.trim(),
    category: category.trim(),
    quantity,
    unitPrice,
    supplier: supplier.trim(),
    notes: notes.trim(),
  })

  if (result.success) {
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
  }

  return result
}

export async function removeItem(sku: string): Promise<ActionResult<void>> {
  if (!sku?.trim()) {
    return { success: false, error: 'SKU가 누락되었습니다.' }
  }

  const result = await deleteInventoryItem(sku.trim())

  if (result.success) {
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
  }

  return result
}
