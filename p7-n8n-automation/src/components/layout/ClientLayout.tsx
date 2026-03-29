'use client'

import { ReactNode } from 'react'
import { LocaleProvider, type Locale } from '@/lib/i18n'

interface Props {
  children: ReactNode
  initialLocale: Locale
}

export function ClientLayout({ children, initialLocale }: Props) {
  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
}
