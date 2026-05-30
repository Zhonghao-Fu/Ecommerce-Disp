# TypeScript 类型定义模块规格说明书

## 模块概述

本模块负责定义整个项目的 TypeScript 类型系统，包括数据模型、API 请求/响应、组件 Props、工具函数类型等。通过完整的类型定义，实现编译时类型检查、IDE 智能提示、代码自动补全，提升代码质量和开发效率，同时为 AI 工具提供更好的代码理解能力。

**设计原则**：
- 类型先行：先定义类型，再实现功能
- 前后端统一：共享核心数据类型定义
- 严格模式：禁用 any，使用 unknown 替代
- AI 友好：详细的类型注释和文档

---

## 功能需求

### 核心需求

1. **数据模型类型**
   - 商品（Product）完整类型定义
   - 商品状态枚举
   - 商品查询参数类型

2. **API 类型**
   - 统一响应格式
   - 统一错误格式
   - 分页信息类型
   - 各接口的请求/响应类型

3. **组件类型**
   - 组件 Props 定义
   - 事件处理函数类型
   - 表单数据类型

4. **工具类型**
   - 泛型工具类型
   - 条件类型
   - 类型守卫

5. **环境类型**
   - 环境变量类型（已在模块 18 定义）
   - 配置对象类型

---

## 技术实现

### 技术选型

- **TypeScript**: 5.x
- **严格模式**: 启用所有严格检查
- **类型导出**: 使用 index.ts 统一导出
- **类型文档**: JSDoc 注释

### 文件组织

```
frontend/src/types/
├── index.ts              # 统一导出
├── product.ts            # 商品相关类型
├── api.ts                # API 相关类型
├── component.ts          # 组件 Props 类型
├── common.ts             # 通用类型
├── env.d.ts              # 环境变量类型（已在模块18）
└── utils.ts              # 工具类型

backend/src/types/
├── index.ts              # 统一导出
├── product.ts            # 商品相关类型
├── api.ts                # API 相关类型
├── common.ts             # 通用类型
└── database.ts           # 数据库相关类型
```

### 类型共享策略

**前后端共享类型**（核心数据模型）：
- Product
- ProductStatus
- ApiResponse
- PaginatedResponse

**前端独有类型**：
- 组件 Props
- 表单数据
- UI 状态

**后端独有类型**：
- 数据库模型
- 请求上下文
- 中间件类型

---

## 类型清单

### 1. 商品相关类型

#### ProductStatus（商品状态枚举）

```typescript
/**
 * 商品状态枚举
 */
export enum ProductStatus {
  /** 已上架 */
  ON_SALE = 'on_sale',
  /** 已下架 */
  OFF_SALE = 'off_sale',
}

/**
 * 商品状态显示名称映射
 */
export const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.ON_SALE]: '已上架',
  [ProductStatus.OFF_SALE]: '已下架',
}

/**
 * 商品状态颜色映射（用于 UI 展示）
 */
export const ProductStatusColors: Record<ProductStatus, string> = {
  [ProductStatus.ON_SALE]: 'green',
  [ProductStatus.OFF_SALE]: 'red',
}
```

#### Product（商品实体）

```typescript
/**
 * 商品实体接口
 */
export interface Product {
  /** 商品唯一标识 */
  id: string
  /** 商品名称 */
  name: string
  /** 商品价格（单位：元） */
  price: number
  /** 商品描述 */
  description: string
  /** 商品图片 URL 数组 */
  images: string[]
  /** 商品状态 */
  status: ProductStatus
  /** 创建时间（ISO 8601 格式） */
  createdAt: string
  /** 更新时间（ISO 8601 格式） */
  updatedAt: string
}

/**
 * 创建商品时的输入类型（不包含 id 和时间戳）
 */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

/**
 * 更新商品时的输入类型（所有字段可选）
 */
export type UpdateProductInput = Partial<CreateProductInput>

/**
 * 商品列表项（可能只包含部分字段用于列表展示）
 */
export type ProductListItem = Pick<Product, 'id' | 'name' | 'price' | 'images' | 'status'>
```

#### ProductQueryParams（商品查询参数）

```typescript
/**
 * 排序字段枚举
 */
export type SortField = 'price' | 'createdAt' | 'name'

/**
 * 排序方向枚举
 */
export type SortOrder = 'asc' | 'desc'

/**
 * 商品查询参数接口
 */
export interface ProductQueryParams {
  /** 页码（从 1 开始） */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 关键词搜索 */
  keyword?: string
  /** 最低价格 */
  minPrice?: number
  /** 最高价格 */
  maxPrice?: number
  /** 商品状态筛选 */
  status?: ProductStatus
  /** 排序字段 */
  sortBy?: SortField
  /** 排序方向 */
  sortOrder?: SortOrder
}

/**
 * 默认查询参数
 */
export const DEFAULT_QUERY_PARAMS: Required<Pick<ProductQueryParams, 'page' | 'pageSize'>> = {
  page: 1,
  pageSize: 12,
}
```

### 2. API 相关类型

#### ApiResponse（统一响应格式）

```typescript
/**
 * API 统一响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 状态码（200 成功，其他为错误） */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/**
 * API 错误响应格式
 */
export interface ApiErrorResponse {
  /** 错误码 */
  code: number
  /** 错误消息 */
  message: string
  /** 详细错误信息（开发环境） */
  error?: string
  /** 错误字段（验证错误时） */
  fields?: Record<string, string[]>
}

/**
 * 成功响应快捷类型
 */
export type SuccessResponse<T = unknown> = ApiResponse<T>

/**
 * 错误响应快捷类型
 */
export type ErrorResponse = ApiErrorResponse
```

#### PaginatedResponse（分页响应）

```typescript
/**
 * 分页信息接口
 */
export interface PaginationInfo {
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPages: number
  /** 是否有上一页 */
  hasPrev: boolean
  /** 是否有下一页 */
  hasNext: boolean
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T = unknown> {
  /** 分页信息 */
  pagination: PaginationInfo
  /** 数据列表 */
  items: T[]
}

/**
 * 商品列表响应类型
 */
export type ProductListResponse = PaginatedResponse<ProductListItem>

/**
 * 单个商品响应类型
 */
export type ProductDetailResponse = ApiResponse<Product>
```

### 3. 组件 Props 类型

#### ProductCardProps（商品卡片组件）

```typescript
/**
 * 商品卡片组件 Props
 */
export interface ProductCardProps {
  /** 商品数据 */
  product: ProductListItem
  /** 点击商品卡片回调 */
  onClick?: (product: ProductListItem) => void
  /** 自定义类名 */
  className?: string
}
```

#### PaginationProps（分页组件）

```typescript
/**
 * 分页组件 Props
 */
export interface PaginationProps {
  /** 当前页码 */
  currentPage: number
  /** 每页数量 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 页码变化回调 */
  onPageChange: (page: number) => void
  /** 每页数量变化回调 */
  onPageSizeChange?: (pageSize: number) => void
  /** 可选的每页数量选项 */
  pageSizeOptions?: number[]
  /** 自定义类名 */
  className?: string
}
```

#### FilterBarProps（筛选栏组件）

```typescript
/**
 * 筛选栏组件 Props
 */
export interface FilterBarProps {
  /** 当前查询参数 */
  queryParams: ProductQueryParams
  /** 查询参数变化回调 */
  onQueryChange: (params: ProductQueryParams) => void
  /** 搜索按钮点击回调 */
  onSearch: () => void
  /** 自定义类名 */
  className?: string
}
```

### 4. 通用类型

#### 工具类型

```typescript
/**
 * 使所有属性可选且允许 null
 */
export type Nullable<T> = {
  [P in keyof T]?: T[P] | null
}

/**
 * 移除指定属性
 */
export type OmitProps<T, K extends keyof T> = Omit<T, K>

/**
 * 仅保留指定属性
 */
export type PickProps<T, K extends keyof T> = Pick<T, K>

/**
 * 深部分部类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 函数类型
 */
export type AsyncFunction<T = void> = () => Promise<T>

/**
 * 可选的 Promise 类型
 */
export type MaybePromise<T> = T | Promise<T>
```

#### UI 状态类型

```typescript
/**
 * 数据加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * 带状态的数据包装
 */
export interface StatefulData<T> {
  /** 加载状态 */
  state: LoadingState
  /** 数据 */
  data: T | null
  /** 错误信息 */
  error: string | null
}

/**
 * 创建初始状态
 */
export function createInitialState<T>(): StatefulData<T> {
  return {
    state: 'idle',
    data: null,
    error: null,
  }
}
```

### 5. 后端专属类型

#### Database Types（数据库相关）

```typescript
/**
 * 数据库商品模型（包含数据库特定字段）
 */
export interface ProductModel {
  id: string
  name: string
  price: number
  description: string
  images: string // JSON 字符串
  status: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 数据库查询结果
 */
export interface QueryResult<T> {
  /** 查询到的记录数 */
  count: number
  /** 数据列表 */
  rows: T[]
}
```

#### Request Context（请求上下文）

```typescript
import { Request } from 'express'

/**
 * 扩展的 Express 请求类型
 */
export interface AppRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> 
  extends Request<P, ResBody, ReqBody, ReqQuery> {
  /** 请求 ID（用于日志追踪） */
  requestId?: string
  /** 请求时间戳 */
  requestTime?: number
}
```

---

## 使用规范

### 1. 命名规范

**接口命名**：
- 使用 `I` 前缀或不加前缀（推荐不加）
- 使用 PascalCase：`Product`、`ApiResponse`
- 描述性命名，避免缩写

**类型别名**：
- 使用 PascalCase：`ProductList`、`LoadingState`
- 工具类型使用通用名称：`Nullable`、`DeepPartial`

**枚举命名**：
- 枚举名使用 PascalCase：`ProductStatus`
- 枚举值使用 UPPER_SNAKE_CASE：`ON_SALE`、`OFF_SALE`

### 2. 导出规范

**统一导出**（index.ts）：

```typescript
// frontend/src/types/index.ts
export * from './product'
export * from './api'
export * from './component'
export * from './common'
export * from './utils'
```

**命名导出**（推荐）：
```typescript
export interface Product { ... }
export type ProductList = Product[]
```

**避免默认导出**：
```typescript
// ❌ 不推荐
export default interface Product { ... }

// ✅ 推荐
export interface Product { ... }
```

### 3. 注释规范

**JSDoc 注释**：
```typescript
/**
 * 商品实体接口
 * @description 定义商品的完整数据结构
 * @example
 * const product: Product = {
 *   id: '1',
 *   name: '无线耳机',
 *   price: 299,
 *   ...
 * }
 */
export interface Product { ... }
```

**属性注释**：
```typescript
export interface Product {
  /** 商品唯一标识 */
  id: string
  /** 商品名称 */
  name: string
}
```

### 4. 类型使用最佳实践

✅ **推荐做法**：
- 使用 interface 定义对象类型
- 使用 type 定义联合类型、工具类型
- 优先使用具体类型，避免 any
- 使用 unknown 替代 any（当类型不确定时）
- 使用泛型提高类型复用性
- 为复杂类型添加 JSDoc 注释

❌ **避免做法**：
- 使用 any 类型
- 过度使用类型推断导致可读性差
- 重复定义相同类型
- 类型定义过于宽泛
- 缺少必要的类型注释

### 5. AI 友好规范

为了让 AI 工具更好地理解代码：

1. **详细注释**
   - 每个接口/类型添加描述
   - 复杂属性添加注释
   - 提供使用示例

2. **类型明确**
   - 避免隐式类型
   - 显式标注函数返回类型
   - 使用字面量类型替代字符串

3. **结构化组织**
   - 相关类型放在同一文件
   - 使用 index.ts 统一导出
   - 按模块分组

4. **类型文档**
   - 维护类型变更日志
   - 记录类型设计决策
   - 提供迁移指南

---

## 测试要点

### 1. 类型完整性测试

- [ ] 所有核心数据模型都有类型定义
- [ ] API 请求/响应类型完整
- [ ] 组件 Props 类型完整
- [ ] 枚举类型包含所有可能的值
- [ ] 工具类型可正确复用

### 2. 类型安全测试

- [ ] TypeScript 编译无错误
- [ ] 无 any 类型使用（或极少且有必要理由）
- [ ] 严格模式下编译通过
- [ ] 类型推断准确
- [ ] 泛型使用正确

### 3. IDE 支持测试

- [ ] 智能提示正常工作
- [ ] 类型跳转功能正常
- [ ] 自动补全准确
- [ ] 错误提示清晰
- [ ] 重构功能正常

### 4. 前后端类型一致性测试

- [ ] 共享类型定义一致
- [ ] API 接口类型前后端匹配
- [ ] 数据模型定义一致
- [ ] 枚举值前后端统一

### 5. 类型使用规范测试

- [ ] 命名符合规范
- [ ] 注释完整（JSDoc）
- [ ] 导出方式统一
- [ ] 文件组织清晰
- [ ] 无重复类型定义

### 6. 运行时类型验证测试

- [ ] API 响应数据符合类型定义
- [ ] 表单数据验证使用类型
- [ ] 类型守卫函数工作正常
- [ ] 运行时类型检查（如使用 zod/yup）

---

## 附录

### 类型检查命令

```bash
# TypeScript 类型检查
npx tsc --noEmit

# 严格模式检查
npx tsc --strict --noEmit

# 生成类型声明文件
npx tsc --declaration
```

### 常用 TypeScript 工具类型

```typescript
// 内置工具类型参考
Partial<T>        // 所有属性可选
Required<T>       // 所有属性必填
Readonly<T>       // 所有属性只读
Record<K, T>      // 键值对类型
Pick<T, K>        // 选择部分属性
Omit<T, K>        // 排除部分属性
Exclude<T, U>     // 排除联合类型中的某些类型
Extract<T, U>     // 提取联合类型中的某些类型
NonNullable<T>    // 排除 null 和 undefined
ReturnType<T>     // 函数返回类型
Parameters<T>     // 函数参数类型
```

### 类型演进策略

1. **初始阶段**：定义核心类型（Product、ApiResponse）
2. **开发阶段**：根据功能需求补充类型
3. **重构阶段**：优化类型结构，提取公共类型
4. **维护阶段**：保持类型同步更新，避免类型漂移

### 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 工具类型详解](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript 最佳实践](https://github.com/typescript-cheatsheets/react)

---

**相关模块**：
- 模块 18 - 环境变量配置
- 模块 20 - 项目结构与构建配置
- 模块 10 - 商品 API 接口
- 模块 11 - 数据模型

**下一步建议**：模块 11 - 数据模型（后端）或 模块 10 - 商品 API 接口

