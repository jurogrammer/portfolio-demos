'use client'
import { createContext, useContext } from 'react'

type Dictionary = Record<string, Record<string, string>>
const DictionaryContext = createContext<Dictionary>({})

export function DictionaryProvider({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
  return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>
}

export function useDictionary() {
  return useContext(DictionaryContext)
}
