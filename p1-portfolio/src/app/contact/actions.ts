'use server';
import { Resend } from 'resend';

interface ContactFormData { name: string; email: string; company?: string; message: string; }
interface ActionResult { success: boolean; error?: string; }

export async function sendContactEmail(data: ContactFormData): Promise<ActionResult> {
  if (!data.name?.trim()) return { success: false, error: '이름을 입력해주세요.' };
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { success: false, error: '올바른 이메일 주소를 입력해주세요.' };
  if (!data.message?.trim()) return { success: false, error: '메시지를 입력해주세요.' };

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;
  if (!apiKey || !contactEmail) {
    console.warn('RESEND_API_KEY or CONTACT_EMAIL not configured');
    return { success: true };
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: contactEmail,
      subject: `[포트폴리오 문의] ${data.name}님으로부터`,
      html: `<h2>새로운 문의</h2><p><strong>이름:</strong> ${data.name}</p><p><strong>이메일:</strong> ${data.email}</p>${data.company ? `<p><strong>회사:</strong> ${data.company}</p>` : ''}<p><strong>메시지:</strong></p><p>${data.message.replace(/\n/g, '<br>')}</p>`,
    });
    return { success: true };
  } catch (err) {
    console.error('Resend error:', err);
    return { success: false, error: '전송 중 오류가 발생했습니다.' };
  }
}
