/**
 * Language Selector Component
 * Dropdown for switching between supported languages
 */

import { useIntl } from 'react-intl'
import { useLanguage } from '../i18n/LanguageProvider'
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type SupportedLocale } from '../i18n'
import styles from './LanguageSelector.module.css'

export default function LanguageSelector() {
  const intl = useIntl()
  const { locale, setLocale } = useLanguage()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as SupportedLocale
    setLocale(newLocale)
  }

  return (
    <div className={styles.languageSelector}>
      <select
        value={locale}
        onChange={handleChange}
        className={styles.select}
        aria-label={intl.formatMessage({ id: 'nav.language' })}
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_FLAGS[loc]} {LOCALE_NAMES[loc]}
          </option>
        ))}
      </select>
    </div>
  )
}
