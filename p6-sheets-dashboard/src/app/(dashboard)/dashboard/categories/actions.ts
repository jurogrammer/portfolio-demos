'use server'

import { revalidatePath } from 'next/cache'
import type { Category, ActionResult } from '@/types/inventory'
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getInventoryItems,
} from '@/lib/google/inventory'

export async function fetchCategories(): Promise<Category[]> {
  return getCategories()
}

export async function createCategory(
  formData: FormData
): Promise<ActionResult<Category>> {
  const name = (formData.get('name') as string)?.trim()
  const description = ((formData.get('description') as string) ?? '').trim()
  const thresholdStr = formData.get('lowStockThreshold') as string

  if (!name) {
    return { success: false, error: '카테고리명은 필수 항목입니다.' }
  }
  const lowStockThreshold = parseInt(thresholdStr, 10)
  if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
    return { success: false, error: '재고부족 기준은 0 이상의 정수여야 합니다.' }
  }

  const result = await addCategory({ name, description, lowStockThreshold })

  if (result.success) {
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
  }

  return result
}

export async function editCategory(
  formData: FormData
): Promise<ActionResult<void>> {
  const name = (formData.get('name') as string)?.trim()
  const description = ((formData.get('description') as string) ?? '').trim()
  const thresholdStr = formData.get('lowStockThreshold') as string

  if (!name) {
    return { success: false, error: '카테고리명은 필수 항목입니다.' }
  }
  const lowStockThreshold = parseInt(thresholdStr, 10)
  if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
    return { success: false, error: '재고부족 기준은 0 이상의 정수여야 합니다.' }
  }

  const result = await updateCategory(name, { description, lowStockThreshold })

  if (result.success) {
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
  }

  return result
}

export async function removeCategory(name: string): Promise<ActionResult<void>> {
  if (!name?.trim()) {
    return { success: false, error: '카테고리명이 누락되었습니다.' }
  }

  // Referential integrity check: block if any inventory items use this category
  const items = await getInventoryItems()
  const usedBy = items.filter((item) => item.category === name)
  if (usedBy.length > 0) {
    return {
      success: false,
      error: `이 카테고리에 ${usedBy.length}개의 항목이 있습니다. 먼저 항목을 다른 카테고리로 이동하세요.`,
    }
  }

  const result = await deleteCategory(name.trim())

  if (result.success) {
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard')
  }

  return result
}
