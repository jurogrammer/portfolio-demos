import { NextRequest, NextResponse } from 'next/server'
import { callN8nWebhook } from '@/lib/n8n/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await callN8nWebhook('/webhook/inquiry', body)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })
  }
}
