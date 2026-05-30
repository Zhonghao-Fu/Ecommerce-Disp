# 跨域配置模块规格说明书

## 模块概述

本模块负责配置和管理后端 API 的 CORS（Cross-Origin Resource Sharing，跨域资源共享）策略。由于前端和后端运行在不同的端口（前端 localhost:3000，后端 localhost:4000），浏览器的同源策略会阻止跨域请求。CORS 配置允许前端安全地访问后端 API，同时防止未经授权的域名访问。

**设计原则**：
- 安全优先：仅允许信任的域名访问
- 环境隔离：开发和生产环境使用不同的 CORS 策略
- 最小权限：仅开放必要的 HTTP 方法和请求头
- 配置灵活：通过环境变量管理，便于部署

---

## 功能需求

### 核心需求

1. **跨域请求支持**
   - 允许前端域名访问后端 API
   - 支持预检请求（OPTIONS）
   - 支持携带凭证（Cookies）

2. **环境配置**
   - 开发环境：允许 localhost 访问
   - 生产环境：仅允许正式域名访问
   - 支持多域名配置

3. **HTTP 方法控制**
   - 允许 GET、POST、PUT、PATCH、DELETE
   - 禁止不安全的 HTTP 方法

4. **请求头控制**
   - 允许常用的请求头（Content-Type、Authorization 等）
   - 暴露必要的响应头

5. **凭证支持**
   - 支持携带 Cookies（如需要）
   - 凭证模式下的安全限制

---

## 技术实现

### 技术选型

- **中间件**: cors（Express 官方推荐）
- **版本**: cors 2.8.5+
- **配置方式**: 环境变量驱动
- **类型支持**: @types/cors

### 为什么选择 cors 中间件？

✅ **优势**：
- Express 官方推荐，稳定可靠
- 配置简单，API 清晰
- 支持动态域名配置
- 自动处理预检请求
- 类型定义完善

### 文件结构

```
backend/src/
├── config/
│   ├── cors.ts                # CORS 配置模块
│   └── env.ts                 # 环境变量（已在模块18定义）
├── middleware/
│   └── cors.middleware.ts     # CORS 中间件封装（可选）
├── app.ts                     # Express 应用配置
└── server.ts                  # 服务器启动入口
```

### 安装依赖

```bash
# 安装 cors 中间件和类型定义
npm install cors
npm install -D @types/cors
```

---

## CORS 配置实现

### 1. 基础配置

```typescript
// backend/src/config/cors.ts
import { CorsOptions } from 'cors'
import { env } from './env'

/**
 * CORS 配置选项
 */
export const corsOptions: CorsOptions = {
  // 允许的源（域名）
  origin: getCorsOrigin(),
  
  // 允许的 HTTP 方法
  methods: getCorsMethods(),
  
  // 允许的请求头
  allowedHeaders: getCorsAllowedHeaders(),
  
  // 暴露的响应头
  exposedHeaders: ['X-Request-Id', 'X-Total-Count'],
  
  // 是否允许携带凭证（Cookies、Authorization）
  credentials: true,
  
  // 预检请求缓存时间（秒）
  maxAge: 86400, // 24 小时
}

/**
 * 获取允许的源列表
 */
function getCorsOrigin(): string | RegExp | Array<string | RegExp> | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  const originStr = env.corsOrigin
  
  // 开发环境：允许所有 localhost
  if (env.nodeEnv === 'development') {
    // 支持多个开发环境端口
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ]
    
    // 如果环境变量包含多个域名（逗号分隔）
    if (originStr.includes(',')) {
      return originStr.split(',').map(o => o.trim()).concat(devOrigins)
    }
    
    return devOrigins
  }
  
  // 生产环境：严格验证域名
  if (env.nodeEnv === 'production') {
    const allowedOrigins = originStr.split(',').map(o => o.trim())
    
    // 返回验证函数
    return (origin, callback) => {
      if (!origin) {
        // 非浏览器请求（如 curl、Postman）
        callback(null, true)
        return
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`))
      }
    }
  }
  
  // 测试环境：允许所有
  if (env.nodeEnv === 'test') {
    return '*'
  }
  
  // 默认：单个域名
  return originStr
}

/**
 * 获取允许的 HTTP 方法
 */
function getCorsMethods(): string[] {
  return env.corsMethods.split(',').map(m => m.trim())
}

/**
 * 获取允许的请求头
 */
function getCorsAllowedHeaders(): string[] {
  return [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Request-Id',
  ]
}
```

### 2. 环境变量配置

```env
# backend/.env.development
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS

# backend/.env.production
CORS_ORIGIN=https://myshop.com,https://www.myshop.com
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
```

### 3. 在 Express 中应用

```typescript
// backend/src/app.ts
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// 全局中间件
app.use(cors(corsOptions)) // CORS 中间件（必须在路由之前）
app.use(express.json()) // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })) // 解析 URL 编码的请求体

// 路由
app.use('/api/v1', routes)

// 错误处理（必须在最后）
app.use(errorHandler)

export default app
```

### 4. 动态域名验证（高级）

```typescript
// 支持通配符或正则表达式
function getCorsOrigin(): (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void {
  const originStr = env.corsOrigin
  const allowedOrigins = originStr.split(',').map(o => o.trim())
  
  // 开发环境允许 localhost 通配
  const localhostPattern = /^https?:\/\/localhost:\d+$/
  
  return (origin, callback) => {
    if (!origin) {
      // 服务器端请求（如 SSR、爬虫）
      callback(null, true)
      return
    }
    
    // 开发环境：允许 localhost
    if (env.nodeEnv === 'development' && localhostPattern.test(origin)) {
      callback(null, true)
      return
    }
    
    // 生产环境：严格匹配
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      // 记录非法访问尝试
      console.warn(`CORS blocked request from: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  }
}
```

---

## 配置项详解

### 1. origin（允许的源）

**类型**: `string | boolean | RegExp | Array<string | RegExp> | Function`

**示例**：

```typescript
// 单个域名
origin: 'https://myshop.com'

// 多个域名
origin: ['https://myshop.com', 'https://www.myshop.com']

// 允许所有（不推荐生产环境）
origin: true

// 禁止所有
origin: false

// 正则表达式
origin: /^https:\/\/.*\.myshop\.com$/

// 动态验证函数
origin: (origin, callback) => {
  if (allowedOrigins.includes(origin)) {
    callback(null, true)
  } else {
    callback(new Error('Not allowed'))
  }
}
```

### 2. methods（允许的 HTTP 方法）

**类型**: `string | string[]`

**默认值**: `['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']`

**说明**：
- `OPTIONS` 是预检请求必需的方法
- 仅开放业务需要的 HTTP 方法
- 避免开放 `TRACE`、`CONNECT` 等危险方法

### 3. allowedHeaders（允许的请求头）

**类型**: `string | string[]`

**推荐配置**：
```typescript
allowedHeaders: [
  'Content-Type',        // POST/PUT 请求体类型
  'Authorization',       // JWT 认证令牌
  'X-Requested-With',    // AJAX 请求标识
  'Accept',              // 接受的响应格式
  'Origin',              // 请求源
  'X-Request-Id',        // 请求追踪 ID
]
```

### 4. exposedHeaders（暴露的响应头）

**类型**: `string | string[]`

**说明**：
- 默认情况下，浏览器只能访问部分标准响应头
- 如需访问自定义响应头，必须在此声明
- 例如：分页总数、请求 ID 等

**示例**：
```typescript
exposedHeaders: ['X-Total-Count', 'X-Request-Id', 'X-RateLimit-Limit']
```

### 5. credentials（凭证支持）

**类型**: `boolean`

**默认值**: `false`

**说明**：
- 设置为 `true` 允许携带 Cookies 和 Authorization 头
- 设置为 `true` 时，`origin` 不能为 `'*'`
- 前端也需要设置 `withCredentials: true`

**前端配置示例**：
```typescript
// frontend/src/api/http.ts
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 允许携带凭证
})
```

### 6. maxAge（预检请求缓存时间）

**类型**: `number`

**单位**: 秒

**推荐值**: `86400`（24 小时）

**说明**：
- 浏览器会缓存 OPTIONS 预检请求的结果
- 缓存期间发送实际请求时无需再次预检
- 减少网络开销，提升性能

---

## 安全策略

### 1. 生产环境安全配置

✅ **必须做到**：

```typescript
// 严格域名验证
origin: ['https://myshop.com', 'https://www.myshop.com']

// 仅开放必要的 HTTP 方法
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// 明确允许的请求头
allowedHeaders: ['Content-Type', 'Authorization']

// 允许凭证（如需要）
credentials: true

// 记录非法访问
origin: (origin, callback) => {
  if (!allowedOrigins.includes(origin)) {
    console.warn(`CORS blocked: ${origin}`)
    callback(new Error('Not allowed'))
  } else {
    callback(null, true)
  }
}
```

❌ **禁止做法**：

```typescript
// ❌ 允许所有域名（生产环境）
origin: '*'

// ❌ 允许所有方法
methods: '*'

// ❌ 允许所有请求头
allowedHeaders: '*'

// ❌ origin 为 '*' 时还允许凭证
origin: '*'
credentials: true // 这会报错！
```

### 2. 开发环境宽松配置

```typescript
// 开发环境可以宽松一些
if (env.nodeEnv === 'development') {
  return {
    origin: true, // 允许所有
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }
}
```

### 3. 常见安全威胁

#### 威胁 1：恶意网站跨域请求

**场景**：用户在恶意网站登录了你的系统，该网站尝试通过 AJAX 调用你的 API。

**防护**：
- 严格限制 `origin` 白名单
- 使用 CSRF Token（如需要）
- 敏感操作使用 POST 而非 GET

#### 威胁 2：子域名攻击

**场景**：攻击者控制了 `evil.myshop.com`，尝试访问 `api.myshop.com`。

**防护**：
- 不要使用通配符子域名：`*.myshop.com`
- 明确列出允许的子域名

#### 威胁 3：预检请求绕过

**场景**：某些简单请求（GET、POST）不会触发预检，可能被绕过。

**防护**：
- 服务端仍需要验证请求来源
- 使用认证机制（JWT、Session）
- 敏感操作需要额外验证

### 4. CORS 错误排查

**常见错误**：

```
Access to XMLHttpRequest at 'http://localhost:4000/api/v1/products' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**排查步骤**：

1. **检查后端 CORS 中间件是否启用**
   ```typescript
   app.use(cors(corsOptions)) // 必须在路由之前
   ```

2. **检查 origin 配置是否正确**
   ```typescript
   console.log('CORS Origin:', env.corsOrigin)
   ```

3. **检查预检请求是否成功**
   - 打开浏览器开发者工具 → Network
   - 查看 OPTIONS 请求的响应状态码（应为 204）
   - 检查响应头是否包含 `Access-Control-Allow-Origin`

4. **检查凭证配置**
   ```typescript
   // 后端
   credentials: true
   
   // 前端
   withCredentials: true
   ```

5. **检查允许的 HTTP 方法**
   ```typescript
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
   ```

---

## 测试要点

### 1. 基础功能测试

- [ ] 允许配置的域名访问
- [ ] 拒绝未配置的域名访问
- [ ] OPTIONS 预检请求返回 204
- [ ] 预检请求包含正确的响应头
- [ ] 实际请求包含正确的响应头

### 2. 开发环境测试

- [ ] localhost:3000 可以访问
- [ ] localhost:3001 可以访问
- [ ] 127.0.0.1:3000 可以访问
- [ ] 携带 Cookies 可以访问
- [ ] 所有 HTTP 方法都可以使用

### 3. 生产环境测试

- [ ] 配置的正式域名可以访问
- [ ] 未配置的域名被拒绝
- [ ] localhost 被拒绝（除非配置）
- [ ] 非法访问记录日志
- [ ] 预检请求缓存生效

### 4. HTTP 方法测试

- [ ] GET 请求允许
- [ ] POST 请求允许
- [ ] PUT 请求允许
- [ ] PATCH 请求允许
- [ ] DELETE 请求允许
- [ ] OPTIONS 预检请求允许
- [ ] TRACE 请求拒绝（如配置）

### 5. 请求头测试

- [ ] Content-Type 请求头允许
- [ ] Authorization 请求头允许
- [ ] X-Requested-With 请求头允许
- [ ] 自定义请求头需要配置
- [ ] 未配置的请求头被拒绝

### 6. 凭证测试

- [ ] 携带 Cookies 请求成功
- [ ] Authorization 头请求成功
- [ ] credentials: true 时 origin 不为 '*'
- [ ] 前端 withCredentials 配置正确

### 7. 跨域错误测试

- [ ] 未授权域名访问返回 CORS 错误
- [ ] 浏览器控制台显示清晰错误信息
- [ ] 后端记录非法访问日志
- [ ] 错误信息不包含敏感信息

### 8. 性能测试

- [ ] 预检请求缓存生效（maxAge）
- [ ] 缓存期间不重复发送 OPTIONS 请求
- [ ] 响应头大小合理
- [ ] CORS 中间件性能开销可忽略

### 9. 边界情况测试

- [ ] origin 为空字符串
- [ ] origin 为 undefined
- [ ] 多个域名逗号分隔
- [ ] 域名包含端口号
- [ ] HTTPS 和 HTTP 混合
- [ ] 域名带 www 和不带 www

---

## 附录

### CORS 响应头说明

```http
# 允许的来源
Access-Control-Allow-Origin: http://localhost:3000

# 允许的方法
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS

# 允许的请求头
Access-Control-Allow-Headers: Content-Type,Authorization

# 暴露的响应头
Access-Control-Expose-Headers: X-Total-Count,X-Request-Id

# 允许携带凭证
Access-Control-Allow-Credentials: true

# 预检请求缓存时间
Access-Control-Max-Age: 86400
```

### 前端配置示例

#### Axios 配置

```typescript
// frontend/src/api/http.ts
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 允许携带凭证
})

// 请求拦截器
http.interceptors.request.use((config) => {
  // 添加认证头
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default http
```

#### Fetch API 配置

```typescript
// 使用 Fetch API
const response = await fetch('http://localhost:4000/api/v1/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  credentials: 'include', // 允许携带凭证
})
```

### 调试工具

#### 使用 curl 测试 CORS

```bash
# 测试预检请求
curl -X OPTIONS http://localhost:4000/api/v1/products \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# 测试实际请求
curl -X GET http://localhost:4000/api/v1/products \
  -H "Origin: http://localhost:3000" \
  -v
```

#### 浏览器开发者工具

1. **Network 面板**：
   - 查看 OPTIONS 预检请求
   - 检查请求头和响应头
   - 确认状态码为 204

2. **Console 面板**：
   - 查看 CORS 错误信息
   - 确认错误原因

3. **Application 面板**：
   - 查看 Cookies 是否正确发送

### 常见问题 FAQ

**Q1: 为什么需要 OPTIONS 预检请求？**

A: 当请求满足以下条件之一时，浏览器会先发送 OPTIONS 请求：
- 使用非简单方法（PUT、DELETE、PATCH 等）
- 包含非简单请求头（Content-Type: application/json）
- 携带凭证（credentials: true）

**Q2: credentials: true 时为什么 origin 不能为 '*'？**

A: 这是浏览器的安全限制。允许所有域名携带凭证会带来严重的安全风险，必须明确指定允许的域名。

**Q3: 如何在生产环境调试 CORS 问题？**

A: 
- 临时添加多个测试域名到白名单
- 开启详细的日志记录
- 使用浏览器开发者工具查看网络请求
- 使用 curl 模拟请求测试

**Q4: CORS 和 CSRF 有什么区别？**

A:
- CORS 是浏览器的同源策略限制，保护用户数据不被跨域读取
- CSRF 是攻击者利用用户已登录状态发起恶意请求
- CORS 不能防止 CSRF，需要额外的 CSRF Token 机制

### 相关资源

- [MDN CORS 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [cors npm 包](https://www.npmjs.com/package/cors)
- [Express CORS 配置指南](https://expressjs.com/en/resources/middleware/cors.html)
- [CORS 安全最佳实践](https://portswigger.net/web-security/cors)

---

**相关模块**：
- 模块 10 - 商品 API 接口
- 模块 14 - 错误处理
- 模块 18 - 环境变量配置
- 模块 15 - API 服务层（前端）

**下一步建议**：模块 14 - 错误处理
