# 商品 API 接口模块规格说明书

## 模块概述

本模块负责定义商品相关的 RESTful API 接口，包括接口路径、HTTP 方法、请求参数、响应格式、状态码等。作为前后端交互的核心契约，API 接口设计直接影响前端开发效率和系统可维护性。

**设计原则**：
- RESTful 风格：遵循 REST 架构规范
- 统一响应格式：所有接口使用统一的响应结构
- 语义化路径：URL 路径清晰表达资源含义
- 版本控制：预留 API 版本管理支持
- 文档先行：接口定义先于实现

---

## 功能需求

### 核心需求

1. **商品查询接口**
   - 获取商品列表（支持分页、筛选、排序）
   - 获取单个商品详情

2. **商品管理接口**
   - 创建商品
   - 更新商品信息
   - 更新商品上下架状态
   - 删除商品

3. **接口规范**
   - 统一响应格式（code、message、data）
   - 统一错误处理
   - 请求参数验证
   - CORS 跨域支持

4. **性能优化**
   - 支持分页查询
   - 支持字段筛选（可选）
   - 合理的缓存策略（预留）

---

## 技术实现

### 技术选型

- **框架**: Express.js 4.x / Fastify 4.x（推荐 Express）
- **路由**: Express Router
- **参数验证**: Zod / Joi（推荐 Zod，与 TypeScript 集成更好）
- **API 文档**: Swagger / OpenAPI 3.0（可选）
- **日志**: Morgan（HTTP 请求日志）

### 为什么选择 Express？

✅ **优势**：
- 生态成熟，文档丰富
- 中间件生态完善
- 学习曲线平缓
- 社区活跃

⚠️ **注意**：
- 如需更高性能可考虑 Fastify
- 当前阶段 Express 完全满足需求

### 文件结构

```
backend/src/
├── routes/
│   ├── index.ts                 # 路由入口
│   └── product.routes.ts        # 商品路由定义
├── controllers/
│   └── product.controller.ts    # 控制器（模块12实现）
├── middleware/
│   ├── validate.ts              # 参数验证中间件
│   └── errorHandler.ts          # 错误处理中间件（模块14）
├── validators/
│   └── product.validator.ts     # 请求参数验证规则
├── app.ts                       # Express 应用配置
└── server.ts                    # 服务器启动入口
```

### 路由组织

```typescript
// backend/src/routes/index.ts
import { Router } from 'express'
import productRoutes from './product.routes'

const router = Router()

// API 版本前缀
router.use('/api/v1/products', productRoutes)

export default router
```

---

## API 接口定义

### 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

### 统一响应格式

#### 成功响应

```typescript
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

#### 分页响应

```typescript
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 100,
      "totalPages": 9,
      "hasPrev": false,
      "hasNext": true
    }
  }
}
```

#### 错误响应

```typescript
{
  "code": 400,
  "message": "参数验证失败",
  "error": "具体错误信息（开发环境）",
  "fields": {
    "name": ["商品名称不能为空"]
  }
}
```

---

## 接口清单

### 1. 获取商品列表

#### 基本信息

- **路径**: `GET /api/v1/products`
- **描述**: 获取商品列表，支持分页、筛选、排序
- **权限**: 公开（无需认证）

#### 请求参数（Query Parameters）

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例 |
|--------|------|------|--------|------|------|
| `page` | number | ❌ | 1 | 页码（从 1 开始） | `1` |
| `pageSize` | number | ❌ | 12 | 每页数量（1-100） | `12` |
| `keyword` | string | ❌ | - | 关键词搜索（商品名称） | `耳机` |
| `minPrice` | number | ❌ | - | 最低价格（元） | `100` |
| `maxPrice` | number | ❌ | - | 最高价格（元） | `500` |
| `status` | string | ❌ | - | 商品状态：on_sale / off_sale | `on_sale` |
| `sortBy` | string | ❌ | createdAt | 排序字段：price / createdAt / name | `price` |
| `sortOrder` | string | ❌ | desc | 排序方向：asc / desc | `asc` |

#### 请求示例

```http
GET /api/v1/products?page=1&pageSize=12&keyword=耳机&minPrice=100&maxPrice=500&status=on_sale&sortBy=price&sortOrder=asc
```

#### 响应示例（200 OK）

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "无线蓝牙耳机",
        "price": 299.99,
        "images": ["https://example.com/img1.jpg"],
        "status": "on_sale"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 50,
      "totalPages": 5,
      "hasPrev": false,
      "hasNext": true
    }
  }
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "参数验证失败",
  "fields": {
    "page": ["页码必须为正整数"],
    "pageSize": ["每页数量范围为 1-100"]
  }
}
```

---

### 2. 获取商品详情

#### 基本信息

- **路径**: `GET /api/v1/products/:id`
- **描述**: 根据商品 ID 获取完整商品信息
- **权限**: 公开（无需认证）

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string (UUID) | ✅ | 商品唯一标识 | `a1b2c3d4-e5f6-...` |

#### 请求示例

```http
GET /api/v1/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### 响应示例（200 OK）

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "无线蓝牙耳机",
    "price": 299.99,
    "description": "高品质无线蓝牙耳机，支持主动降噪...",
    "images": [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg"
    ],
    "status": "on_sale",
    "createdAt": "2026-05-29T10:00:00Z",
    "updatedAt": "2026-05-29T12:00:00Z"
  }
}
```

#### 错误响应（404 Not Found）

```json
{
  "code": 404,
  "message": "商品不存在"
}
```

---

### 3. 创建商品

#### 基本信息

- **路径**: `POST /api/v1/products`
- **描述**: 创建新商品
- **权限**: 管理员（预留认证接口）
- **Content-Type**: `application/json`

#### 请求体（Request Body）

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `name` | string | ✅ | 商品名称（1-200 字符） | `"无线蓝牙耳机"` |
| `price` | number | ✅ | 价格（元，0-999999.99） | `299.99` |
| `description` | string | ❌ | 商品描述（0-5000 字符） | `"高品质无线..."` |
| `images` | string[] | ❌ | 图片 URL 数组（最多 10 张） | `["https://..."]` |
| `status` | string | ❌ | 商品状态（默认 on_sale） | `"on_sale"` |

#### 请求示例

```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "无线蓝牙耳机",
  "price": 299.99,
  "description": "高品质无线蓝牙耳机，支持主动降噪",
  "images": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "status": "on_sale"
}
```

#### 响应示例（201 Created）

```json
{
  "code": 201,
  "message": "商品创建成功",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "无线蓝牙耳机",
    "price": 299.99,
    "description": "高品质无线蓝牙耳机，支持主动降噪",
    "images": [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg"
    ],
    "status": "on_sale",
    "createdAt": "2026-05-29T10:00:00Z",
    "updatedAt": "2026-05-29T10:00:00Z"
  }
}
```

#### 错误响应（400 Bad Request）

```json
{
  "code": 400,
  "message": "参数验证失败",
  "fields": {
    "name": ["商品名称长度为 1-200 字符"],
    "price": ["价格必须为 0-999999.99 元"]
  }
}
```

---

### 4. 更新商品

#### 基本信息

- **路径**: `PUT /api/v1/products/:id`
- **描述**: 更新商品信息（部分更新）
- **权限**: 管理员（预留认证接口）
- **Content-Type**: `application/json`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string (UUID) | ✅ | 商品唯一标识 | `a1b2c3d4-e5f6-...` |

#### 请求体（Request Body）

所有字段可选，仅更新提供的字段：

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `name` | string | ❌ | 商品名称（1-200 字符） | `"新款无线耳机"` |
| `price` | number | ❌ | 价格（元，0-999999.99） | `399.99` |
| `description` | string | ❌ | 商品描述（0-5000 字符） | `"升级版本..."` |
| `images` | string[] | ❌ | 图片 URL 数组（最多 10 张） | `["https://..."]` |
| `status` | string | ❌ | 商品状态：on_sale / off_sale | `"off_sale"` |

#### 请求示例

```http
PUT /api/v1/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Content-Type: application/json

{
  "name": "新款无线蓝牙耳机",
  "price": 399.99,
  "description": "2026 年升级版本，音质更出色"
}
```

#### 响应示例（200 OK）

```json
{
  "code": 200,
  "message": "商品更新成功",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "新款无线蓝牙耳机",
    "price": 399.99,
    "description": "2026 年升级版本，音质更出色",
    "images": [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg"
    ],
    "status": "on_sale",
    "createdAt": "2026-05-29T10:00:00Z",
    "updatedAt": "2026-05-29T15:00:00Z"
  }
}
```

#### 错误响应（404 Not Found）

```json
{
  "code": 404,
  "message": "商品不存在"
}
```

---

### 5. 更新商品状态

#### 基本信息

- **路径**: `PATCH /api/v1/products/:id/status`
- **描述**: 更新商品上下架状态
- **权限**: 管理员（预留认证接口）
- **Content-Type**: `application/json`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string (UUID) | ✅ | 商品唯一标识 | `a1b2c3d4-e5f6-...` |

#### 请求体（Request Body）

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `status` | string | ✅ | 商品状态：on_sale / off_sale | `"off_sale"` |

#### 请求示例

```http
PATCH /api/v1/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890/status
Content-Type: application/json

{
  "status": "off_sale"
}
```

#### 响应示例（200 OK）

```json
{
  "code": 200,
  "message": "商品状态更新成功",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "无线蓝牙耳机",
    "price": 299.99,
    "description": "高品质无线蓝牙耳机，支持主动降噪",
    "images": [
      "https://example.com/img1.jpg"
    ],
    "status": "off_sale",
    "createdAt": "2026-05-29T10:00:00Z",
    "updatedAt": "2026-05-29T16:00:00Z"
  }
}
```

#### 错误响应（400 Bad Request）

```json
{
  "code": 400,
  "message": "参数验证失败",
  "fields": {
    "status": ["状态值必须为 on_sale 或 off_sale"]
  }
}
```

---

### 6. 删除商品

#### 基本信息

- **路径**: `DELETE /api/v1/products/:id`
- **描述**: 删除指定商品
- **权限**: 管理员（预留认证接口）

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string (UUID) | ✅ | 商品唯一标识 | `a1b2c3d4-e5f6-...` |

#### 请求示例

```http
DELETE /api/v1/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### 响应示例（200 OK）

```json
{
  "code": 200,
  "message": "商品删除成功",
  "data": null
}
```

#### 错误响应（404 Not Found）

```json
{
  "code": 404,
  "message": "商品不存在"
}
```

---

## HTTP 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功（GET、PUT、PATCH） |
| 201 | Created | 资源创建成功（POST） |
| 400 | Bad Request | 请求参数错误 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

---

## 参数验证规则

### 使用 Zod 进行验证

```typescript
// backend/src/validators/product.validator.ts
import { z } from 'zod'

// 创建商品验证
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, '商品名称不能为空')
    .max(200, '商品名称不能超过 200 字符'),
  price: z
    .number()
    .min(0, '价格不能为负数')
    .max(99999999, '价格不能超过 999999.99 元'),
  description: z
    .string()
    .max(5000, '描述不能超过 5000 字符')
    .optional()
    .default(''),
  images: z
    .array(z.string().url('图片 URL 格式不正确'))
    .max(10, '最多只能上传 10 张图片')
    .optional()
    .default([]),
  status: z
    .enum(['on_sale', 'off_sale'])
    .optional()
    .default('on_sale'),
})

// 更新商品验证
export const updateProductSchema = createProductSchema.partial()

// 查询参数验证
export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, '页码必须为正整数'),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12))
    .refine((val) => val >= 1 && val <= 100, '每页数量范围为 1-100'),
  keyword: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  status: z.enum(['on_sale', 'off_sale']).optional(),
  sortBy: z.enum(['price', 'createdAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})
```

### 验证中间件

```typescript
// backend/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req[source])
      req[source] = validatedData // 替换为验证后的数据
      next()
    } catch (error: any) {
      if (error.errors) {
        const fields: Record<string, string[]> = {}
        error.errors.forEach((err: any) => {
          const field = err.path.join('.')
          if (!fields[field]) {
            fields[field] = []
          }
          fields[field].push(err.message)
        })
        
        res.status(400).json({
          code: 400,
          message: '参数验证失败',
          fields,
        })
      } else {
        next(error)
      }
    }
  }
}
```

---

## 路由定义示例

```typescript
// backend/src/routes/product.routes.ts
import { Router } from 'express'
import productController from '../controllers/product.controller'
import { validate } from '../middleware/validate'
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/product.validator'

const router = Router()

// GET /api/v1/products - 获取商品列表
router.get(
  '/',
  validate(productQuerySchema, 'query'),
  productController.getProducts
)

// GET /api/v1/products/:id - 获取商品详情
router.get(
  '/:id',
  productController.getProductById
)

// POST /api/v1/products - 创建商品
router.post(
  '/',
  validate(createProductSchema, 'body'),
  productController.createProduct
)

// PUT /api/v1/products/:id - 更新商品
router.put(
  '/:id',
  validate(updateProductSchema, 'body'),
  productController.updateProduct
)

// PATCH /api/v1/products/:id/status - 更新商品状态
router.patch(
  '/:id/status',
  productController.updateProductStatus
)

// DELETE /api/v1/products/:id - 删除商品
router.delete(
  '/:id',
  productController.deleteProduct
)

export default router
```

---

## 测试要点

### 1. 接口功能测试

- [ ] GET /products 列表查询正常
- [ ] GET /products/:id 详情查询正常
- [ ] POST /products 创建商品成功
- [ ] PUT /products/:id 更新商品成功
- [ ] PATCH /products/:id/status 更新状态成功
- [ ] DELETE /products/:id 删除商品成功

### 2. 参数验证测试

- [ ] 必填字段验证
- [ ] 数据类型验证
- [ ] 字符串长度验证
- [ ] 数值范围验证
- [ ] 枚举值验证
- [ ] URL 格式验证
- [ ] 无效参数返回 400 错误

### 3. 分页功能测试

- [ ] 默认分页参数正确
- [ ] 自定义页码正确
- [ ] 自定义每页数量正确
- [ ] 分页信息计算正确
- [ ] 超出范围页码处理

### 4. 筛选功能测试

- [ ] 关键词搜索正确
- [ ] 价格区间筛选正确
- [ ] 状态筛选正确
- [ ] 多条件组合筛选正确
- [ ] 无匹配结果返回空列表

### 5. 排序功能测试

- [ ] 按价格排序正确
- [ ] 按时间排序正确
- [ ] 按名称排序正确
- [ ] 升序/降序切换正确
- [ ] 默认排序正确

### 6. 错误处理测试

- [ ] 商品不存在返回 404
- [ ] 参数错误返回 400
- [ ] 服务器错误返回 500
- [ ] 错误响应格式统一
- [ ] 错误信息清晰友好

### 7. 边界情况测试

- [ ] 空数据库查询
- [ ] 单条数据查询
- [ ] 大量数据分页（>1000 条）
- [ ] 特殊字符输入
- [ ] 超长字符串输入
- [ ] 并发请求处理

### 8. 性能测试

- [ ] 列表查询响应时间 < 500ms
- [ ] 详情查询响应时间 < 200ms
- [ ] 分页查询性能（EXPLAIN 分析）
- [ ] 索引命中情况
- [ ] 并发请求处理能力

---

## 附录

### API 测试工具

**使用 Postman / Insomnia 测试**：

```bash
# 导入 OpenAPI 规范文件（如生成）
# 或手动创建请求集合
```

**使用 curl 测试**：

```bash
# 获取商品列表
curl -X GET "http://localhost:3000/api/v1/products?page=1&pageSize=12"

# 获取商品详情
curl -X GET "http://localhost:3000/api/v1/products/a1b2c3d4-e5f6-..."

# 创建商品
curl -X POST "http://localhost:3000/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "无线蓝牙耳机",
    "price": 299.99,
    "description": "高品质无线蓝牙耳机",
    "images": ["https://example.com/img1.jpg"],
    "status": "on_sale"
  }'

# 更新商品
curl -X PUT "http://localhost:3000/api/v1/products/a1b2c3d4-e5f6-..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新款无线蓝牙耳机",
    "price": 399.99
  }'

# 删除商品
curl -X DELETE "http://localhost:3000/api/v1/products/a1b2c3d4-e5f6-..."
```

### Swagger / OpenAPI 文档（可选）

```yaml
# 可使用 swagger-jsdoc 自动生成
openapi: 3.0.0
info:
  title: 商品 API
  version: 1.0.0
  description: 个人电商商品展示系统 API 文档
paths:
  /api/v1/products:
    get:
      summary: 获取商品列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 12
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedProductResponse'
```

### API 版本管理策略

**当前版本**: v1

**版本升级规则**：
- 向后兼容的修改：不升级版本号
- 破坏性修改：升级版本号（v2）
- 旧版本保留至少 6 个月

**版本路径**：
- `/api/v1/...` - 当前版本
- `/api/v2/...` - 未来版本（如需要）

### 相关资源

- [RESTful API 设计指南](https://restfulapi.net/)
- [HTTP 状态码规范](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)
- [Zod 文档](https://zod.dev/)
- [Express.js 文档](https://expressjs.com/)

---

**相关模块**：
- 模块 11 - 数据模型
- 模块 12 - 商品管理控制器
- 模块 14 - 错误处理
- 模块 15 - API 服务层（前端）
- 模块 19 - TypeScript 类型定义

**下一步建议**：模块 12 - 商品管理控制器
