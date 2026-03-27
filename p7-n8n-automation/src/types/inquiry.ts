export type InquiryCategory = '기술문의' | '견적요청' | '일반문의'
export type InquiryUrgency = '높음' | '보통' | '낮음'
export type InquiryStatus = '접수됨' | '분류완료' | '처리중' | '완료' | '에스컬레이션'

export interface Inquiry {
  rowIndex: number
  ticketId: string
  name: string
  email: string
  categoryInput: InquiryCategory
  message: string
  aiCategory: InquiryCategory
  aiUrgency: InquiryUrgency
  aiSummary: string
  status: InquiryStatus
  createdAt: string
  completedAt: string | null
  notes: string
}

export interface InquiryFormData {
  name: string
  email: string
  category: InquiryCategory
  message: string
}

export interface DashboardStats {
  todayCount: number
  completedCount: number
  pendingCount: number
  avgProcessingHours: number
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
