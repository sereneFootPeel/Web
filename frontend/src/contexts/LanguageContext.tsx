import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

export type Language = 'zh' | 'en'

type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: (zh: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh')
  const { authenticated, user } = useAuth()

  const refreshCurrentLanguage = useCallback(async () => {
    try {
      const r = await fetch('/language/current', { credentials: 'include' })
      const data = r.ok ? await r.json() : null
      if (data?.language === 'en' || data?.language === 'zh') {
        setLanguageState(data.language)
      }
    } catch {
      // ignore network failures; keep current UI language
    }
  }, [])

  useEffect(() => {
    void refreshCurrentLanguage()
  }, [refreshCurrentLanguage])

  useEffect(() => {
    if (user?.language === 'en' || user?.language === 'zh') {
      setLanguageState(user.language)
      return
    }
    if (!authenticated) {
      void refreshCurrentLanguage()
    }
  }, [authenticated, user?.language, refreshCurrentLanguage])

  const setLanguage = useCallback(async (lang: Language) => {
    const res = await fetch(`/language/set?lang=${lang}`, { credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (data?.success !== false) {
      setLanguageState(lang)
    }
  }, [])

  const t = useCallback((zh: string, en: string) => (language === 'en' ? en : zh), [language])

  const value: LanguageContextValue = { language, setLanguage, t }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
