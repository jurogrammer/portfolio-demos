'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import ko from '@/dictionaries/ko.json'
import en from '@/dictionaries/en.json'

export type Locale = 'ko' | 'en'

type Dictionary = typeof ko

const dictionaries: Record<Locale, Dictionary> = { ko, en }

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'ko'
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/)
  const value = match?.[1]
  return value === 'en' ? 'en' : 'ko'
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.cookie = `locale=${next};path=/;max-age=${60 * 60 * 24 * 365}`
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
