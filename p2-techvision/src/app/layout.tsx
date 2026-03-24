import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techvision-demo.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: 'TechVision Solutions', template: '%s | TechVision Solutions' },
  description: '혁신적인 기술로 비즈니스를 변화시키는 IT 솔루션 전문 기업',
  keywords: ['IT솔루션', '웹개발', '모바일앱', '디지털컨설팅', '클라우드', 'IT outsourcing'],
  openGraph: {
    type: 'website',
    siteName: 'TechVision Solutions',
    title: 'TechVision Solutions',
    description: '혁신적인 기술로 비즈니스를 변화시키는 IT 솔루션 전문 기업',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
  },
  alternates: {
    canonical: `${baseUrl}/ko`,
    languages: {
      ko: `${baseUrl}/ko`,
      en: `${baseUrl}/en`,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TechVision Solutions',
  url: baseUrl,
  description: '혁신적인 기술로 비즈니스를 변화시키는 IT 솔루션 전문 기업',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '테헤란로 123',
    addressLocality: '강남구',
    addressRegion: '서울',
    addressCountry: 'KR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '02-1234-5678',
    contactType: 'customer service',
    availableLanguage: ['Korean', 'English'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  )
}
