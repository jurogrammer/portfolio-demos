import { getDictionary, locales } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { DictionaryProvider } from '@/lib/i18n/DictionaryContext'

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const dictionary = await getDictionary(locale as Locale)
  return (
    <DictionaryProvider dictionary={dictionary}>
      {children}
    </DictionaryProvider>
  )
}
