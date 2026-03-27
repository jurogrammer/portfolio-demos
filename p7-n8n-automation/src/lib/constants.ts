import { InquiryStatus, InquiryCategory } from '@/types/inquiry'

export const CATEGORIES: InquiryCategory[] = ['기술문의', '견적요청', '일반문의']

export const STATUS_STEPS: InquiryStatus[] = ['접수됨', '분류완료', '처리중', '완료']

export const STATUS_COLORS: Record<InquiryStatus, string> = {
  '접수됨': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  '분류완료': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  '처리중': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  '완료': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  '에스컬레이션': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export const URGENCY_COLORS: Record<string, string> = {
  '높음': 'text-red-600 dark:text-red-400',
  '보통': 'text-yellow-600 dark:text-yellow-400',
  '낮음': 'text-green-600 dark:text-green-400',
}
