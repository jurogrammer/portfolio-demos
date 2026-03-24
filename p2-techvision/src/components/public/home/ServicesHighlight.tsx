import Link from 'next/link'
import { Code2, Smartphone, BarChart3, Cloud } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const services = [
  {
    icon: Code2,
    title: { ko: '웹 개발', en: 'Web Development' },
    desc: { ko: 'React/Next.js 기반 고성능 웹 애플리케이션 개발', en: 'High-performance web applications with React/Next.js' },
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Smartphone,
    title: { ko: '모바일 앱', en: 'Mobile App' },
    desc: { ko: 'iOS/Android 크로스플랫폼 모바일 앱 개발', en: 'Cross-platform mobile app development for iOS/Android' },
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: BarChart3,
    title: { ko: '디지털 컨설팅', en: 'Digital Consulting' },
    desc: { ko: 'IT 전략 수립 및 디지털 전환 로드맵 제시', en: 'IT strategy and digital transformation roadmap' },
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Cloud,
    title: { ko: '클라우드 솔루션', en: 'Cloud Solutions' },
    desc: { ko: 'AWS/GCP 기반 클라우드 인프라 구축 및 최적화', en: 'AWS/GCP cloud infrastructure and optimization' },
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
]

export default function ServicesHighlight({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{locale === 'en' ? 'Core Services' : '핵심 서비스'}</h2>
          <p className="text-gray-600">{locale === 'en' ? 'Professional IT solutions for business growth' : '비즈니스 성장을 위한 전문 IT 솔루션'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(svc => (
            <Card key={svc.title.ko} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${svc.bg} flex items-center justify-center mb-4`}>
                  <svc.icon className={`h-6 w-6 ${svc.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{locale === 'en' ? svc.title.en : svc.title.ko}</h3>
                <p className="text-sm text-gray-500 mb-4">{locale === 'en' ? svc.desc.en : svc.desc.ko}</p>
                <Link href={`/${locale}/services`} className={`text-sm font-medium ${svc.color} hover:underline`}>
                  {locale === 'en' ? 'Learn more →' : '자세히 보기 →'}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
