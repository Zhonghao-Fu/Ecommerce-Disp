/**
 * Upload API service
 * Handles file uploads to backend
 */

import apiClient from './http'
import { API_ENDPOINTS } from '../config/api'

export interface UploadResponse {
  success: boolean
  data: {
    url: string
    filename: string
    size: number
  }
  error?: {
    code: string
    message: string
  }
}

export const uploadApi = {
  /**
   * Upload product image
   * @param file - Image file to upload
   * @param onProgress - Optional progress callback (0-100)
   * @returns Upload result with URL
   */
  async uploadProductImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse['data']> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post<UploadResponse>(
      API_ENDPOINTS.UPLOAD_PRODUCT,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            const percent = Math.round((event.loaded * 100) / event.total)
            onProgress(percent)
          }
        }
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || '上传失败')
    }

    return response.data.data
  }
}
