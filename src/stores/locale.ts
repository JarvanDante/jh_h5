import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@/router'
import i18n, { syncVantLocale, toLanguageHeader, type AppLocale } from '@/i18n'

export const useLocaleStore = defineStore(
  'locale',
  () => {
    const locale = ref<AppLocale>(i18n.global.locale.value as AppLocale)

    const updateDocumentTitle = () => {
      const titleKey = router.currentRoute.value.meta.titleKey as string | undefined
      if (titleKey) {
        document.title = i18n.global.t(titleKey)
      }
    }

    const setLocale = (next: AppLocale) => {
      locale.value = next
      i18n.global.locale.value = next
      syncVantLocale(next)
      document.documentElement.lang = next === 'zh-CN' ? 'zh-CN' : 'en'
      updateDocumentTitle()
    }

    const languageHeader = () => toLanguageHeader(locale.value)

    return {
      locale,
      setLocale,
      languageHeader,
    }
  },
  {
    persist: true,
  },
)
