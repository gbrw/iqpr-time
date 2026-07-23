'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'ar' | 'en'

type LanguageContextValue = {
  language: Language
  isArabic: boolean
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar')

  useEffect(() => {
    const saved = window.localStorage.getItem('site-language')
    if (saved === 'ar' || saved === 'en') setLanguageState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    window.localStorage.setItem('site-language', language)
  }, [language])

  const value = useMemo(() => ({
    language,
    isArabic: language === 'ar',
    setLanguage: setLanguageState,
    toggleLanguage: () => setLanguageState(current => current === 'ar' ? 'en' : 'ar'),
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
