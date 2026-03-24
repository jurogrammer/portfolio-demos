import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CTABanner({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {locale === 'en' ? 'Ready to Start Your Project?' : '프로젝트를 시작할 준비가 되셨나요?'}
        </h2>
        <p className="text-white/90 text-lg mb-8">
          {locale === 'en' ? 'Contact our experts today for a free consultation' : '지금 바로 전문가와 무료 상담을 받아보세요'}
        </p>
        <Button size="lg" variant="secondary" render={<Link href={`/${locale}/contact`} />}>
          {locale === 'en' ? 'Get Free Consultation' : '무료 상담 신청'}
        </Button>
      </div>
    </section>
  )
}
