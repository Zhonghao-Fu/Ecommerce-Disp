/**
 * Language Provider with react-intl IntlProvider wrapper
 * Manages locale state and provides language switching functionality
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { getDefaultLanguage, type SupportedLocale } from './index'

interface LanguageContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    return getDefaultLanguage()
  })

  const [messages, setMessages] = useState<Record<string, string> | undefined>(undefined)

  // Load locale messages dynamically
  useEffect(() => {
    let isMounted = true

    const loadMessages = async () => {
      try {
        // Dynamic import of locale file
        const localeModule = await import(`./locales/${locale}.json`)
        
        if (isMounted) {
          setMessages(localeModule.default)
          localStorage.setItem('locale', locale)
        }
      } catch (error) {
        console.error(`Failed to load locale: ${locale}`, error)
        // Fallback to English
        if (locale !== 'en') {
          import('./locales/en.json').then(mod => {
            if (isMounted) {
              setMessages(mod.default)
            }
          })
        }
      }
    }

    loadMessages()

    return () => {
      isMounted = false
    }
  }, [locale])

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        messages={messages}
        defaultLocale="en"
        onError={(error) => {
          // Suppress missing translation warnings in development
          if (import.meta.env.MODE !== 'development') {
            console.error('Intl error:', error)
          }
        }}
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

/**
 * Hook to access language context
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
