# 商品管理控制器模块规格说明书

## 模块概述

本模块负责实现商品相关的业务逻辑，作为 API 路由层和数据模型层的中间层。控制器接收来自路由的请求，调用 Prisma ORM 进行数据库操作，处理业务逻辑，并返回标准化的响应数据。控制器是后端核心业务逻辑的集中地，确保数据一致性、完整性和安全性。

**设计原则**：
- 职责单一：仅处理业务逻辑，不包含路由定义和数据库操作细节
- 错误处理：统一捕获和处理异常，返回友好错误信息
- 数据转换：负责数据库模型与 API 响应格式之间的转换
- 类型安全：充分利用 TypeScript 类型系统，避免运行时错误
- 可测试性：业务逻辑独立，便于单元测试

---

## 功能需求

### 核心需求

1. **商品查询业务**
   - 商品列表查询（分页、筛选、排序）
   - 单个商品详情查询
   - 查询参数处理和验证
   - 默认上架商品过滤

2. **商品创建业务**
   - 接收创建参数
   - 数据格式转换（价格元转分、图片数组转 JSON）
   - 创建商品记录
   - 返回创建结果

3. **商品更新业务**
   - 部分更新支持
   - 数据格式转换
   - 更新记录不存在时抛出错误
   - 自动更新 updatedAt 字段

4. **商品状态管理**
   - 上下架状态切换
   - 状态值验证
   - 单独的状态更新接口

5. **商品删除业务**
   - 根据 ID 删除商品
   - 删除不存在的商品时抛出错误

---

## 技术实现

### 技术选型

- **运行时**: Node.js 18+
- **框架**: Express.js 4.x
- **ORM**: Prisma 5.x
- **语言**: TypeScript 5.x
- **错误处理**: 自定义 AppError 类

### 文件结构

```
backend/src/
├── controllers/
│   ├── product.controller.ts      # 商品控制器主文件
│   └── base.controller.ts         # 基础控制器（可选，提供通用方法）
├── services/
│   └── product.service.ts         # 商品服务层（业务逻辑封装，可选）
├── utils/
│   ├── price.ts                   # 价格转换工具
│   └── json.ts                    # JSON 处理工具
├── errors/
│   ├── AppError.ts                # 自定义错误类
│   └── errorCodes.ts              # 错误码定义
└── types/
    └── product.ts                 # 商品相关类型（已在模块19定义）
```

### 控制器 vs 服务层

**当前阶段**：直接在控制器中实现业务逻辑（简洁优先）

**后续扩展**：如业务逻辑复杂，可提取服务层：
```
Controller（请求处理） → Service（业务逻辑） → Prisma（数据访问）
```

---

## 核心实现

### 1. 工具函数

#### 价格转换工具

```typescript
// backend/src/utils/price.ts

/**
 * 元转分（避免浮点数精度问题）
 * @param yuan 价格（元）
 * @returns 价格（分）
 */
export function yuanToCents(yuan: number): number {
  return Math.round(yuan * 100)
}

/**
 * 分转元（用于 API 响应）
 * @param cents 价格（分）
 * @returns 价格（元）
 */
export function centsToYuan(cents: number): number {
  return cents / 100
}

/**
 * 验证价格范围
 * @param yuan 价格（元）
 * @returns 是否有效
 */
export function isValidPrice(yuan: number): boolean {
  return yuan >= 0 && yuan <= 999999.99
}
```

#### JSON 处理工具

```typescript
// backend/src/utils/json.ts

/**
 * 安全解析 JSON 字符串
 * @param jsonStr JSON 字符串
 * @param fallback 解析失败时的默认值
 * @returns 解析结果
 */
export function safeJsonParse<T>(jsonStr: string, fallback: T): T {
  try {
    return JSON.parse(jsonStr) as T
  } catch {
    return fallback
  }
}

/**
 * 安全序列化数据为 JSON
 * @param data 数据对象
 * @returns JSON 字符串
 */
export function safeJsonStringify(data: unknown): string {
  try {
    return JSON.stringify(data)
  } catch {
    return 'null'
  }
}
```

### 2. 自定义错误类

```typescript
// backend/src/errors/AppError.ts

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  /** HTTP 状态码 */
  public statusCode: number
  /** 错误码 */
  public errorCode: string
  /** 是否为操作错误（可预期） */
  public isOperational: boolean

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = isOperational

    // 恢复原型链
    Object.setPrototypeOf(this, AppError.prototype)

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(
      `${resource} not found: ${id}`,
      404,
      'RESOURCE_NOT_FOUND'
    )
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  public fields?: Record<string, string[]>

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR')
    this.fields = fields
  }
}

/**
 * 业务逻辑错误
 */
export class BusinessError extends AppError {
  constructor(message: string, errorCode = 'BUSINESS_ERROR') {
    super(message, 400, errorCode)
  }
}
```

### 3. 错误码定义

```typescript
// backend/src/errors/errorCodes.ts

export const ErrorCodes = {
  // 通用错误
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // 商品相关错误
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_NAME_INVALID: 'PRODUCT_NAME_INVALID',
  PRODUCT_PRICE_INVALID: 'PRODUCT_PRICE_INVALID',
  PRODUCT_STATUS_INVALID: 'PRODUCT_STATUS_INVALID',
  PRODUCT_IMAGES_INVALID: 'PRODUCT_IMAGES_INVALID',
} as const
```

---

## 控制器实现

### ProductController 完整实现

```typescript
// backend/src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError, NotFoundError, BusinessError } from '../errors/AppError'
import { yuanToCents, centsToYuan } from '../utils/price'
import { safeJsonParse } from '../utils/json'

const prisma = new PrismaClient()

/**
 * 商品控制器
 */
export class ProductController {
  /**
   * 获取商品列表
   * GET /api/v1/products
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      // 从验证中间件获取查询参数
      const {
        page = 1,
        pageSize = 12,
        keyword,
        minPrice,
        maxPrice,
        status = 'on_sale', // 默认只显示上架商品
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as any

      // 构建查询条件
      const where: any = {}

      // 关键词搜索（模糊匹配商品名称）
      if (keyword) {
        where.name = { contains: keyword }
      }

      // 价格区间筛选
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) {
          where.price.gte = yuanToCents(parseFloat(minPrice))
        }
        if (maxPrice !== undefined) {
          where.price.lte = yuanToCents(parseFloat(maxPrice))
        }
      }

      // 状态筛选
      if (status) {
        where.status = status
      }

      // 计算分页
      const skip = (page - 1) * pageSize

      // 构建排序
      const orderBy: any = {}
      orderBy[sortBy] = sortOrder

      // 并行查询总数和数据
      const [total, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
        }),
      ])

      // 数据转换（分转元、JSON 解析）
      const transformedItems = items.map((product) => ({
        id: product.id,
        name: product.name,
        price: centsToYuan(product.price),
        images: safeJsonParse<string[]>(product.images, []),
        status: product.status,
      }))

      // 计算分页信息
      const totalPages = Math.ceil(total / pageSize)

      // 返回响应
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: transformedItems,
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取商品详情
   * GET /api/v1/products/:id
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      // 查询商品
      const product = await prisma.product.findUnique({
        where: { id },
      })

      // 商品不存在
      if (!product) {
        throw new NotFoundError('Product', id)
      }

      // 数据转换
      const transformedProduct = {
        id: product.id,
        name: product.name,
        price: centsToYuan(product.price),
        description: product.description,
        images: safeJsonParse<string[]>(product.images, []),
        status: product.status,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }

      // 返回响应
      res.status(200).json({
        code: 200,
        message: 'success',
        data: transformedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 创建商品
   * POST /api/v1/products
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price, description = '', images = [], status = 'on_sale' } = req.body

      // 验证价格范围
      if (price < 0 || price > 999999.99) {
        throw new BusinessError(
          '价格必须为 0-999999.99 元',
          'PRODUCT_PRICE_INVALID'
        )
      }

      // 验证图片数量
      if (images.length > 10) {
        throw new BusinessError(
          '最多只能上传 10 张图片',
          'PRODUCT_IMAGES_INVALID'
        )
      }

      // 创建商品（价格元转分、图片数组转 JSON）
      const product = await prisma.product.create({
        data: {
          name,
          price: yuanToCents(price),
          description,
          images: JSON.stringify(images),
          status,
        },
      })

      // 数据转换
      const transformedProduct = {
        id: product.id,
        name: product.name,
        price: centsToYuan(product.price),
        description: product.description,
        images: safeJsonParse<string[]>(product.images, []),
        status: product.status,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }

      // 返回响应
      res.status(201).json({
        code: 201,
        message: '商品创建成功',
        data: transformedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新商品
   * PUT /api/v1/products/:id
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const updateData = req.body

      // 检查商品是否存在
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      })

      if (!existingProduct) {
        throw new NotFoundError('Product', id)
      }

      // 构建更新数据
      const data: any = {}

      if (updateData.name !== undefined) {
        data.name = updateData.name
      }

      if (updateData.price !== undefined) {
        // 验证价格范围
        if (updateData.price < 0 || updateData.price > 999999.99) {
          throw new BusinessError(
            '价格必须为 0-999999.99 元',
            'PRODUCT_PRICE_INVALID'
          )
        }
        data.price = yuanToCents(updateData.price)
      }

      if (updateData.description !== undefined) {
        data.description = updateData.description
      }

      if (updateData.images !== undefined) {
        // 验证图片数量
        if (updateData.images.length > 10) {
          throw new BusinessError(
            '最多只能上传 10 张图片',
            'PRODUCT_IMAGES_INVALID'
          )
        }
        data.images = JSON.stringify(updateData.images)
      }

      if (updateData.status !== undefined) {
        // 验证状态值
        if (!['on_sale', 'off_sale'].includes(updateData.status)) {
          throw new BusinessError(
            '状态值必须为 on_sale 或 off_sale',
            'PRODUCT_STATUS_INVALID'
          )
        }
        data.status = updateData.status
      }

      // 更新商品
      const product = await prisma.product.update({
        where: { id },
        data,
      })

      // 数据转换
      const transformedProduct = {
        id: product.id,
        name: product.name,
        price: centsToYuan(product.price),
        description: product.description,
        images: safeJsonParse<string[]>(product.images, []),
        status: product.status,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }

      // 返回响应
      res.status(200).json({
        code: 200,
        message: '商品更新成功',
        data: transformedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新商品状态
   * PATCH /api/v1/products/:id/status
   */
  async updateProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { status } = req.body

      // 验证状态值
      if (!['on_sale', 'off_sale'].includes(status)) {
        throw new BusinessError(
          '状态值必须为 on_sale 或 off_sale',
          'PRODUCT_STATUS_INVALID'
        )
      }

      // 检查商品是否存在
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      })

      if (!existingProduct) {
        throw new NotFoundError('Product', id)
      }

      // 更新状态
      const product = await prisma.product.update({
        where: { id },
        data: { status },
      })

      // 数据转换
      const transformedProduct = {
        id: product.id,
        name: product.name,
        price: centsToYuan(product.price),
        description: product.description,
        images: safeJsonParse<string[]>(product.images, []),
        status: product.status,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }

      // 返回响应
      res.status(200).json({
        code: 200,
        message: '商品状态更新成功',
        data: transformedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 删除商品
   * DELETE /api/v1/products/:id
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      // 检查商品是否存在
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      })

      if (!existingProduct) {
        throw new NotFoundError('Product', id)
      }

      // 删除商品
      await prisma.product.delete({
        where: { id },
      })

      // 返回响应
      res.status(200).json({
        code: 200,
        message: '商品删除成功',
        data: null,
      })
    } catch (error) {
      next(error)
    }
  }
}

// 导出单例
export default new ProductController()
```

---

## 数据转换逻辑

### 数据库模型 → API 响应

```typescript
/**
 * 转换商品数据（数据库格式 → API 响应格式）
 */
function transformProduct(product: any): any {
  return {
    id: product.id,
    name: product.name,
    price: centsToYuan(product.price), // 分转元
    description: product.description,
    images: safeJsonParse<string[]>(product.images, []), // JSON 字符串转数组
    status: product.status,
    createdAt: product.createdAt.toISOString(), // Date → ISO 字符串
    updatedAt: product.updatedAt.toISOString(),
  }
}

/**
 * 转换商品列表项（简化版）
 */
function transformProductListItem(product: any): any {
  return {
    id: product.id,
    name: product.name,
    price: centsToYuan(product.price),
    images: safeJsonParse<string[]>(product.images, []),
    status: product.status,
  }
}
```

### API 请求 → 数据库模型

```typescript
/**
 * 转换创建商品数据（API 请求格式 → 数据库格式）
 */
function transformCreateProductData(data: any): any {
  return {
    name: data.name,
    price: yuanToCents(data.price), // 元转分
    description: data.description || '',
    images: JSON.stringify(data.images || []), // 数组转 JSON 字符串
    status: data.status || 'on_sale',
  }
}

/**
 * 转换更新商品数据（部分更新）
 */
function transformUpdateProductData(data: any): any {
  const transformed: any = {}
  
  if (data.name !== undefined) transformed.name = data.name
  if (data.price !== undefined) transformed.price = yuanToCents(data.price)
  if (data.description !== undefined) transformed.description = data.description
  if (data.images !== undefined) transformed.images = JSON.stringify(data.images)
  if (data.status !== undefined) transformed.status = data.status
  
  return transformed
}
```

---

## 业务规则

### 1. 商品查询规则

- **默认筛选**：列表查询默认只返回 `status = 'on_sale'` 的商品
- **默认排序**：按 `createdAt` 降序（最新商品优先）
- **分页限制**：每页最多 100 条数据
- **关键词搜索**：模糊匹配商品名称（contains）

### 2. 商品创建规则

- **价格范围**：0 - 999,999.99 元
- **图片数量**：最多 10 张
- **默认状态**：on_sale（已上架）
- **默认描述**：空字符串
- **自动生成**：id（UUID）、createdAt、updatedAt

### 3. 商品更新规则

- **部分更新**：仅更新提供的字段
- **存在性检查**：商品不存在时抛出 404 错误
- **自动更新**：updatedAt 字段自动更新（Prisma @updatedAt）
- **数据验证**：更新时同样需要验证价格、图片等字段

### 4. 商品删除规则

- **物理删除**：直接从数据库删除记录
- **存在性检查**：商品不存在时抛出 404 错误
- **级联删除**：当前无关联表，无需处理级联

---

## 错误处理

### 错误分类

#### 1. 资源未找到错误（404）

```typescript
throw new NotFoundError('Product', id)
```

**触发场景**：
- 查询不存在的商品详情
- 更新不存在的商品
- 删除不存在的商品

#### 2. 业务验证错误（400）

```typescript
throw new BusinessError('价格必须为 0-999999.99 元', 'PRODUCT_PRICE_INVALID')
```

**触发场景**：
- 价格超出范围
- 图片数量超过限制
- 状态值无效

#### 3. 数据库错误（500）

```typescript
// Prisma 异常自动传递到错误处理中间件
catch (error) {
  next(error)
}
```

**触发场景**：
- 数据库连接失败
- SQL 执行错误
- 约束违反

### 错误处理流程

```
Controller 方法
  ↓ try-catch 捕获异常
  ↓ 业务错误 → throw AppError
  ↓ 数据库错误 → catch(error) → next(error)
  ↓
错误处理中间件（模块14）
  ↓ 判断错误类型
  ↓ 格式化错误响应
  ↓
返回统一错误格式
```

---

## 测试要点

### 1. 查询功能测试

- [ ] 获取商品列表返回正确格式
- [ ] 分页参数正确处理
- [ ] 关键词搜索返回匹配结果
- [ ] 价格区间筛选正确
- [ ] 状态筛选正确（默认 on_sale）
- [ ] 排序功能正确（价格、时间、名称）
- [ ] 多条件组合查询正确
- [ ] 空列表返回正确格式
- [ ] 商品详情查询正确
- [ ] 不存在的商品返回 404

### 2. 创建功能测试

- [ ] 创建商品成功返回 201
- [ ] 价格正确转换（元转分）
- [ ] 图片数组正确序列化（JSON）
- [ ] 默认状态为 on_sale
- [ ] 默认描述为空字符串
- [ ] UUID 自动生成
- [ ] 时间戳自动设置
- [ ] 价格超出范围抛出错误
- [ ] 图片数量超限抛出错误

### 3. 更新功能测试

- [ ] 部分更新只修改提供的字段
- [ ] 全量更新所有字段
- [ ] 价格更新正确转换
- [ ] 图片更新正确序列化
- [ ] 状态更新验证
- [ ] 不存在的商品返回 404
- [ ] updatedAt 自动更新

### 4. 状态管理测试

- [ ] 上架状态更新成功
- [ ] 下架状态更新成功
- [ ] 无效状态值抛出错误
- [ ] 不存在的商品返回 404

### 5. 删除功能测试

- [ ] 删除商品成功返回 200
- [ ] 删除后数据库记录消失
- [ ] 不存在的商品返回 404

### 6. 数据转换测试

- [ ] 分转元计算准确
- [ ] 元转分计算准确
- [ ] JSON 序列化/反序列化正确
- [ ] Date 转 ISO 字符串正确
- [ ] 空数组默认值处理

### 7. 错误处理测试

- [ ] 业务错误返回正确格式
- [ ] 404 错误返回正确格式
- [ ] 数据库错误返回 500
- [ ] 错误码正确设置
- [ ] 错误消息清晰友好

### 8. 边界情况测试

- [ ] 价格为 0 的商品
- [ ] 价格为最大值（999999.99）
- [ ] 名称最长 200 字符
- [ ] 描述最长 5000 字符
- [ ] 10 张图片（上限）
- [ ] 空图片数组
- [ ] 特殊字符输入
- [ ] 并发请求处理

---

## 附录

### 控制器调用示例

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

// GET /api/v1/products
router.get(
  '/',
  validate(productQuerySchema, 'query'),
  productController.getProducts.bind(productController)
)

// GET /api/v1/products/:id
router.get(
  '/:id',
  productController.getProductById.bind(productController)
)

// POST /api/v1/products
router.post(
  '/',
  validate(createProductSchema, 'body'),
  productController.createProduct.bind(productController)
)

// PUT /api/v1/products/:id
router.put(
  '/:id',
  validate(updateProductSchema, 'body'),
  productController.updateProduct.bind(productController)
)

// PATCH /api/v1/products/:id/status
router.patch(
  '/:id/status',
  productController.updateProductStatus.bind(productController)
)

// DELETE /api/v1/products/:id
router.delete(
  '/:id',
  productController.deleteProduct.bind(productController)
)

export default router
```

### 性能优化建议

1. **查询优化**
   - 使用 `Promise.all` 并行查询总数和数据
   - 合理设置分页大小（默认 12，最大 100）
   - 数据库索引已覆盖常用查询字段

2. **数据转换优化**
   - 仅在需要时进行 JSON 解析
   - 列表查询仅返回必要字段（减少网络传输）
   - 详情查询返回完整字段

3. **后续优化方向**
   - 添加 Redis 缓存（热门商品列表）
   - 实现字段筛选（fields 参数）
   - 添加请求限流
   - 实现响应压缩

### 代码组织最佳实践

✅ **推荐做法**：
- 使用 class 组织控制器方法
- 导出单例避免重复实例化
- 使用 try-catch 统一错误处理
- 调用 `next(error)` 传递错误到中间件
- 数据转换逻辑独立为工具函数
- 添加详细的 JSDoc 注释

❌ **避免做法**：
- 在控制器中直接编写 SQL
- 混合业务逻辑和路由定义
- 忽略错误处理
- 返回不一致的响应格式
- 缺少类型注解

### 相关资源

- [Express.js 控制器模式](https://expressjs.com/en/guide/routing.html)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [TypeScript 最佳实践](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [错误处理模式](https://stackoverflow.com/questions/16321145/)

---

**相关模块**：
- 模块 10 - 商品 API 接口
- 模块 11 - 数据模型
- 模块 14 - 错误处理
- 模块 19 - TypeScript 类型定义

**下一步建议**：模块 14 - 错误处理 或 模块 13 - 跨域配置
