import { InquiryForm } from '@/components/inquiry/InquiryForm'

export const metadata = { title: '문의 접수 | n8n 자동화 시스템' }

export default function InquiryPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <InquiryForm />
    </div>
  )
}
