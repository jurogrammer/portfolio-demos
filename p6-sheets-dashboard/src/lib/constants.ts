// Google Sheets 탭 이름
export const SHEET_NAMES = {
  INVENTORY: 'Inventory',
  CATEGORIES: 'Categories',
} as const

// Inventory 시트 컬럼 매핑 (A=0, B=1, ...)
export const INVENTORY_COLUMNS = {
  SKU: 0,         // A: INV-001 형식
  NAME: 1,        // B: 상품명
  CATEGORY: 2,    // C: 카테고리
  QUANTITY: 3,    // D: 수량
  UNIT_PRICE: 4,  // E: 단가 (₩)
  SUPPLIER: 5,    // F: 공급업체
  LAST_UPDATED: 6, // G: 최종수정일 (YYYY-MM-DD)
  NOTES: 7,       // H: 비고
} as const

// Categories 시트 컬럼 매핑
export const CATEGORY_COLUMNS = {
  NAME: 0,              // A: 카테고리명
  DESCRIPTION: 1,       // B: 설명
  LOW_STOCK_THRESHOLD: 2, // C: 재고부족 기준수량
} as const

// 페이지네이션
export const PAGE_SIZE = 20

// SKU 자동 생성 설정
export const SKU_PREFIX = 'INV-'
export const SKU_PADDING = 3  // INV-001, INV-002, ...

// Sheets API 범위
export const INVENTORY_RANGE = `${SHEET_NAMES.INVENTORY}!A2:H`
export const CATEGORIES_RANGE = `${SHEET_NAMES.CATEGORIES}!A2:C`
