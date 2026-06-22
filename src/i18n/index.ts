import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'
import { Locale } from 'vant'
import vantEnUS from 'vant/es/locale/lang/en-US'
import vantZhCN from 'vant/es/locale/lang/zh-CN'

export type AppLocale = 'en-US' | 'zh-CN'

const LOCALE_STORAGE_KEY = 'locale'

export function getStoredLocale(): AppLocale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (!raw) return 'en-US'
    const parsed = JSON.parse(raw)
    if (parsed?.locale === 'zh-CN' || parsed?.locale === 'en-US') {
      return parsed.locale
    }
  } catch {
    // ignore
  }
  return 'en-US'
}

export function toLanguageHeader(locale: AppLocale): string {
  return locale === 'zh-CN' ? 'zh' : 'en'
}

export function syncVantLocale(locale: AppLocale) {
  Locale.use(locale === 'zh-CN' ? 'zh-CN' : 'en-US', locale === 'zh-CN' ? vantZhCN : vantEnUS)
}

export const i18n = createI18n({
  legacy: false,
  locale: getStoredLocale(),
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  },
})

syncVantLocale(getStoredLocale())

export default i18n
