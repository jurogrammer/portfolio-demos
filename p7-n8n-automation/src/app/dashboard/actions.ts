'use server'
import { getRecentInquiries, getDashboardStats } from '@/lib/google/inquiries'
import { Inquiry, DashboardStats, ActionResult } from '@/types/inquiry'

export async function fetchDashboardData(): Promise<ActionResult<{ stats: DashboardStats; inquiries: Inquiry[] }>> {
  try {
    const [stats, inquiries] = await Promise.all([getDashboardStats(), getRecentInquiries(20)])
    return { success: true, data: { stats, inquiries } }
  } catch {
    return { success: false, error: '데이터를 불러오는데 실패했습니다.' }
  }
}
