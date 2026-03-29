import { Target, Eye } from 'lucide-react'

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
      <section className="py-24 bg-[#00194a] text-white">
        <div className="px-8 lg:px-16">
          <h1 className="font-serif text-[48px] lg:text-[68px] font-medium mb-4">{isEn ? 'About Us' : '회사 소개'}</h1>
          <p className="text-white/70 text-[18px] max-w-xl">{isEn ? 'Changing the world with innovative technology' : '혁신적인 기술로 세상을 변화시킵니다'}</p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-white">
        <div className="px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="border-b md:border-b-0 md:border-r border-[#d4d4d4] pb-10 md:pb-0 md:pr-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00194a] flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-[24px] font-bold text-[#111111]">{isEn ? 'Vision' : '비전'}</h2>
              </div>
              <p className="text-[#666666] text-[18px] leading-relaxed">{isEn ? 'Making a better world through technological innovation' : '기술 혁신으로 더 나은 세상을 만듭니다'}</p>
            </div>
            <div className="pt-10 md:pt-0 md:pl-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00205c] flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-[24px] font-bold text-[#111111]">{isEn ? 'Mission' : '미션'}</h2>
              </div>
              <p className="text-[#666666] text-[18px] leading-relaxed">{isEn ? 'Becoming the best technology partner for our clients\' business success' : '고객의 비즈니스 성공을 위한 최고의 기술 파트너가 됩니다'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-[#f5f6fb]">
        <div className="px-8 lg:px-16">
          <h2 className="font-serif text-[40px] lg:text-[55px] font-medium text-[#111111] mb-14">{isEn ? 'Company History' : '회사 연혁'}</h2>
          <div className="relative max-w-3xl">
            <div className="absolute left-[7px] top-0 w-[2px] h-full bg-[#d4d4d4]" />
            {timelineEvents.map((event) => (
              <div key={event.year} className="relative flex items-start mb-10 pl-10">
                <div className="absolute left-0 top-1 w-4 h-4 bg-[#00194a] rounded-full border-4 border-[#f5f6fb]" />
                <div>
                  <span className="text-[#0080fb] font-bold text-[20px]">{event.year}</span>
                  <p className="text-[#666666] mt-1 text-[16px]">{isEn ? event.en : event.ko}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="px-8 lg:px-16">
          <h2 className="font-serif text-[40px] lg:text-[55px] font-medium text-[#111111] mb-14">{isEn ? 'Our Team' : '우리 팀'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="border-t border-[#d4d4d4] pt-8">
                <div className="w-14 h-14 bg-[#00194a] rounded-full flex items-center justify-center text-white text-xl font-bold mb-5">
                  {(isEn ? member.nameEn : member.name)[0]}
                </div>
                <h3 className="font-bold text-[#111111] text-[20px]">{isEn ? member.nameEn : member.name}</h3>
                <p className="text-[#0080fb] text-[14px] font-medium mt-1">{member.role}</p>
                <p className="text-[#666666] text-[14px] mt-2">{isEn ? member.bioEn : member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
