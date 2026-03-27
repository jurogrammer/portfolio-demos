'use server'
import { getInquiryByTicketId } from '@/lib/google/inquiries'
import { Inquiry, ActionResult } from '@/types/inquiry'

export async function getInquiryStatus(ticketId: string): Promise<ActionResult<Inquiry>> {
  try {
    const inquiry = await getInquiryByTicketId(ticketId)
    if (!inquiry) return { success: false, error: '해당 문의를 찾을 수 없습니다.' }
    return { success: true, data: inquiry }
  } catch {
    return { success: false, error: '상태 조회에 실패했습니다.' }
  }
}
