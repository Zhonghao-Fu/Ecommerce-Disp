/**
 * Parse images from backend response
 * Backend might return JSON string OR already parsed array
 * Frontend always needs array
 * 
 * @param imagesData - JSON string or array from backend
 * @returns Array of image URLs
 * 
 * @example
 * parseImages('["url1", "url2"]')  // Returns: ['url1', 'url2']
 * parseImages(['url1', 'url2'])    // Returns: ['url1', 'url2']
 * parseImages('')                   // Returns: []
 * parseImages('invalid')            // Returns: []
 */
export function parseImages(imagesData: string | string[] | undefined | null): string[] {
  // Handle null/undefined
  if (!imagesData) {
    return []
  }

  // If already an array, return it
  if (Array.isArray(imagesData)) {
    return imagesData
  }

  // If it's a string, try to parse it
  if (typeof imagesData === 'string') {
    if (imagesData.trim() === '') {
      return []
    }

    try {
      const parsed = JSON.parse(imagesData)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.warn('Failed to parse images:', error)
      return []
    }
  }

  return []
}

/**
 * Serialize images to JSON string (for backend)
 * Frontend has array, backend expects JSON string
 * 
 * @param images - Array of image URLs
 * @returns JSON string
 * 
 * @example
 * serializeImages(['url1', 'url2'])  // Returns: '["url1","url2"]'
 * serializeImages([])                 // Returns: '[]'
 */
export function serializeImages(images: string[]): string {
  return JSON.stringify(images || [])
}

/**
 * Get first image from images array
 * Returns placeholder if no images
 * 
 * @param images - Array of image URLs
 * @param placeholder - Placeholder image URL (default: empty string)
 * @returns First image URL or placeholder
 * 
 * @example
 * getFirstImage(['url1', 'url2'])  // Returns: 'url1'
 * getFirstImage([])                 // Returns: ''
 */
export function getFirstImage(images: string[], placeholder: string = ''): string {
  return images && images.length > 0 ? images[0] : placeholder
}

/**
 * Validate if URL is a valid image URL
 * 
 * @param url - URL to validate
 * @returns true if valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get image count for display
 * 
 * @param images - Array of image URLs
 * @returns Image count string
 * 
 * @example
 * getImageCount(['url1', 'url2'])  // Returns: '2 张图片'
 * getImageCount(['url1'])          // Returns: '1 张图片'
 * getImageCount([])                 // Returns: '无图片'
 */
export function getImageCount(images: string[], locale: string = 'zh-CN'): string {
  const count = images?.length || 0
  
  if (count === 0) {
    return locale === 'zh-CN' ? '无图片' : 'No images'
  }
  
  if (locale === 'zh-CN') {
    return `${count} 张图片`
  }
  
  return `${count} image${count > 1 ? 's' : ''}`
}
