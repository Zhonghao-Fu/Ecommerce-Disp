import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '../config/api'

/**
 * Create Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - Add request ID and timestamp
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID()
    
    // Add timestamp
    config.headers['X-Request-Timestamp'] = new Date().toISOString()
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle common errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the full response
    return response
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data)
          break
        case 404:
          console.error('Not Found:', data)
          break
        case 500:
          console.error('Server Error:', data)
          break
        default:
          console.error(`HTTP Error ${status}:`, data)
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request)
    } else {
      // Something else happened
      console.error('Request error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
