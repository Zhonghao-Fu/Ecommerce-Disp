# 错误处理模块规格说明书

## 模块概述

本模块负责实现后端 API 的统一错误处理机制，包括自定义错误类、错误中间件、错误响应格式化和错误日志记录。通过集中化的错误处理，确保所有 API 接口返回一致的錯誤格式，提升前端错误处理效率，同时提供详细的错误日志便于调试和监控。

**设计原则**：
- 统一格式：所有错误返回相同的响应结构
- 分类处理：区分业务错误、验证错误、系统错误
- 安全优先：生产环境隐藏敏感错误信息
- 可追溯性：每个错误包含唯一请求 ID 和详细日志
- 用户体验：返回友好的错误提示信息

---

## 功能需求

### 核心需求

1. **自定义错误类**
   - 基础 AppError 类
   - 常见错误类型子类（NotFound、ValidationError 等）
   - 错误码和 HTTP 状态码映射
   - 操作错误 vs 编程错误区分

2. **错误中间件**
   - 全局错误捕获中间件
   - 异步错误处理支持
   - 错误日志记录
   - 错误响应格式化

3. **错误响应格式**
   - 统一 JSON 响应结构
   - 开发环境详细错误信息
   - 生产环境简化错误信息
   - 字段级验证错误

4. **错误日志**
   - 错误级别分类（error、warn、info）
   - 错误堆栈跟踪
   - 请求上下文信息
   - 日志格式化输出

5. **异步错误处理**
   - async/await 错误捕获
   - Promise rejection 处理
   - 未捕获异常处理

---

## 技术实现

### 技术选型

- **错误类**: 自定义 TypeScript 类
- **中间件**: Express 错误处理中间件
- **日志**: Winston（可选）或 console（当前阶段）
- **异步处理**: express-async-errors（可选）

### 文件结构

```
backend/src/
├── errors/
│   ├── AppError.ts              # 基础错误类
│   ├── errorTypes.ts            # 错误类型定义
│   └── errorCodes.ts            # 错误码常量
├── middleware/
│   ├── errorHandler.ts          # 错误处理中间件
│   └── asyncHandler.ts          # 异步错误处理器（可选）
├── utils/
│   └── logger.ts                # 日志工具
├── types/
│   └── error.ts                 # 错误相关类型
└── app.ts                       # Express 应用配置
```

---

## 错误类设计

### 1. 基础错误类（AppError）

```typescript
// backend/src/errors/AppError.ts

/**
 * 自定义应用错误基类
 */
export class AppError extends Error {
  /** HTTP 状态码 */
  public readonly statusCode: number
  
  /** 错误码（业务级别） */
  public readonly errorCode: string
  
  /** 是否为操作错误（可预期的业务错误） */
  public readonly isOperational: boolean
  
  /** 错误堆栈 */
  public readonly stack?: string
  
  /** 附加数据 */
  public readonly data?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational = true,
    data?: Record<string, unknown>
  ) {
    super(message)
    
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = isOperational
    this.data = data

    // 恢复原型链（TypeScript 继承内置类时需要）
    Object.setPrototypeOf(this, AppError.prototype)

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * 转换为 JSON 格式（用于日志）
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      stack: this.stack,
      data: this.data,
    }
  }
}
```

### 2. 常见错误类型

```typescript
// backend/src/errors/errorTypes.ts
import { AppError } from './AppError'

/**
 * 资源未找到错误（404）
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    id?: string,
    message?: string
  ) {
    const defaultMessage = id
      ? `${resource} not found: ${id}`
      : `${resource} not found`
    
    super(
      message || defaultMessage,
      404,
      'RESOURCE_NOT_FOUND',
      true,
      { resource, id }
    )
  }
}

/**
 * 验证错误（400）
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>

  constructor(
    message: string,
    fields: Record<string, string[]> = {}
  ) {
    super(message, 400, 'VALIDATION_ERROR', true, { fields })
    this.fields = fields
  }
}

/**
 * 业务逻辑错误（400）
 */
export class BusinessError extends AppError {
  constructor(
    message: string,
    errorCode = 'BUSINESS_ERROR',
    data?: Record<string, unknown>
  ) {
    super(message, 400, errorCode, true, data)
  }
}

/**
 * 认证错误（401）
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED', true)
  }
}

/**
 * 授权错误（403）
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'INSUFFICIENT_PERMISSIONS', true)
  }
}

/**
 * 冲突错误（409）
 */
export class ConflictError extends AppError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 409, 'RESOURCE_CONFLICT', true, data)
  }
}

/**
 * 限流错误（429）
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true)
  }
}

/**
 * 服务器内部错误（500）
 */
export class InternalError extends AppError {
  constructor(
    message = 'Internal server error',
    errorCode = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message, 500, errorCode, false)
  }
}

/**
 * 数据库错误（500）
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message || 'Database operation failed',
      500,
      'DATABASE_ERROR',
      false,
      { originalError: originalError?.message }
    )
  }
}
```

### 3. 错误码定义

```typescript
// backend/src/errors/errorCodes.ts

/**
 * 错误码常量
 */
export const ErrorCodes = {
  // 通用错误
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // 认证授权
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 商品相关
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_NAME_INVALID: 'PRODUCT_NAME_INVALID',
  PRODUCT_PRICE_INVALID: 'PRODUCT_PRICE_INVALID',
  PRODUCT_STATUS_INVALID: 'PRODUCT_STATUS_INVALID',
  PRODUCT_IMAGES_INVALID: 'PRODUCT_IMAGES_INVALID',
  
  // 数据库
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONSTRAINT_VIOLATION: 'DATABASE_CONSTRAINT_VIOLATION',
  
  // 限流
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // 冲突
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
} as const

/**
 * 错误码类型
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]
```

---

## 错误处理中间件

### 1. 全局错误处理中间件

```typescript
// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'
import { env } from '../config/env'

/**
 * 错误响应接口
 */
interface ErrorResponse {
  code: number
  message: string
  errorCode?: string
  error?: string
  stack?: string
  fields?: Record<string, string[]>
  data?: Record<string, unknown>
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 记录错误日志
  logError(err, req)

  // 判断错误类型
  if (err instanceof AppError) {
    // 自定义应用错误
    return handleAppError(err, res)
  }

  // Prisma 错误
  if (err.name === 'PrismaClientKnownRequestError') {
    return handlePrismaError(err, res)
  }

  // 其他未知错误
  return handleUnknownError(err, res)
}

/**
 * 处理应用错误
 */
function handleAppError(err: AppError, res: Response) {
  const response: ErrorResponse = {
    code: err.statusCode,
    message: err.message,
    errorCode: err.errorCode,
  }

  // 验证错误包含字段信息
  if (err.errorCode === 'VALIDATION_ERROR' && err.data?.fields) {
    response.fields = err.data.fields as Record<string, string[]>
  }

  // 开发环境返回详细错误信息
  if (env.nodeEnv === 'development') {
    response.error = err.message
    response.stack = err.stack
  }

  res.status(err.statusCode).json(response)
}

/**
 * 处理 Prisma 错误
 */
function handlePrismaError(err: any, res: Response) {
  const prismaError = err as any
  
  // 唯一约束违反
  if (prismaError.code === 'P2002') {
    return res.status(409).json({
      code: 409,
      message: '资源冲突：数据已存在',
      errorCode: 'DATABASE_CONSTRAINT_VIOLATION',
      fields: prismaError.meta?.target
        ? { [prismaError.meta.target]: ['该值已存在'] }
        : undefined,
    })
  }
  
  // 记录不存在
  if (prismaError.code === 'P2025') {
    return res.status(404).json({
      code: 404,
      message: '资源不存在',
      errorCode: 'RESOURCE_NOT_FOUND',
    })
  }
  
  // 其他 Prisma 错误
  return res.status(500).json({
    code: 500,
    message: '数据库操作失败',
    errorCode: 'DATABASE_ERROR',
    error: env.nodeEnv === 'development' ? err.message : undefined,
  })
}

/**
 * 处理未知错误
 */
function handleUnknownError(err: Error, res: Response) {
  // 生产环境隐藏错误详情
  const isDevelopment = env.nodeEnv === 'development'
  
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    errorCode: 'INTERNAL_SERVER_ERROR',
    error: isDevelopment ? err.message : undefined,
    stack: isDevelopment ? err.stack : undefined,
  })
}

/**
 * 记录错误日志
 */
function logError(err: Error, req: Request) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
    requestId: req.headers['x-request-id'],
  }

  // 错误级别日志
  if (err instanceof AppError && err.isOperational) {
    // 操作错误（可预期）- warn 级别
    console.warn('⚠️  Operational Error:', JSON.stringify(logData, null, 2))
  } else {
    // 系统错误（不可预期）- error 级别
    console.error('❌ System Error:', JSON.stringify(logData, null, 2))
  }
}
```

### 2. 异步错误处理器

```typescript
// backend/src/middleware/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * 异步路由处理器包装器
 * 自动捕获 async/await 错误并传递给错误处理中间件
 */
export const asyncHandler = (
  fn: RequestHandler | ((req: Request, res: Response, next: NextFunction) => Promise<any>)
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 使用示例：
 * 
 * // 不使用 asyncHandler
 * router.get('/', async (req, res, next) => {
 *   try {
 *     // ...
 *   } catch (error) {
 *     next(error)
 *   }
 * })
 * 
 * // 使用 asyncHandler（推荐）
 * router.get('/', asyncHandler(async (req, res) => {
 *   // 错误自动传递，无需 try-catch
 *   // ...
 * }))
 */
```

### 3. 未捕获异常处理

```typescript
// backend/src/app.ts
import express from 'express'
import { errorHandler } from './middleware/errorHandler'
import { env } from './config/env'

const app = express()

// ... 其他中间件和路由 ...

// 错误处理中间件（必须在最后）
app.use(errorHandler)

// 未捕获的 Promise Rejection
process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Promise Rejection:', reason)
  
  // 可选：关闭进程
  // process.exit(1)
})

// 未捕获的异常
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error)
  
  // 优雅关闭
  gracefulShutdown(error)
})

/**
 * 优雅关闭
 */
function gracefulShutdown(error?: Error) {
  console.log('🛑 Shutting down gracefully...')
  
  // 关闭数据库连接
  // 关闭 HTTP 服务器
  // 清理资源
  
  process.exit(error ? 1 : 0)
}

export default app
```

---

## 错误响应格式

### 1. 成功响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 2. 错误响应格式（通用）

```json
{
  "code": 400,
  "message": "参数验证失败",
  "errorCode": "VALIDATION_ERROR"
}
```

### 3. 验证错误响应

```json
{
  "code": 400,
  "message": "参数验证失败",
  "errorCode": "VALIDATION_ERROR",
  "fields": {
    "name": ["商品名称不能为空"],
    "price": ["价格必须为 0-999999.99 元"]
  }
}
```

### 4. 资源未找到错误

```json
{
  "code": 404,
  "message": "Product not found: a1b2c3d4-e5f6-...",
  "errorCode": "RESOURCE_NOT_FOUND"
}
```

### 5. 业务逻辑错误

```json
{
  "code": 400,
  "message": "价格必须为 0-999999.99 元",
  "errorCode": "PRODUCT_PRICE_INVALID"
}
```

### 6. 数据库错误

```json
{
  "code": 500,
  "message": "数据库操作失败",
  "errorCode": "DATABASE_ERROR"
}
```

### 7. 服务器内部错误（开发环境）

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "errorCode": "INTERNAL_SERVER_ERROR",
  "error": "Cannot read property 'id' of undefined",
  "stack": "TypeError: Cannot read property 'id'...\n    at ..."
}
```

### 8. 服务器内部错误（生产环境）

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "errorCode": "INTERNAL_SERVER_ERROR"
}
```

---

## 错误使用示例

### 1. 在控制器中使用

```typescript
// backend/src/controllers/product.controller.ts
import { asyncHandler } from '../middleware/asyncHandler'
import { NotFoundError, BusinessError } from '../errors/errorTypes'

export class ProductController {
  /**
   * 获取商品详情
   */
  getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params
    
    const product = await prisma.product.findUnique({ where: { id } })
    
    if (!product) {
      throw new NotFoundError('Product', id)
    }
    
    res.json({ code: 200, message: 'success', data: product })
  })

  /**
   * 创建商品
   */
  createProduct = asyncHandler(async (req, res) => {
    const { price } = req.body
    
    if (price < 0 || price > 999999.99) {
      throw new BusinessError(
        '价格必须为 0-999999.99 元',
        'PRODUCT_PRICE_INVALID'
      )
    }
    
    // ...
  })
}
```

### 2. 在验证中间件中使用

```typescript
// backend/src/middleware/validate.ts
import { ValidationError } from '../errors/errorTypes'

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error: any) {
      if (error.errors) {
        const fields: Record<string, string[]> = {}
        error.errors.forEach((err: any) => {
          const field = err.path.join('.')
          if (!fields[field]) fields[field] = []
          fields[field].push(err.message)
        })
        
        throw new ValidationError('参数验证失败', fields)
      }
      next(error)
    }
  }
}
```

### 3. 在路由中使用

```typescript
// backend/src/routes/product.routes.ts
import { Router } from 'express'
import productController from '../controllers/product.controller'

const router = Router()

// asyncHandler 已包装，无需 try-catch
router.get('/:id', productController.getProductById)
router.post('/', productController.createProduct)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)

export default router
```

---

## 错误日志规范

### 1. 日志级别

```typescript
// 错误级别定义
enum LogLevel {
  ERROR = 'error',    // 系统错误，需要立即处理
  WARN = 'warn',      // 警告，可能的问题
  INFO = 'info',      // 信息，正常操作
  DEBUG = 'debug',    // 调试，开发环境使用
}
```

### 2. 日志格式

```typescript
{
  "timestamp": "2026-05-30T10:30:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "method": "GET",
  "url": "/api/v1/products",
  "statusCode": 500,
  "errorCode": "DATABASE_ERROR",
  "requestId": "req_abc123",
  "userId": "user_456", // 如果已登录
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "stack": "Error: ...\n    at ..."
}
```

### 3. 日志输出

```typescript
// 开发环境：控制台彩色输出
console.error('❌ [ERROR]', message)
console.warn('⚠️  [WARN]', message)
console.info('ℹ️  [INFO]', message)

// 生产环境：JSON 格式（便于日志收集系统解析）
console.log(JSON.stringify(logEntry))
```

---

## 测试要点

### 1. 错误类测试

- [ ] AppError 基类创建成功
- [ ] NotFoundError 返回 404
- [ ] ValidationError 返回 400
- [ ] BusinessError 返回 400
- [ ] AuthenticationError 返回 401
- [ ] AuthorizationError 返回 403
- [ ] InternalError 返回 500
- [ ] 错误码正确设置
- [ ] isOperational 标记正确

### 2. 错误中间件测试

- [ ] 捕获 AppError 并返回正确格式
- [ ] 捕获未知错误返回 500
- [ ] 捕获 Prisma 错误并转换
- [ ] 开发环境返回详细错误信息
- [ ] 生产环境隐藏敏感信息
- [ ] 错误日志记录正确
- [ ] 响应状态码正确

### 3. 验证错误测试

- [ ] 字段级验证错误返回 fields 对象
- [ ] 多个字段错误正确聚合
- [ ] 验证错误消息清晰
- [ ] 验证错误返回 400

### 4. 异步错误测试

- [ ] asyncHandler 正确捕获错误
- [ ] 异步错误传递到中间件
- [ ] Promise rejection 不会崩溃
- [ ] 未捕获异常正确处理

### 5. 响应格式测试

- [ ] 所有错误返回 code 字段
- [ ] 所有错误返回 message 字段
- [ ] 所有错误返回 errorCode 字段
- [ ] 错误响应 JSON 格式正确
- [ ] Content-Type 为 application/json

### 6. 环境差异测试

- [ ] 开发环境包含 error 字段
- [ ] 开发环境包含 stack 字段
- [ ] 生产环境不包含 error 字段
- [ ] 生产环境不包含 stack 字段
- [ ] 生产环境不泄露敏感信息

### 7. 日志测试

- [ ] 操作错误使用 warn 级别
- [ ] 系统错误使用 error 级别
- [ ] 日志包含请求信息
- [ ] 日志包含错误堆栈
- [ ] 日志格式正确（JSON 或彩色）

### 8. 边界情况测试

- [ ] 错误消息为空字符串
- [ ] 错误消息包含特殊字符
- [ ] 嵌套错误对象
- [ ] 循环引用错误
- [ ] 超大错误消息
- [ ] 并发错误处理

### 9. 集成测试

- [ ] 控制器抛出错误 → 中间件捕获 → 返回响应
- [ ] 验证中间件错误 → 错误处理中间件
- [ ] Prisma 错误 → 转换为 AppError
- [ ] 404 路由 → 自定义 404 错误
- [ ] 未处理路由 → 404 错误

---

## 附录

### 错误处理流程图

```
请求进入
  ↓
路由处理器
  ↓ 抛出错误（throw new AppError）
  ↓ 或异步错误（Promise reject）
  ↓
asyncHandler 捕获
  ↓
传递到错误处理中间件
  ↓
判断错误类型
  ├─ AppError → handleAppError
  ├─ PrismaError → handlePrismaError
  └─ UnknownError → handleUnknownError
  ↓
记录日志
  ↓
格式化响应
  ↓
返回 JSON 响应
```

### 最佳实践

✅ **推荐做法**：

1. **使用自定义错误类**
   ```typescript
   throw new NotFoundError('Product', id)
   ```

2. **使用 asyncHandler 包装**
   ```typescript
   router.get('/', asyncHandler(async (req, res) => { ... }))
   ```

3. **区分操作错误和系统错误**
   ```typescript
   isOperational: true  // 业务错误
   isOperational: false // 系统错误
   ```

4. **生产环境隐藏敏感信息**
   ```typescript
   if (env.nodeEnv === 'production') {
     delete response.stack
   }
   ```

5. **提供清晰的错误消息**
   ```typescript
   // ❌ 不好
   throw new Error('Error occurred')
   
   // ✅ 好
   throw new ValidationError('商品名称长度为 1-200 字符')
   ```

❌ **避免做法**：

1. **不要直接 res.status(500).json()**
   ```typescript
   // ❌ 不统一
   res.status(500).json({ error: 'Something went wrong' })
   
   // ✅ 使用错误类
   throw new InternalError('Something went wrong')
   ```

2. **不要忘记错误处理**
   ```typescript
   // ❌ 错误会被忽略
   router.get('/', async (req, res) => { ... })
   
   // ✅ 使用 asyncHandler
   router.get('/', asyncHandler(async (req, res) => { ... }))
   ```

3. **不要在生产环境泄露堆栈**
   ```typescript
   // ❌ 危险
   res.status(500).json({ stack: error.stack })
   
   // ✅ 安全
   if (env.nodeEnv === 'development') {
     response.stack = error.stack
   }
   ```

### 错误码命名规范

- 使用大写字母和下划线：`RESOURCE_NOT_FOUND`
- 使用业务前缀分组：`PRODUCT_*`、`AUTH_*`
- 描述性命名，避免缩写
- 保持一致性

### 相关资源

- [Express 错误处理文档](https://expressjs.com/en/guide/error-handling.html)
- [Node.js 错误处理最佳实践](https://nodejs.org/en/docs/guides/error-handling/)
- [HTTP 状态码规范](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)
- [Winston 日志库](https://github.com/winstonjs/winston)

---

**相关模块**：
- 模块 10 - 商品 API 接口
- 模块 12 - 商品管理控制器
- 模块 13 - 跨域配置
- 模块 18 - 环境变量配置

**下一步建议**：模块 15 - API 服务层（前端）
