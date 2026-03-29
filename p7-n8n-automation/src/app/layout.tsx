import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "n8n 고객 문의 자동화 시스템",
  description: "문의 접수 → AI 분류 → 알림 → 기록을 한 번에 자동화",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;
  const initialLocale: Locale = localeCookie === "en" ? "en" : "ko";

  return (
    <html
      lang={initialLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayout initialLocale={initialLocale}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
