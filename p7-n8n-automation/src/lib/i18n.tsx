'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import ko from '@/dictionaries/ko.json'
import en from '@/dictionaries/en.json'

export type Locale = 'ko' | 'en'

type Dictionary = typeof ko

const dictionaries: Record<Locale, Dictionary> = { ko, en }

const COOKIE_NAME = 'locale'

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'ko'
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  const value = match ? decodeURIComponent(match[1]) : null
  return value === 'en' ? 'en' : 'ko'
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? 'ko')

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

export { getInitialLocale }
