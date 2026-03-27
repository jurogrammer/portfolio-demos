import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CTABanner({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {locale === 'en' ? 'Need a Site Like This?' : '이런 사이트가 필요하신가요?'}
        </h2>
        <p className="text-white/90 text-lg mb-8">
          {locale === 'en'
            ? 'This is a portfolio demo. If you need a corporate site with admin CMS and multilingual support, get in touch.'
            : '이 사이트는 포트폴리오 데모입니다. 어드민 CMS·다국어 지원이 포함된 기업 홈페이지가 필요하시면 문의해주세요.'}
        </p>
        <Button size="lg" variant="secondary" render={<Link href={`/${locale}/contact`} />}>
          {locale === 'en' ? 'Contact Developer' : '개발 문의하기'}
        </Button>
      </div>
    </section>
  )
}
