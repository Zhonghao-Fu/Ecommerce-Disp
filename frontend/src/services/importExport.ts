import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import type { ImportResult } from '../types'

/**
 * Export products to CSV
 */
export async function exportProducts(
  fields: string[],
  scope: 'filtered' | 'all',
  filters?: any
): Promise<void> {
  try {
    const response = await axios.post(
      API_ENDPOINTS.PRODUCTS_EXPORT,
      {
        fields,
        scope,
        filters
      },
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `products_export_${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    // Handle error response
    if (error.response) {
      const reader = new FileReader()
      reader.onload = () => {
        const errorData = JSON.parse(reader.result as string)
        throw new Error(errorData.error?.message || '导出失败')
      }
      reader.readAsText(error.response.data)
    } else {
      throw new Error('导出失败，请检查网络连接')
    }
  }
}

/**
 * Import products from CSV
 */
export async function importProducts(
  file: File,
  mode: 'hybrid' | 'insert-only' | 'update-only' = 'hybrid'
): Promise<ImportResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    const response = await axios.post(API_ENDPOINTS.PRODUCTS_IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || '导入失败')
    }

    return response.data.data as ImportResult
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message || '导入失败')
    }
    throw new Error('导入失败，请检查网络连接')
  }
}

/**
 * Download import template
 */
export async function downloadTemplate(): Promise<void> {
  try {
    const response = await axios.get(API_ENDPOINTS.PRODUCTS_TEMPLATE, {
      responseType: 'blob'
    })

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'import_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Template download failed:', error)
    throw new Error('模板下载失败')
  }
}
