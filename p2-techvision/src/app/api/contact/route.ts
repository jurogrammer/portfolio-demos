import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, company, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: '필수 필드를 입력해주세요.' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { error: dbError } = await supabase.from('inquiries').insert({ name, email, phone, company, message })
    if (dbError) {
      console.error('DB insert error:', dbError)
      // Don't fail the request for DB errors in demo mode
    }

    // Send email notification (optional)
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && resendKey !== 'placeholder-resend-key') {
      try {
        const resend = new Resend(resendKey)
        await resend.emails.send({
          from: 'TechVision <noreply@techvision.demo>',
          to: process.env.CONTACT_EMAIL || 'admin@techvision.demo',
          subject: `[문의] ${name} (${company || '개인'})`,
          html: `<h2>새로운 문의가 접수되었습니다</h2>
<p><strong>이름:</strong> ${name}</p>
<p><strong>이메일:</strong> ${email}</p>
${phone ? `<p><strong>전화번호:</strong> ${phone}</p>` : ''}
${company ? `<p><strong>회사명:</strong> ${company}</p>` : ''}
<p><strong>문의내용:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>`
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
