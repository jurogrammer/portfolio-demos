'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContactForm({ locale }: { locale: string }) {
  const isEn = locale === 'en'
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', company: '', message: '' })
      } else {
        setStatus('error')
        setErrorMsg(data.error || (isEn ? 'An error occurred.' : '오류가 발생했습니다.'))
      }
    } catch {
      setStatus('error')
      setErrorMsg(isEn ? 'Network error. Please try again.' : '네트워크 오류가 발생했습니다.')
    }
  }

  if (status === 'success') {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
        <p className="text-green-700 font-medium">
          {isEn ? 'Your message has been sent! We will contact you soon.' : '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>
          {isEn ? 'Send another message' : '다시 문의하기'}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{isEn ? 'Name' : '이름'} *</Label>
          <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isEn ? 'John Doe' : '홍길동'} required />
        </div>
        <div>
          <Label htmlFor="email">{isEn ? 'Email' : '이메일'} *</Label>
          <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@email.com" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">{isEn ? 'Phone' : '전화번호'}</Label>
          <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={isEn ? 'Optional' : '선택사항'} />
        </div>
        <div>
          <Label htmlFor="company">{isEn ? 'Company' : '회사명'}</Label>
          <Input id="company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder={isEn ? 'Optional' : '선택사항'} />
        </div>
      </div>
      <div>
        <Label htmlFor="message">{isEn ? 'Message' : '문의 내용'} *</Label>
        <Textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder={isEn ? 'Tell us about your project...' : '프로젝트에 대해 설명해 주세요...'}
          required
        />
      </div>
      {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <Button type="submit" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? (isEn ? 'Sending...' : '전송 중...') : (isEn ? 'Send Message' : '문의 보내기')}
      </Button>
    </form>
  )
}
