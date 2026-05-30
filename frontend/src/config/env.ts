/**
 * Environment Configuration Utility
 * Provides type-safe access to environment variables
 */

interface EnvConfig {
  apiUrl: string
  appTitle: string
  isDebug: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  isDevelopment: boolean
  isProduction: boolean
}

/**
 * Get environment configuration
 */
export function getEnvConfig(): EnvConfig {
  return {
    apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    appTitle: import.meta.env.VITE_APP_TITLE || '商品管理系统',
    isDebug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: (import.meta.env.VITE_LOG_LEVEL as EnvConfig['logLevel']) || 'info',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  }
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return getEnvConfig().apiUrl
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return getEnvConfig().isDebug
}

/**
 * Get current log level
 */
export function getLogLevel(): EnvConfig['logLevel'] {
  return getEnvConfig().logLevel
}

/**
 * Logger utility with environment-aware log levels
 */
export const logger = {
  debug: (...args: any[]) => {
    if (getEnvConfig().logLevel === 'debug') {
      console.log('[DEBUG]', ...args)
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(getEnvConfig().logLevel)) {
      console.info('[INFO]', ...args)
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(getEnvConfig().logLevel)) {
      console.warn('[WARN]', ...args)
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  }
}

/**
 * Log environment configuration on app startup (development only)
 */
export function logEnvConfig(): void {
  if (getEnvConfig().isDevelopment) {
    const config = getEnvConfig()
    console.log('🔧 Environment Configuration:', {
      apiUrl: config.apiUrl,
      appTitle: config.appTitle,
      isDebug: config.isDebug,
      logLevel: config.logLevel,
      mode: config.isDevelopment ? 'development' : 'production'
    })
  }
}
