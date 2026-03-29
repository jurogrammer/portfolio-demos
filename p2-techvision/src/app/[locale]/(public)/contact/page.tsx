import ContactForm from '@/components/public/contact/ContactForm'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export async function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return { title: locale === 'en' ? 'Contact' : '문의하기' }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'

  const contactInfo = [
    { icon: MapPin, label: isEn ? 'Address' : '주소', value: isEn ? '123 Teheran-ro, Gangnam-gu, Seoul' : '서울특별시 강남구 테헤란로 123' },
    { icon: Phone, label: isEn ? 'Phone' : '전화', value: '02-1234-5678' },
    { icon: Mail, label: isEn ? 'Email' : '이메일', value: 'info@techvision.co.kr' },
    { icon: Clock, label: isEn ? 'Business Hours' : '업무시간', value: isEn ? 'Mon-Fri 9:00-18:00' : '월-금 09:00-18:00' },
  ]

  return (
    <div>
      <section className="py-24 bg-[#00194a] text-white">
        <div className="px-8 lg:px-16">
          <h1 className="font-serif text-[48px] lg:text-[68px] font-medium mb-4">{isEn ? 'Contact Us' : '문의하기'}</h1>
          <p className="text-white/70 text-[18px]">{isEn ? "Let's talk about your project" : '프로젝트에 대해 이야기해보세요'}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-[24px] font-bold text-[#111111] mb-8">{isEn ? 'Send a Message' : '문의 보내기'}</h2>
              <ContactForm locale={locale} />
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-[24px] font-bold text-[#111111] mb-8">{isEn ? 'Contact Info' : '연락처 정보'}</h2>
                <div className="space-y-6">
                  {contactInfo.map(info => (
                    <div key={info.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#00194a] rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#111111]">{info.label}</p>
                        <p className="text-[15px] text-[#666666]">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden h-64 border border-[#d4d4d4]">
                <iframe
                  src="https://maps.google.com/maps?q=서울특별시+강남구+테헤란로&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
