import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import ClientLayout from '@/components/layout/ClientLayout'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://p6-sheets-dashboard.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: 'Google Sheets 재고관리 대시보드', template: '%s | 재고관리 대시보드' },
  description: 'Google Sheets를 데이터 저장소로 활용하는 소규모 재고관리 대시보드',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>
          {children}
          <Toaster richColors position="top-right" />
        </ClientLayout>
      </body>
    </html>
  )
}
