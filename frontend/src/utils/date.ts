/**
 * Format ISO date string to localized date
 * 
 * @param isoString - ISO date string from backend
 * @param format - Format type: 'date' | 'datetime' | 'time' (default: 'date')
 * @param locale - Locale string (default: 'zh-CN')
 * @returns Formatted date string
 * 
 * @example
 * formatDate('2026-05-30T00:15:36.000Z')                    // Returns: '2026/05/30'
 * formatDate('2026-05-30T00:15:36.000Z', 'datetime')        // Returns: '2026/05/30 08:15:36'
 * formatDate('2026-05-30T00:15:36.000Z', 'time')            // Returns: '08:15:36'
 */
export function formatDate(
  isoString: string,
  format: 'date' | 'datetime' | 'time' = 'date',
  locale: string = 'zh-CN'
): string {
  const date = new Date(isoString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  if (format === 'datetime' || format === 'time') {
    Object.assign(options, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return date.toLocaleString(locale, options)
}

/**
 * Format date to relative time (e.g., "2 days ago")
 * 
 * @param isoString - ISO date string from backend
 * @param locale - Locale string (default: 'zh-CN')
 * @returns Relative time string
 * 
 * @example
 * formatRelativeTime('2026-05-30T00:15:36.000Z')  // Returns: '刚刚' or '2天前'
 */
export function formatRelativeTime(
  isoString: string,
  locale: string = 'zh-CN'
): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return locale === 'zh-CN' ? '刚刚' : 'Just now'
  }
  if (diffMinutes < 60) {
    return locale === 'zh-CN' ? `${diffMinutes}分钟前` : `${diffMinutes}m ago`
  }
  if (diffHours < 24) {
    return locale === 'zh-CN' ? `${diffHours}小时前` : `${diffHours}h ago`
  }
  if (diffDays < 30) {
    return locale === 'zh-CN' ? `${diffDays}天前` : `${diffDays}d ago`
  }

  // Fallback to regular date format
  return formatDate(isoString, 'date', locale)
}

/**
 * Check if a date is in the past
 * 
 * @param isoString - ISO date string
 * @returns true if date is in the past
 */
export function isDateInPast(isoString: string): boolean {
  const date = new Date(isoString)
  return date.getTime() < Date.now()
}

/**
 * Check if a date is in the future
 * 
 * @param isoString - ISO date string
 * @returns true if date is in the future
 */
export function isDateInFuture(isoString: string): boolean {
  const date = new Date(isoString)
  return date.getTime() > Date.now()
}
