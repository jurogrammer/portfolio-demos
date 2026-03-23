import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR, Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const notoSansKR = Noto_Sans_KR({ subsets: ['latin'], display: 'swap', variable: '--font-noto-kr', weight: ['400', '500', '700'], preload: false });

export const metadata: Metadata = {
  title: { template: '%s | 주인재', default: '주인재 | 풀스택 엔지니어' },
  description: '5년+ 풀스택 엔지니어. Kotlin, Spring Boot, React, Next.js.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={cn(inter.variable, notoSansKR.variable, "font-sans", geist.variable)}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
