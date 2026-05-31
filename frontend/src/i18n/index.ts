/**
 * i18n Configuration and Language Detection Utilities
 */

export const SUPPORTED_LOCALES = ['zh', 'zh-Hant', 'en', 'fr'] as const

export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  'zh': '简体中文',
  'zh-Hant': '繁體中文',
  'en': 'English',
  'fr': 'Français'
}

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  'zh': '🇨🇳',
  'zh-Hant': '🇭🇰',
  'en': '🇬🇧',
  'fr': '🇫🇷'
}

/**
 * Detect browser language and map to supported locale
 */
export function getBrowserLanguage(): string {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  const browserLang = navigator.language || (navigator as any).userLanguage || 'en'
  return mapToSupportedLocale(browserLang)
}

/**
 * Map browser language to supported locale
 */
function mapToSupportedLocale(browserLang: string): SupportedLocale {
  const lang = browserLang.toLowerCase()

  // Chinese Simplified
  if (lang === 'zh' || lang === 'zh-cn' || lang === 'zh-sg') {
    return 'zh'
  }

  // Chinese Traditional
  if (lang === 'zh-tw' || lang === 'zh-hk' || lang === 'zh-mo') {
    return 'zh-Hant'
  }

  // French
  if (lang === 'fr' || lang === 'fr-fr' || lang === 'fr-ca' || lang === 'fr-be' || lang === 'fr-ch') {
    return 'fr'
  }

  // Default to English
  return 'en'
}

/**
 * Get default language (from localStorage or browser)
 */
export function getDefaultLanguage(): SupportedLocale {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('locale')
    if (saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)) {
      return saved as SupportedLocale
    }
  }

  return getBrowserLanguage() as SupportedLocale
}
