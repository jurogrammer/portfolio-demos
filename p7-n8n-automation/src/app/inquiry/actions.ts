'use server'

import { InquiryFormData, ActionResult } from '@/types/inquiry'

export async function submitInquiry(formData: InquiryFormData): Promise<ActionResult<{ ticketId: string }>> {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      return { success: false, error: '서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' }
    }

    const response = await fetch(`${webhookUrl}/webhook/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      return { success: false, error: '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.' }
    }

    const data = await response.json()
    return { success: true, data: { ticketId: data.ticketId } }
  } catch {
    return { success: false, error: '서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' }
  }
}
