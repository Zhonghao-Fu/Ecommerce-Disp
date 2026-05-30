# API 服务层模块规格说明书

## 模块概述

本模块负责封装前端 HTTP 请求逻辑，提供类型安全、统一错误处理、请求/响应拦截的 API 服务层。作为前端与后端 API 之间的桥梁，该层抽象了所有网络请求细节，使组件层只需调用简单的函数即可获取数据，无需关心 HTTP 实现细节。通过集中管理 API 调用，提升代码可维护性、可测试性和复用性。

**设计原则**：
- 类型安全：完整的 TypeScript 类型定义，编译时检查
- 统一封装：所有 API 请求通过统一入口
- 错误处理：自动处理 HTTP 错误和业务错误
- 拦截器：请求/响应统一处理（Token、日志、错误）
- 简洁接口：组件层调用简单直观

---

## 功能需求

### 核心需求

1. **HTTP 客户端封装**
   - 基于 Axios 封装
   - 统一 Base URL 配置
   - 请求超时设置
   - 默认请求头配置

2. **请求拦截器**
   - 自动添加 Authorization Token
   - 请求日志记录（开发环境）
   - 请求 ID 生成（用于追踪）
   - 请求参数序列化

3. **响应拦截器**
   - 统一响应数据解包
   - 自动错误处理
   - 响应日志记录
   - Token 过期处理

4. **API 方法封装**
   - 商品列表查询
   - 商品详情查询
   - 商品创建
   - 商品更新
   - 商品状态更新
   - 商品删除

5. **类型定义**
   - API 请求参数类型
   - API 响应数据类型
   - 错误响应类型
   - 分页信息类型

---

## 技术实现

### 技术选型

- **HTTP 库**: Axios 1.x
- **类型支持**: 内置 TypeScript 支持
- **环境变量**: Vite 环境变量（VITE_API_BASE_URL）
- **错误处理**: 自定义 ApiError 类
- **日志**: Console（开发环境）

### 为什么选择 Axios？

✅ **优势**：
- Promise-based API，现代化
- 请求/响应拦截器支持
- 自动 JSON 转换
- 请求取消支持
- 浏览器和 Node.js 通用
- 完善的 TypeScript 类型

### 文件结构

```
frontend/src/
├── api/
│   ├── http.ts                    # Axios 实例配置
│   ├── interceptors.ts            # 请求/响应拦截器
│   ├── product.api.ts             # 商品 API 方法
│   └── types.ts                   # API 相关类型
├── types/
│   └── api.ts                     # 全局 API 类型（已在模块19定义）
├── utils/
│   ├── errorHandler.ts            # 错误处理工具
│   └── logger.ts                  # 日志工具
└── config/
    └── api.ts                     # API 配置常量
```

### 安装依赖

```bash
npm install axios
```

---

## 核心实现

### 1. Axios 实例配置

```typescript
// frontend/src/api/http.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { setupInterceptors } from './interceptors'
import { env } from '../config/env'

/**
 * 创建 Axios 实例
 */
const http: AxiosInstance = axios.create({
  // API 基础 URL
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  
  // 请求超时时间（毫秒）
  timeout: 10000,
  
  // 默认请求头
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // 允许携带凭证（Cookies）
  withCredentials: true,
  
  // 响应数据格式
  responseType: 'json',
})

// 设置拦截器
setupInterceptors(http)

export default http
```

### 2. 请求/响应拦截器

```typescript
// frontend/src/api/interceptors.ts
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ApiError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * 生成请求 ID（用于追踪）
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 设置拦截器
 */
export function setupInterceptors(http: AxiosInstance) {
  // 请求拦截器
  http.interceptors.request.use(
    (config) => {
      // 生成请求 ID
      config.headers['X-Request-Id'] = generateRequestId()
      
      // 添加 Authorization Token
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // 开发环境记录请求日志
      if (import.meta.env.DEV) {
        logger.request({
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
          data: config.data,
          requestId: config.headers['X-Request-Id'],
        })
      }
      
      return config
    },
    (error) => {
      logger.error('Request setup failed:', error)
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器
  http.interceptors.response.use(
    (response: AxiosResponse) => {
      // 开发环境记录响应日志
      if (import.meta.env.DEV) {
        logger.response({
          status: response.status,
          url: response.config.url,
          data: response.data,
          requestId: response.config.headers['X-Request-Id'],
          duration: getResponseDuration(response.config),
        })
      }
      
      // 解包统一响应格式
      const { code, message, data } = response.data
      
      // 后端返回 code !== 200/201 视为业务错误
      if (code !== 200 && code !== 201) {
        throw new ApiError(
          message || '请求失败',
          code,
          response.data.errorCode || 'UNKNOWN_ERROR',
          response.data.fields
        )
      }
      
      // 返回解包后的数据
      return { ...response, data }
    },
    (error: AxiosError) => {
      // HTTP 错误处理
      handleHttpError(error)
      return Promise.reject(error)
    }
  )
}

/**
 * 处理 HTTP 错误
 */
function handleHttpError(error: AxiosError) {
  // 网络错误
  if (!error.response) {
    logger.error('Network error:', error.message)
    throw new ApiError('网络连接失败，请检查网络设置', 0, 'NETWORK_ERROR')
  }
  
  const { status, data } = error.response as any
  
  // HTTP 状态码错误
  switch (status) {
    case 400:
      // 验证错误
      const errorData = data as any
      throw new ApiError(
        errorData.message || '请求参数错误',
        status,
        errorData.errorCode || 'BAD_REQUEST',
        errorData.fields
      )
    
    case 401:
      // 未授权 - 清除 Token 并跳转登录
      localStorage.removeItem('auth_token')
      // 可选：跳转到登录页
      // window.location.href = '/login'
      throw new ApiError('认证失败，请重新登录', status, 'UNAUTHORIZED')
    
    case 403:
      throw new ApiError('权限不足', status, 'FORBIDDEN')
    
    case 404:
      throw new ApiError('请求的资源不存在', status, 'NOT_FOUND')
    
    case 500:
      logger.error('Server error:', data)
      throw new ApiError('服务器内部错误', status, 'SERVER_ERROR')
    
    default:
      throw new ApiError(
        (data as any)?.message || '请求失败',
        status,
        (data as any)?.errorCode || 'UNKNOWN_ERROR'
      )
  }
}

/**
 * 获取请求耗时（用于日志）
 */
function getResponseDuration(config: AxiosRequestConfig): number {
  const startTime = (config as any).startTime || Date.now()
  return Date.now() - startTime
}
```

### 3. API 错误类

```typescript
// frontend/src/utils/errorHandler.ts

/**
 * API 错误类
 */
export class ApiError extends Error {
  /** HTTP 状态码或业务错误码 */
  public readonly code: number
  
  /** 错误码（业务级别） */
  public readonly errorCode: string
  
  /** 字段级验证错误 */
  public readonly fields?: Record<string, string[]>
  
  /** 是否为网络错误 */
  public readonly isNetworkError: boolean

  constructor(
    message: string,
    code: number,
    errorCode = 'UNKNOWN_ERROR',
    fields?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.errorCode = errorCode
    this.fields = fields
    this.isNetworkError = code === 0

    Object.setPrototypeOf(this, ApiError.prototype)
  }

  /**
   * 判断是否为验证错误
   */
  isValidationError(): boolean {
    return this.errorCode === 'VALIDATION_ERROR' && !!this.fields
  }

  /**
   * 获取字段错误消息
   */
  getFieldErrors(): string[] {
    if (!this.fields) return []
    return Object.values(this.fields).flat()
  }
}

/**
 * 友好的错误消息映射
 */
export const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  UNAUTHORIZED: '认证失败，请重新登录',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '数据验证失败',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  TIMEOUT: '请求超时，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请稍后重试',
}

/**
 * 获取友好的错误消息
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || ERROR_MESSAGES[error.errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR
}
```

### 4. 日志工具

```typescript
// frontend/src/utils/logger.ts

/**
 * 日志工具
 */
export const logger = {
  /**
   * 请求日志
   */
  request(data: {
    method?: string
    url?: string
    params?: any
    data?: any
    requestId?: string
  }) {
    console.log(
      '📤 [REQUEST]',
      `${data.method} ${data.url}`,
      `\nRequest ID: ${data.requestId}`,
      data.params ? `\nParams: ${JSON.stringify(data.params)}` : '',
      data.data ? `\nData: ${JSON.stringify(data.data)}` : ''
    )
  },

  /**
   * 响应日志
   */
  response(data: {
    status?: number
    url?: string
    data?: any
    requestId?: string
    duration?: number
  }) {
    console.log(
      '📥 [RESPONSE]',
      `${data.status} ${data.url}`,
      `\nRequest ID: ${data.requestId}`,
      `\nDuration: ${data.duration}ms`,
      data.data ? `\nData: ${JSON.stringify(data.data).substring(0, 200)}` : ''
    )
  },

  /**
   * 错误日志
   */
  error(message: string, error?: any) {
    console.error('❌ [ERROR]', message, error)
  },

  /**
   * 警告日志
   */
  warn(message: string, data?: any) {
    console.warn('⚠️  [WARN]', message, data)
  },

  /**
   * 信息日志
   */
  info(message: string, data?: any) {
    console.info('ℹ️  [INFO]', message, data)
  },
}
```

---

## API 方法封装

### 商品 API 服务

```typescript
// frontend/src/api/product.api.ts
import http from './http'
import { ApiError } from '../utils/errorHandler'
import type {
  Product,
  ProductListItem,
  ProductQueryParams,
  CreateProductInput,
  UpdateProductInput,
  PaginatedResponse,
  PaginationInfo,
} from '../types'

/**
 * 商品 API 服务
 */
export const productApi = {
  /**
   * 获取商品列表
   * @param params 查询参数
   * @returns 分页商品列表
   */
  async getProducts(
    params: ProductQueryParams = {}
  ): Promise<{ items: ProductListItem[]; pagination: PaginationInfo }> {
    const response = await http.get<{ items: ProductListItem[]; pagination: PaginationInfo }>(
      '/products',
      { params }
    )
    return response.data
  },

  /**
   * 获取商品详情
   * @param id 商品 ID
   * @returns 商品详情
   */
  async getProductById(id: string): Promise<Product> {
    const response = await http.get<Product>(`/products/${id}`)
    return response.data
  },

  /**
   * 创建商品
   * @param data 商品数据
   * @returns 创建的商品
   */
  async createProduct(data: CreateProductInput): Promise<Product> {
    const response = await http.post<Product>('/products', data)
    return response.data
  },

  /**
   * 更新商品
   * @param id 商品 ID
   * @param data 更新数据
   * @returns 更新后的商品
   */
  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    const response = await http.put<Product>(`/products/${id}`, data)
    return response.data
  },

  /**
   * 更新商品状态
   * @param id 商品 ID
   * @param status 新状态
   * @returns 更新后的商品
   */
  async updateProductStatus(
    id: string,
    status: 'on_sale' | 'off_sale'
  ): Promise<Product> {
    const response = await http.patch<Product>(`/products/${id}/status`, {
      status,
    })
    return response.data
  },

  /**
   * 删除商品
   * @param id 商品 ID
   */
  async deleteProduct(id: string): Promise<void> {
    await http.delete(`/products/${id}`)
  },
}

export default productApi
```

---

## 类型定义

### API 相关类型

```typescript
// frontend/src/api/types.ts

/**
 * API 统一响应格式
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  errorCode?: string
  fields?: Record<string, string[]>
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationInfo
}

/**
 * 商品查询参数
 */
export interface ProductQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  minPrice?: number
  maxPrice?: number
  status?: 'on_sale' | 'off_sale'
  sortBy?: 'price' | 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 请求配置扩展
 */
export interface RequestConfig {
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 是否显示错误提示 */
  showError?: boolean
  /** 请求超时时间 */
  timeout?: number
}
```

---

## 使用示例

### 1. 在组件中使用

```typescript
// frontend/src/pages/ProductList.tsx
import { useState, useEffect } from 'react'
import { productApi } from '../api/product.api'
import { ApiError } from '../utils/errorHandler'
import type { ProductListItem, ProductQueryParams } from '../types'

export default function ProductList() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0 })

  // 加载商品列表
  const loadProducts = async (params: ProductQueryParams = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await productApi.getProducts({
        page: params.page || 1,
        pageSize: params.pageSize || 12,
        keyword: params.keyword,
        status: 'on_sale',
      })
      
      setProducts(result.items)
      setPagination({
        page: result.pagination.page,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('加载失败')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 2. 错误处理示例

```typescript
// frontend/src/pages/ProductForm.tsx
import { productApi } from '../api/product.api'
import { ApiError } from '../utils/errorHandler'

export default function ProductForm() {
  const handleSubmit = async (data: CreateProductInput) => {
    try {
      await productApi.createProduct(data)
      // 成功处理
      alert('创建成功')
    } catch (err) {
      if (err instanceof ApiError) {
        // 验证错误
        if (err.isValidationError()) {
          const fieldErrors = err.getFieldErrors()
          console.error('字段错误:', fieldErrors)
          // 显示表单验证错误
          showValidationErrors(err.fields)
        } else {
          // 其他业务错误
          alert(err.message)
        }
      } else {
        alert('创建失败')
      }
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### 3. 自定义 Hook 示例

```typescript
// frontend/src/hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { productApi } from '../api/product.api'
import type { ProductListItem, ProductQueryParams } from '../types'

/**
 * 商品列表 Hook
 */
export function useProducts(initialParams: ProductQueryParams = {}) {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  })

  const fetchProducts = async (params: ProductQueryParams = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await productApi.getProducts({
        ...initialParams,
        ...params,
      })
      
      setProducts(result.items)
      setPagination(result.pagination)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(initialParams)
  }, [])

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  }
}
```

---

## 测试要点

### 1. HTTP 客户端测试

- [ ] Axios 实例创建成功
- [ ] Base URL 配置正确
- [ ] 超时设置生效
- [ ] 默认请求头正确
- [ ] withCredentials 配置正确

### 2. 请求拦截器测试

- [ ] 自动添加 Authorization Token
- [ ] 生成唯一的 Request ID
- [ ] 开发环境记录请求日志
- [ ] 请求参数正确传递
- [ ] 请求头正确设置

### 3. 响应拦截器测试

- [ ] 成功响应正确解包
- [ ] code !== 200/201 时抛出 ApiError
- [ ] HTTP 错误正确分类处理
- [ ] 401 错误清除 Token
- [ ] 开发环境记录响应日志
- [ ] 响应数据格式正确

### 4. API 方法测试

- [ ] getProducts 返回分页数据
- [ ] getProductById 返回商品详情
- [ ] createProduct 创建成功
- [ ] updateProduct 更新成功
- [ ] updateProductStatus 状态更新成功
- [ ] deleteProduct 删除成功
- [ ] 请求参数正确序列化
- [ ] 响应数据正确解析

### 5. 错误处理测试

- [ ] 网络错误抛出 ApiError
- [ ] 400 验证错误包含 fields
- [ ] 401 错误清除 Token
- [ ] 404 错误友好提示
- [ ] 500 错误友好提示
- [ ] ApiError 属性正确设置
- [ ] isValidationError() 判断正确
- [ ] getFieldErrors() 返回正确

### 6. 类型安全测试

- [ ] TypeScript 编译无错误
- [ ] 请求参数类型检查
- [ ] 响应数据类型检查
- [ ] IDE 智能提示正常
- [ ] 泛型参数正确推导

### 7. 环境变量测试

- [ ] 开发环境使用开发 API 地址
- [ ] 生产环境使用生产 API 地址
- [ ] VITE_API_BASE_URL 正确读取
- [ ] 缺失环境变量时使用默认值

### 8. 集成测试

- [ ] 完整请求流程：组件 → API → 后端
- [ ] 错误处理流程：后端错误 → ApiError → 组件
- [ ] 加载状态正确切换
- [ ] 数据正确渲染到组件
- [ ] 分页功能正常工作

---

## 附录

### API 配置常量

```typescript
// frontend/src/config/api.ts

/**
 * API 配置
 */
export const API_CONFIG = {
  /** 请求超时时间（毫秒） */
  TIMEOUT: 10000,
  
  /** 默认分页大小 */
  DEFAULT_PAGE_SIZE: 12,
  
  /** 最大分页大小 */
  MAX_PAGE_SIZE: 100,
  
  /** Token 存储键名 */
  TOKEN_STORAGE_KEY: 'auth_token',
  
  /** 请求重试次数 */
  RETRY_COUNT: 0,
} as const
```

### Axios 配置选项说明

```typescript
// 常用配置项
{
  baseURL: string           // API 基础 URL
  timeout: number           // 请求超时时间
  headers: object           // 自定义请求头
  withCredentials: boolean  // 是否携带凭证
  responseType: string      // 响应数据类型
  params: object            // URL 参数
  data: object              // 请求体数据
  validateStatus: function  // 自定义成功状态判断
  maxRedirects: number      // 最大重定向次数
  proxy: object | false     // 代理配置
}
```

### 最佳实践

✅ **推荐做法**：

1. **使用 API 服务层**
   ```typescript
   // ✅ 好
   const products = await productApi.getProducts(params)
   
   // ❌ 不好
   const products = await axios.get('/api/v1/products', { params })
   ```

2. **使用自定义 Hook**
   ```typescript
   // ✅ 好
   const { products, loading } = useProducts()
   
   // ❌ 不好：组件中直接调用 API
   const [products, setProducts] = useState([])
   useEffect(() => {
     productApi.getProducts().then(setProducts)
   }, [])
   ```

3. **统一的错误处理**
   ```typescript
   // ✅ 好
   catch (err) {
     if (err instanceof ApiError) {
       showError(err.message)
     }
   }
   
   // ❌ 不好
   catch (err) {
     console.error(err)
     alert('Error')
   }
   ```

❌ **避免做法**：

1. **不要在组件中直接使用 axios**
2. **不要硬编码 API URL**
3. **不要忘记错误处理**
4. **不要忽略 TypeScript 类型**
5. **不要在拦截器中修改响应数据（除非必要）**

### 相关资源

- [Axios 官方文档](https://axios-http.com/)
- [Axios 拦截器文档](https://axios-http.com/docs/interceptors)
- [TypeScript 泛型](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**相关模块**：
- 模块 10 - 商品 API 接口
- 模块 14 - 错误处理
- 模块 18 - 环境变量配置
- 模块 19 - TypeScript 类型定义

**下一步建议**：模块 02 - 商品列表页模块 或 模块 08 - 路由管理模块
