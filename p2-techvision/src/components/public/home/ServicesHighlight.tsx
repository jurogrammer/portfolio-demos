import Link from 'next/link'
import { Code2, Smartphone, BarChart3, Cloud } from 'lucide-react'

const services = [
  {
    icon: Code2,
    title: { ko: '웹 개발', en: 'Web Development' },
    desc: { ko: 'React/Next.js 기반 고성능 웹 애플리케이션 개발', en: 'High-performance web applications with React/Next.js' },
  },
  {
    icon: Smartphone,
    title: { ko: '모바일 앱', en: 'Mobile App' },
    desc: { ko: 'iOS/Android 크로스플랫폼 모바일 앱 개발', en: 'Cross-platform mobile app development for iOS/Android' },
  },
  {
    icon: BarChart3,
    title: { ko: '디지털 컨설팅', en: 'Digital Consulting' },
    desc: { ko: 'IT 전략 수립 및 디지털 전환 로드맵 제시', en: 'IT strategy and digital transformation roadmap' },
  },
  {
    icon: Cloud,
    title: { ko: '클라우드 솔루션', en: 'Cloud Solutions' },
    desc: { ko: 'AWS/GCP 기반 클라우드 인프라 구축 및 최적화', en: 'AWS/GCP cloud infrastructure and optimization' },
  },
]

export default function ServicesHighlight({ locale }: { locale: string }) {
  return (
    <section className="py-24 bg-white">
      <div className="px-8 lg:px-16">
        <div className="mb-14">
          <h2 className="font-serif text-[40px] lg:text-[55px] font-medium text-[#111111] mb-3">
            {locale === 'en' ? 'Core Services' : '핵심 서비스'}
          </h2>
          <p className="text-[#666666] text-[18px]">
            {locale === 'en' ? 'Professional IT solutions for business growth' : '비즈니스 성장을 위한 전문 IT 솔루션'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-[#d4d4d4]">
          {services.map((svc, i) => (
            <div
              key={svc.title.ko}
              className="py-10 pr-8 border-b border-[#d4d4d4] lg:border-b-0 lg:border-r last:border-r-0 lg:pl-8 first:lg:pl-0"
            >
              <div className="w-12 h-12 rounded-full bg-[#00194a] flex items-center justify-center mb-6">
                <svc.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[#111111] text-[20px] mb-3">
                {locale === 'en' ? svc.title.en : svc.title.ko}
              </h3>
              <p className="text-[15px] text-[#666666] leading-relaxed mb-5">
                {locale === 'en' ? svc.desc.en : svc.desc.ko}
              </p>
              <Link
                href={`/${locale}/services`}
                className="text-[15px] font-semibold text-[#0080fb] hover:opacity-75 transition-opacity"
              >
                {locale === 'en' ? 'Learn more' : '자세히보기'} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
