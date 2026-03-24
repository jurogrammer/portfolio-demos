export type Locale = 'ko' | 'en'
export const locales: Locale[] = ['ko', 'en']
export const defaultLocale: Locale = 'ko'

const dictionaries = {
  ko: () => import('@/dictionaries/ko.json').then(m => m.default),
  en: () => import('@/dictionaries/en.json').then(m => m.default),
}

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]?.() ?? dictionaries.ko()
}
