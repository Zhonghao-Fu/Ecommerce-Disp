import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { logEnvConfig } from './config/env'

/**
 * Application Entry Point
 * Renders the App component into the root div
 */

// Log environment configuration in development mode
logEnvConfig()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
