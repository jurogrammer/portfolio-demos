'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import ko from '@/dictionaries/ko.json';
import en from '@/dictionaries/en.json';

export type Locale = 'ko' | 'en';

type Dictionary = typeof ko;

const dictionaries = { ko, en } as const;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'ko';
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  const val = match?.[1];
  return val === 'en' || val === 'ko' ? val : 'ko';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `locale=${next};path=/;max-age=31536000`;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export const useTranslation = useLocale;
