import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { logEnvConfig } from './config/env'
import { LanguageProvider } from './i18n/LanguageProvider'
import { CurrencyProvider } from './context/CurrencyContext'

/**
 * GitHub Pages SPA Redirect Handler
 * Handles direct URL access by reading the saved URL from sessionStorage
 * Returns true if a redirect was handled, false otherwise
 */
function handleGitHubPagesRedirect(): boolean {
  const redirectUrl = sessionStorage.getItem('redirect')
  if (redirectUrl) {
    sessionStorage.removeItem('redirect')
    try {
      const url = new URL(redirectUrl)
      const pathname = url.pathname
      // Only redirect if the pathname is different from current
      if (pathname && pathname !== window.location.pathname) {
        // Replace current URL with the original requested URL
        const newUrl = pathname + url.search + url.hash
        window.history.replaceState(null, '', newUrl)
        return true
      }
    } catch (error) {
      console.error('Failed to parse redirect URL:', error)
    }
  }
  return false
}

/**
 * Application Entry Point
 * Renders the App component into the root div
 */

// Log environment configuration in development mode
logEnvConfig()

// Get basename from Vite's BASE_URL (set by vite.config.ts)
const basename = import.meta.env.BASE_URL || '/'

// Handle GitHub Pages SPA redirect BEFORE rendering
// This ensures the URL is corrected before React Router processes it
handleGitHubPagesRedirect()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename !== '/' ? basename : undefined}>
      <LanguageProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
