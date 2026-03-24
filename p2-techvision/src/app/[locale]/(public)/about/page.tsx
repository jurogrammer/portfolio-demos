import type { Locale } from '@/lib/i18n'
import { Target, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const timelineEvents = [
  { year: 2017, ko: '회사 설립, 웹 개발 사업 시작', en: 'Company founded, web development begins' },
  { year: 2018, ko: '첫 엔터프라이즈 계약 체결', en: 'First enterprise contract signed' },
  { year: 2019, ko: '모바일 앱 사업부 신설', en: 'Mobile app division established' },
  { year: 2021, ko: '글로벌 파트너십 체결', en: 'Global partnership established' },
  { year: 2023, ko: '직원 수 25명 돌파', en: 'Team grows beyond 25 members' },
  { year: 2024, ko: 'AI 솔루션 사업 진출', en: 'AI solutions business launched' },
]

const teamMembers = [
  { name: '김민준', nameEn: 'Minjun Kim', role: '대표이사 / CEO', bio: '15년 IT 경력, 전 삼성SDS 수석', bioEn: '15 years IT experience, former Samsung SDS' },
  { name: '이서연', nameEn: 'Seoyeon Lee', role: '기술이사 / CTO', bio: 'React 코어 컨트리뷰터', bioEn: 'React core contributor' },
  { name: '박준호', nameEn: 'Junho Park', role: '프론트엔드 리드', bio: 'Next.js 전문가', bioEn: 'Next.js expert' },
  { name: '최지원', nameEn: 'Jiwon Choi', role: '백엔드 리드', bio: 'Node.js & AWS 전문가', bioEn: 'Node.js & AWS expert' },
  { name: '정수진', nameEn: 'Sujin Jung', role: 'UX/UI 디자이너', bio: '사용자 중심 디자인 전문', bioEn: 'User-centered design specialist' },
  { name: '한동현', nameEn: 'Donghyun Han', role: '모바일 개발자', bio: 'React Native 전문가', bioEn: 'React Native specialist' },
]

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']

export async function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return { title: locale === 'en' ? 'About Us' : '회사 소개' }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'

  return (
    <div>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{isEn ? 'About Us' : '회사 소개'}</h1>
          <p className="text-white/90 text-lg">{isEn ? 'Changing the world with innovative technology' : '혁신적인 기술로 세상을 변화시킵니다'}</p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-blue-600">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold">{isEn ? 'Vision' : '비전'}</h2>
                </div>
                <p className="text-gray-600 text-lg">{isEn ? 'Making a better world through technological innovation' : '기술 혁신으로 더 나은 세상을 만듭니다'}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-600">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold">{isEn ? 'Mission' : '미션'}</h2>
                </div>
                <p className="text-gray-600 text-lg">{isEn ? 'Becoming the best technology partner for our clients\' business success' : '고객의 비즈니스 성공을 위한 최고의 기술 파트너가 됩니다'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{isEn ? 'Company History' : '회사 연혁'}</h2>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-1/2 -translate-x-px w-0.5 h-full bg-blue-200" />
            {timelineEvents.map((event, idx) => (
              <div key={event.year} className={`relative flex items-center mb-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-1/2 ${idx % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <span className="text-blue-600 font-bold text-lg">{event.year}</span>
                    <p className="text-gray-700 mt-1 text-sm">{isEn ? event.en : event.ko}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow" />
                <div className="w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{isEn ? 'Our Team' : '우리 팀'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <Card key={member.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${colors[idx]} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                    {(isEn ? member.nameEn : member.name)[0]}
                  </div>
                  <h3 className="font-semibold text-gray-900">{isEn ? member.nameEn : member.name}</h3>
                  <p className="text-blue-600 text-sm mt-1">{member.role}</p>
                  <p className="text-gray-500 text-xs mt-2">{isEn ? member.bioEn : member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
