import ContactForm from '@/components/public/contact/ContactForm'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
      <section className="py-16 bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">{isEn ? 'Contact Us' : '문의하기'}</h1>
          <p className="text-white/90">{isEn ? "Let's talk about your project" : '프로젝트에 대해 이야기해보세요'}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">{isEn ? 'Send a Message' : '문의 보내기'}</h2>
              <ContactForm locale={locale} />
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">{isEn ? 'Contact Info' : '연락처 정보'}</h2>
                <div className="space-y-4">
                  {contactInfo.map(info => (
                    <Card key={info.label}>
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <info.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{info.label}</p>
                          <p className="text-sm text-gray-600">{info.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="rounded-xl overflow-hidden h-64 border">
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
