import type { InventoryItem, Category, ActionResult } from '@/types/inventory'
import { INVENTORY_RANGE, CATEGORIES_RANGE, SHEET_NAMES } from '@/lib/constants'
import { getSheets, getSpreadsheetId, withRetry } from './sheets'
import {
  rowToInventoryItem,
  inventoryItemToRow,
  rowToCategory,
  categoryToRow,
  generateNextSku,
  getTodayString,
} from './helpers'

// ── Inventory ────────────────────────────────────────────────────────────────

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const client = getSheets()
  const spreadsheetId = getSpreadsheetId()

  const response = await withRetry(() =>
    client.spreadsheets.values.get({ spreadsheetId, range: INVENTORY_RANGE })
  )

  const rows = response.data.values ?? []
  // rowIndex starts at 2 (row 1 is header)
  return rows.map((row, i) => rowToInventoryItem(row as string[], i + 2))
}

export async function addInventoryItem(
  item: Omit<InventoryItem, 'rowIndex' | 'sku' | 'lastUpdated'>
): Promise<ActionResult<InventoryItem>> {
  try {
    const client = getSheets()
    const spreadsheetId = getSpreadsheetId()

    // Fetch existing SKUs to generate the next one
    const existing = await getInventoryItems()
    const sku = generateNextSku(existing.map((i) => i.sku))
    const lastUpdated = getTodayString()

    const newItem: InventoryItem = {
      rowIndex: existing.length + 2,
      sku,
      lastUpdated,
      ...item,
    }

    await withRetry(() =>
      client.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAMES.INVENTORY}!A:H`,
        valueInputOption: 'RAW',
        requestBody: { values: [inventoryItemToRow(newItem)] },
      })
    )

    return { success: true, data: newItem }
  } catch (err) {
    console.error('addInventoryItem error:', err)
    return { success: false, error: '항목 추가에 실패했습니다.' }
  }
}

export async function updateInventoryItem(
  sku: string,
  updates: Partial<Omit<InventoryItem, 'rowIndex' | 'sku'>>
): Promise<ActionResult<void>> {
  try {
    const client = getSheets()
    const spreadsheetId = getSpreadsheetId()

    // SKU-based lookup: fetch fresh rows to find current row position
    const items = await getInventoryItems()
    const target = items.find((i) => i.sku === sku)
    if (!target) {
      return { success: false, error: `SKU '${sku}'를 찾을 수 없습니다.` }
    }

    const updated: InventoryItem = {
      ...target,
      ...updates,
      sku,
      lastUpdated: getTodayString(),
    }

    await withRetry(() =>
      client.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAMES.INVENTORY}!A${target.rowIndex}:H${target.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [inventoryItemToRow(updated)] },
      })
    )

    return { success: true, data: undefined }
  } catch (err) {
    console.error('updateInventoryItem error:', err)
    return { success: false, error: '항목 수정에 실패했습니다.' }
  }
}

export async function deleteInventoryItem(sku: string): Promise<ActionResult<void>> {
  try {
    const client = getSheets()
    const spreadsheetId = getSpreadsheetId()

    // SKU-based lookup: critical because deleteDimension shifts subsequent row indices
    const items = await getInventoryItems()
    const target = items.find((i) => i.sku === sku)
    if (!target) {
      return { success: false, error: `SKU '${sku}'를 찾을 수 없습니다.` }
    }

    // Get sheet ID for the Inventory tab
    const spreadsheet = await withRetry(() =>
      client.spreadsheets.get({ spreadsheetId })
    )
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SHEET_NAMES.INVENTORY
    )
    if (!sheet || sheet.properties?.sheetId == null) {
      return { success: false, error: 'Inventory 시트를 찾을 수 없습니다.' }
    }
    const sheetId = sheet.properties.sheetId

    await withRetry(() =>
      client.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: target.rowIndex - 1, // 0-based
                  endIndex: target.rowIndex,        // exclusive
                },
              },
            },
          ],
        },
      })
    )

    return { success: true, data: undefined }
  } catch (err) {
    console.error('deleteInventoryItem error:', err)
    return { success: false, error: '항목 삭제에 실패했습니다.' }
  }
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const client = getSheets()
  const spreadsheetId = getSpreadsheetId()

  const response = await withRetry(() =>
    client.spreadsheets.values.get({ spreadsheetId, range: CATEGORIES_RANGE })
  )

  const rows = response.data.values ?? []
  return rows.map((row, i) => rowToCategory(row as string[], i + 2))
}

export async function addCategory(
  cat: Omit<Category, 'rowIndex'>
): Promise<ActionResult<Category>> {
  try {
    const client = getSheets()
    const spreadsheetId = getSpreadsheetId()

    const existing = await getCategories()
    const duplicate = existing.find((c) => c.name === cat.name)
    if (duplicate) {
      return { success: false, error: `카테고리 '${cat.name}'이(가) 이미 존재합니다.` }
    }

    const newCat: Category = { rowIndex: existing.length + 2, ...cat }

    await withRetry(() =>
      client.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAMES.CATEGORIES}!A:C`,
        valueInputOption: 'RAW',
        requestBody: { values: [categoryToRow(newCat)] },
      })
    )

    return { success: true, data: newCat }
  } catch (err) {
    console.error('addCategory error:', err)
    return { success: false, error: '카테고리 추가에 실패했습니다.' }
  }
}

export async function updateCategory(
  name: string,
  updates: Partial<Omit<Category, 'rowIndex' | 'name'>>
): Promise<ActionResult<void>> {
  try {
    const client = getSheets()
    const spreadsheetId = getSpreadsheetId()

    // Name-based lookup
    const categories = await getCategories()
    const target = categories.find((c) => c.name === name)
    if (!target) {
      return { success: false, error: `카테고리 '${name}'을(를) 찾을 수 없습니다.` }
    }

    const updated: Category = { ...target, ...updates, name }

    await withRetry(() =>
      client.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAMES.CATEGORIES}!A${target.rowIndex}:C${target.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [categoryToRow(updated)] },
      })
    )

    return { success: true, data: undefined }
  } catch (err) {
    console.error('updateCategory error:', err)
    return { success: false, error: '카테고리 수정에 실패했습니다.' }
  }
}

export async function deleteCategory(name: string): Promise<ActionResult<void>> {
  try {
    const client = getSheets()
    const spreadsheetId = getSpreadsheetId()

    // Name-based lookup
    const categories = await getCategories()
    const target = categories.find((c) => c.name === name)
    if (!target) {
      return { success: false, error: `카테고리 '${name}'을(를) 찾을 수 없습니다.` }
    }

    // Get sheet ID for the Categories tab
    const spreadsheet = await withRetry(() =>
      client.spreadsheets.get({ spreadsheetId })
    )
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SHEET_NAMES.CATEGORIES
    )
    if (!sheet || sheet.properties?.sheetId == null) {
      return { success: false, error: 'Categories 시트를 찾을 수 없습니다.' }
    }
    const sheetId = sheet.properties.sheetId

    await withRetry(() =>
      client.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: target.rowIndex - 1,
                  endIndex: target.rowIndex,
                },
              },
            },
          ],
        },
      })
    )

    return { success: true, data: undefined }
  } catch (err) {
    console.error('deleteCategory error:', err)
    return { success: false, error: '카테고리 삭제에 실패했습니다.' }
  }
}

export async function getSpreadsheetMetadata(): Promise<ActionResult<{ title: string; url: string }>> {
  try {
    const client = getSheets()
    const spreadsheetId = getSpreadsheetId()

    const response = await withRetry(() =>
      client.spreadsheets.get({ spreadsheetId })
    )

    const title = response.data.properties?.title ?? '알 수 없음'
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`

    return { success: true, data: { title, url } }
  } catch (err) {
    console.error('getSpreadsheetMetadata error:', err)
    return { success: false, error: 'Google Sheets 연결에 실패했습니다.' }
  }
}
