'use client'

import { LocaleProvider } from '@/lib/i18n'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}
