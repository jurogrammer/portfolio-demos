'use client';
import { ThemeProvider } from 'next-themes';
import { LocaleProvider } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </ThemeProvider>
    </LocaleProvider>
  );
}
