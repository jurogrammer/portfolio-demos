export interface InventoryItem {
  rowIndex: number       // Google Sheets 행 번호 (2부터 시작, 내부 전용)
  sku: string            // INV-001 형식
  name: string           // 상품명
  category: string       // Categories 탭 참조
  quantity: number       // 현재 수량
  unitPrice: number      // 원(₩) 단위
  supplier: string       // 공급업체
  lastUpdated: string    // YYYY-MM-DD
  notes: string          // 비고
}

export interface Category {
  rowIndex: number
  name: string
  description: string
  lowStockThreshold: number
}

export interface InventoryFilters {
  search: string
  category: string       // '' = 전체
  lowStockOnly: boolean
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
