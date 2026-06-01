import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import App from './App'
import './index.css'
import { logEnvConfig } from './config/env'
import { LanguageProvider } from './i18n/LanguageProvider'
import { CurrencyProvider } from './context/CurrencyContext'

/**
 * GitHub Pages SPA Redirect Handler
 * Handles direct URL access by reading the saved URL from sessionStorage
 */
function GitHubPagesRedirectHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const redirectUrl = sessionStorage.getItem('redirect')
    if (redirectUrl) {
      sessionStorage.removeItem('redirect')
      // Extract pathname from the full URL
      try {
        const url = new URL(redirectUrl)
        const pathname = url.pathname
        // Only navigate if the pathname is different from current
        if (pathname && pathname !== window.location.pathname) {
          navigate(pathname + url.search + url.hash, { replace: true })
        }
      } catch (error) {
        console.error('Failed to parse redirect URL:', error)
      }
    }
  }, [navigate])

  return null
}

/**
 * Application Entry Point
 * Renders the App component into the root div
 */

// Log environment configuration in development mode
logEnvConfig()

// Get basename from Vite's BASE_URL (set by vite.config.ts)
const basename = import.meta.env.BASE_URL || '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename !== '/' ? basename : undefined}>
      <GitHubPagesRedirectHandler />
      <LanguageProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
