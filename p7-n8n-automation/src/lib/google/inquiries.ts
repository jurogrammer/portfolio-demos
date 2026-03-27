import { getSheetsClient, getSpreadsheetId } from './sheets'
import { Inquiry, InquiryCategory, InquiryUrgency, InquiryStatus, DashboardStats } from '@/types/inquiry'

// Columns: A=ticketId, B=name, C=email, D=categoryInput, E=message,
//          F=aiCategory, G=aiUrgency, H=aiSummary, I=status, J=createdAt, K=completedAt, L=notes

function parseRow(row: string[], index: number): Inquiry {
  return {
    rowIndex: index,
    ticketId: row[0] ?? '',
    name: row[1] ?? '',
    email: row[2] ?? '',
    categoryInput: (row[3] ?? '일반문의') as InquiryCategory,
    message: row[4] ?? '',
    aiCategory: (row[5] ?? '일반문의') as InquiryCategory,
    aiUrgency: (row[6] ?? '보통') as InquiryUrgency,
    aiSummary: row[7] ?? '',
    status: (row[8] ?? '접수됨') as InquiryStatus,
    createdAt: row[9] ?? '',
    completedAt: row[10] || null,
    notes: row[11] ?? '',
  }
}

async function getAllRows(): Promise<Inquiry[]> {
  const sheets = getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Inquiries!A2:L',
  })

  const rows = response.data.values ?? []
  return rows.map((row, index) => parseRow(row as string[], index + 2))
}

export async function getInquiryByTicketId(ticketId: string): Promise<Inquiry | null> {
  const rows = await getAllRows()
  return rows.find((inquiry) => inquiry.ticketId === ticketId) ?? null
}

export async function getRecentInquiries(limit: number = 20): Promise<Inquiry[]> {
  const rows = await getAllRows()
  return rows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await getAllRows()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const todayCount = rows.filter((r) => r.createdAt.startsWith(todayStr)).length
  const completedCount = rows.filter((r) => r.status === '완료').length
  const pendingCount = rows.filter((r) =>
    ['접수됨', '분류완료', '처리중'].includes(r.status)
  ).length

  const completedWithTimes = rows.filter(
    (r) => r.status === '완료' && r.completedAt && r.createdAt
  )

  let avgProcessingHours = 0
  if (completedWithTimes.length > 0) {
    const totalHours = completedWithTimes.reduce((sum, r) => {
      const start = new Date(r.createdAt).getTime()
      const end = new Date(r.completedAt!).getTime()
      return sum + (end - start) / (1000 * 60 * 60)
    }, 0)
    avgProcessingHours = Math.round((totalHours / completedWithTimes.length) * 10) / 10
  }

  return { todayCount, completedCount, pendingCount, avgProcessingHours }
}
