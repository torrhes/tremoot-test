import { create } from 'zustand'
import type { Locale } from '../i18n/types'
import { translate, type TranslationKey } from '../i18n/translations'

const STORAGE_KEY = 'dispatch-board-locale'

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'pt' ? stored : 'pt'
}

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: readStoredLocale(),
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR'
    set({ locale })
  },
  t: (key, vars) => translate(get().locale, key, vars),
}))
