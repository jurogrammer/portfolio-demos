import Link from 'next/link'
import { Code2, Smartphone, BarChart3, Cloud, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const services = [
  {
    id: 'web',
    icon: Code2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-600',
    title: { ko: '웹 개발', en: 'Web Development' },
    description: {
      ko: 'React, Next.js 기반의 고성능 웹 애플리케이션을 개발합니다. SPA부터 SSR/SSG까지, 비즈니스 요구에 맞는 최적의 아키텍처를 제안합니다.',
      en: 'We build high-performance web applications using React and Next.js. From SPA to SSR/SSG, we propose the optimal architecture for your business needs.',
    },
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    process: {
      ko: ['요구사항 분석 및 기획', 'UI/UX 설계 및 프로토타입', '프론트엔드 개발', '백엔드 API 연동', '테스트 및 QA', '배포 및 유지보수'],
      en: ['Requirements analysis & planning', 'UI/UX design & prototyping', 'Frontend development', 'Backend API integration', 'Testing & QA', 'Deployment & maintenance'],
    },
  },
  {
    id: 'mobile',
    icon: Smartphone,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-600',
    title: { ko: '모바일 앱 개발', en: 'Mobile App Development' },
    description: {
      ko: 'React Native를 활용한 iOS/Android 크로스플랫폼 모바일 앱을 개발합니다. 하나의 코드베이스로 두 플랫폼을 동시에 지원합니다.',
      en: 'We develop cross-platform iOS/Android mobile apps using React Native. One codebase supports both platforms simultaneously.',
    },
    techStack: ['React Native', 'Expo', 'TypeScript', 'Redux', 'Firebase', 'App Store/Play Store'],
    process: {
      ko: ['앱 기획 및 스토리보드', '디자인 시스템 구축', 'React Native 개발', '네이티브 모듈 통합', '기기 테스트', '스토어 배포'],
      en: ['App planning & storyboard', 'Design system setup', 'React Native development', 'Native module integration', 'Device testing', 'Store deployment'],
    },
  },
  {
    id: 'consulting',
    icon: BarChart3,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-600',
    title: { ko: '디지털 컨설팅', en: 'Digital Consulting' },
    description: {
      ko: 'IT 전략 수립부터 디지털 전환 로드맵 제시까지, 기업의 디지털 혁신을 전방위적으로 지원합니다. 데이터 기반의 인사이트로 의사결정을 돕습니다.',
      en: 'From IT strategy development to digital transformation roadmaps, we comprehensively support enterprise digital innovation with data-driven insights.',
    },
    techStack: ['IT Strategy', 'Digital Transformation', 'Data Analytics', 'Process Automation', 'Change Management'],
    process: {
      ko: ['현황 진단 및 분석', '목표 설정 및 KPI 수립', '디지털 전환 로드맵 수립', '솔루션 도입 지원', '성과 측정 및 피드백', '지속적 개선'],
      en: ['Current state diagnosis', 'Goal setting & KPI definition', 'Digital transformation roadmap', 'Solution adoption support', 'Performance measurement', 'Continuous improvement'],
    },
  },
  {
    id: 'cloud',
    icon: Cloud,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-600',
    title: { ko: '클라우드 솔루션', en: 'Cloud Solutions' },
    description: {
      ko: 'AWS, GCP 기반의 클라우드 인프라를 설계하고 구축합니다. 마이크로서비스 아키텍처, 컨테이너화, CI/CD 파이프라인을 통해 확장 가능한 시스템을 만듭니다.',
      en: 'We design and build cloud infrastructure on AWS and GCP. Microservices architecture, containerization, and CI/CD pipelines create scalable systems.',
    },
    techStack: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    process: {
      ko: ['클라우드 아키텍처 설계', '인프라 구축 및 마이그레이션', '컨테이너화 및 오케스트레이션', 'CI/CD 파이프라인 구축', '모니터링 및 알림 설정', '비용 최적화'],
      en: ['Cloud architecture design', 'Infrastructure setup & migration', 'Containerization & orchestration', 'CI/CD pipeline setup', 'Monitoring & alerting', 'Cost optimization'],
    },
  },
]

export async function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return { title: locale === 'en' ? 'Services' : '서비스' }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'

  return (
    <div>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{isEn ? 'Our Services' : '서비스'}</h1>
          <p className="text-white/90 text-lg max-w-xl mx-auto">
            {isEn
              ? 'End-to-end IT solutions tailored for your business'
              : '비즈니스에 최적화된 종합 IT 솔루션을 제공합니다'}
          </p>
        </div>
      </section>

      {/* Service Sections */}
      <div className="divide-y">
        {services.map((svc, idx) => (
          <section key={svc.id} className={`py-20 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left: description + tech */}
                <div className={idx % 2 === 0 ? '' : 'lg:order-2'}>
                  <div className={`w-14 h-14 rounded-2xl ${svc.bg} flex items-center justify-center mb-6`}>
                    <svc.icon className={`h-7 w-7 ${svc.color}`} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {isEn ? svc.title.en : svc.title.ko}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {isEn ? svc.description.en : svc.description.ko}
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">{isEn ? 'Tech Stack' : '기술 스택'}</p>
                    <div className="flex flex-wrap gap-2">
                      {svc.techStack.map(tech => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: process */}
                <div className={idx % 2 === 0 ? '' : 'lg:order-1'}>
                  <Card className={`border-t-4 ${svc.border}`}>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 mb-5">
                        {isEn ? 'Our Process' : '진행 프로세스'}
                      </h3>
                      <ol className="space-y-3">
                        {(isEn ? svc.process.en : svc.process.ko).map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full ${svc.bg} ${svc.color} flex items-center justify-center text-xs font-bold`}>
                              {i + 1}
                            </span>
                            <span className="text-gray-700 text-sm pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            {isEn ? 'Ready to get started?' : '시작할 준비가 되셨나요?'}
          </h2>
          <p className="text-white/90 mb-8">
            {isEn ? 'Contact us for a free consultation' : '무료 상담 신청하기'}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isEn ? 'Contact Us' : '문의하기'}
          </Link>
        </div>
      </section>
    </div>
  )
}
