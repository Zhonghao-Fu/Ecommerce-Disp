# 数据模型模块规格说明书

## 模块概述

本模块负责定义项目的数据库结构和数据模型，包括表设计、字段约束、索引策略和关系映射。作为后端开发的基础，数据模型直接影响 API 设计、业务逻辑实现和数据查询效率。

**设计原则**：
- 简洁优先：当前阶段仅商品表，避免过度设计
- 扩展友好：预留扩展字段，支持后续功能迭代
- 类型安全：与 TypeScript 类型定义保持一致
- 性能优化：合理索引，支持常见查询场景

---

## 功能需求

### 核心需求

1. **商品数据模型**
   - 完整的商品信息存储
   - 支持上下架状态管理
   - 记录创建和更新时间

2. **数据完整性**
   - 必填字段约束
   - 数据类型验证
   - 唯一性约束（如需要）

3. **查询优化**
   - 支持列表分页查询
   - 支持条件筛选（价格、状态、关键词）
   - 支持排序（价格、时间）

4. **数据迁移**
   - 支持数据库版本管理
   - 提供迁移脚本
   - 支持回滚操作

5. **ORM 集成**
   - 使用 Prisma ORM
   - 类型安全的数据库操作
   - 自动生成 TypeScript 类型

---

## 技术实现

### 技术选型

- **数据库**: SQLite（开发）/ PostgreSQL（生产可选）
- **ORM**: Prisma 5.x
- **迁移工具**: Prisma Migrate
- **类型生成**: Prisma Client（自动生成）

### 为什么选择 SQLite？

✅ **优势**：
- 零配置，无需安装数据库服务器
- 单文件存储，便于备份和迁移
- 适合个人项目和低并发场景
- Prisma 完美支持

⚠️ **限制**：
- 不支持高并发写入
- 不适合分布式部署
- 后续如需可无缝迁移到 PostgreSQL

### 文件结构

```
backend/
├── prisma/
│   ├── schema.prisma          # Prisma 数据模型定义
│   ├── migrations/            # 数据库迁移文件
│   │   ├── 20260529000000_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── seed.ts                # 种子数据（可选）
├── src/
│   ├── models/                # 数据模型封装（可选）
│   │   └── Product.ts
│   └── config/
│       └── database.ts        # 数据库连接配置
└── dev.db                     # 开发数据库文件（gitignore）
```

---

## 数据表设计

### Product 表（商品表）

#### Prisma Schema 定义

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // 开发环境使用 SQLite
  url      = env("DATABASE_URL")
}

/// 商品数据模型
model Product {
  /// 商品唯一标识（UUID）
  id          String   @id @default(uuid())
  
  /// 商品名称
  name        String
  
  /// 商品价格（单位：元，存储为整数避免浮点数精度问题）
  /// 例如：299.99 元存储为 29999
  price       Int
  
  /// 商品描述
  description String   @default("")
  
  /// 商品图片 URL 数组（JSON 格式存储）
  /// 例如：["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
  images      String   @default("[]")
  
  /// 商品状态：on_sale（已上架）| off_sale（已下架）
  status      String   @default("on_sale")
  
  /// 创建时间
  createdAt   DateTime @default(now()) @map("created_at")
  
  /// 更新时间
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("products")
  @@index([status])
  @@index([price])
  @@index([createdAt])
}
```

#### SQL 表结构（迁移生成）

```sql
-- 创建商品表
CREATE TABLE "products" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'on_sale',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX "products_status_idx" ON "products"("status");
CREATE INDEX "products_price_idx" ON "products"("price");
CREATE INDEX "products_created_at_idx" ON "products"("created_at");
```

---

## 字段说明

### 字段详细规格

| 字段名 | 类型 | 必填 | 默认值 | 说明 | 示例 |
|--------|------|------|--------|------|------|
| `id` | String (UUID) | ✅ | uuid() | 商品唯一标识，使用 UUID v4 | `"a1b2c3d4-e5f6-..."` |
| `name` | String | ✅ | - | 商品名称，最长 200 字符 | `"无线蓝牙耳机"` |
| `price` | Int | ✅ | - | 价格（分），避免浮点数精度问题 | `29999` (表示 299.99 元) |
| `description` | String | ✅ | `""` | 商品描述，支持长文本 | `"高品质无线..."` |
| `images` | String (JSON) | ✅ | `"[]"` | 图片 URL 数组的 JSON 字符串 | `"[\"url1\", \"url2\"]"` |
| `status` | String | ✅ | `"on_sale"` | 商品状态：on_sale / off_sale | `"on_sale"` |
| `createdAt` | DateTime | ✅ | now() | 创建时间，自动设置 | `"2026-05-29T10:00:00Z"` |
| `updatedAt` | DateTime | ✅ | updatedAt | 更新时间，自动更新 | `"2026-05-29T12:00:00Z"` |

### 字段设计决策

#### 1. 价格存储为整数（分）

**原因**：
- 避免浮点数精度问题（0.1 + 0.2 ≠ 0.3）
- 便于进行价格计算和比较
- 数据库查询更高效

**转换逻辑**：
```typescript
// 元转分
const priceInCents = Math.round(priceInYuan * 100)

// 分转元
const priceInYuan = priceInCents / 100
```

#### 2. 图片存储为 JSON 字符串

**原因**：
- SQLite 不支持原生数组类型
- JSON 格式灵活，支持多张图片
- Prisma 可自动序列化/反序列化

**使用方式**：
```typescript
// 存储
const images = JSON.stringify(['url1.jpg', 'url2.jpg'])

// 读取
const imageArray = JSON.parse(product.images)
```

#### 3. 使用 UUID 而非自增 ID

**优势**：
- 全局唯一，避免 ID 暴露业务量
- 分布式系统友好
- 更安全，难以猜测

#### 4. 状态使用字符串而非枚举

**原因**：
- SQLite 原生枚举支持有限
- 字符串更灵活，易于扩展
- TypeScript 层通过类型约束保证安全

---

## 索引和约束

### 索引设计

#### 1. 状态索引

```prisma
@@index([status])
```

**用途**：
- 快速筛选上架/下架商品
- 列表页默认只显示上架商品

**查询示例**：
```typescript
const products = await prisma.product.findMany({
  where: { status: 'on_sale' }
})
```

#### 2. 价格索引

```prisma
@@index([price])
```

**用途**：
- 支持价格区间查询
- 支持按价格排序

**查询示例**：
```typescript
const products = await prisma.product.findMany({
  where: { price: { gte: 10000, lte: 50000 } },
  orderBy: { price: 'asc' }
})
```

#### 3. 创建时间索引

```prisma
@@index([createdAt])
```

**用途**：
- 支持按时间排序
- 支持时间范围查询

**查询示例**：
```typescript
const products = await prisma.product.findMany({
  orderBy: { createdAt: 'desc' }
})
```

### 约束设计

#### 必填约束

- `name`: NOT NULL
- `price`: NOT NULL
- `status`: NOT NULL

#### 默认值约束

- `description`: 空字符串
- `images`: 空数组 JSON
- `status`: "on_sale"
- `createdAt`: 当前时间
- `updatedAt`: 自动更新

#### 数据验证规则

| 字段 | 验证规则 | 错误提示 |
|------|---------|----------|
| `name` | 1-200 字符 | "商品名称长度为 1-200 字符" |
| `price` | 0-99999999 分 | "价格必须为 0-999999.99 元" |
| `description` | 0-5000 字符 | "描述不能超过 5000 字符" |
| `images` | 有效 JSON 数组 | "图片格式错误" |
| `status` | on_sale 或 off_sale | "状态值无效" |

---

## 数据库操作示例

### Prisma Client 使用示例

#### 1. 创建商品

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createProduct(data: {
  name: string
  price: number
  description: string
  images: string[]
  status?: string
}) {
  return await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      images: JSON.stringify(data.images),
      status: data.status || 'on_sale',
    },
  })
}
```

#### 2. 查询商品列表（分页 + 筛选）

```typescript
async function getProducts(params: {
  page: number
  pageSize: number
  keyword?: string
  minPrice?: number
  maxPrice?: number
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { page, pageSize, keyword, minPrice, maxPrice, status, sortBy, sortOrder } = params
  
  const where: any = {}
  
  // 关键词搜索
  if (keyword) {
    where.name = { contains: keyword }
  }
  
  // 价格区间
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }
  
  // 状态筛选
  if (status) {
    where.status = status
  }
  
  // 分页
  const skip = (page - 1) * pageSize
  
  // 排序
  const orderBy: any = {}
  if (sortBy) {
    orderBy[sortBy] = sortOrder || 'desc'
  } else {
    orderBy.createdAt = 'desc'
  }
  
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
    }),
  ])
  
  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasPrev: page > 1,
      hasNext: page < Math.ceil(total / pageSize),
    },
  }
}
```

#### 3. 更新商品

```typescript
async function updateProduct(id: string, data: {
  name?: string
  price?: number
  description?: string
  images?: string[]
  status?: string
}) {
  const updateData: any = {}
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.price !== undefined) updateData.price = data.price
  if (data.description !== undefined) updateData.description = data.description
  if (data.images !== undefined) updateData.images = JSON.stringify(data.images)
  if (data.status !== undefined) updateData.status = data.status
  
  return await prisma.product.update({
    where: { id },
    data: updateData,
  })
}
```

#### 4. 更新上下架状态

```typescript
async function updateProductStatus(id: string, status: 'on_sale' | 'off_sale') {
  return await prisma.product.update({
    where: { id },
    data: { status },
  })
}
```

#### 5. 删除商品

```typescript
async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  })
}
```

---

## 数据库迁移

### 常用命令

```bash
# 初始化 Prisma
npx prisma init

# 生成迁移文件
npx prisma migrate dev --name init

# 应用迁移
npx prisma migrate deploy

# 重置数据库
npx prisma migrate reset

# 生成 Prisma Client
npx prisma generate

# 查看数据库状态
npx prisma db pull

# 打开 Prisma Studio（数据库 GUI）
npx prisma studio
```

### 迁移文件示例

```sql
-- migration.sql
-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'on_sale',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");
```

---

## 测试要点

### 1. 数据模型测试

- [ ] Product 表创建成功
- [ ] 所有字段类型正确
- [ ] 默认值设置正确
- [ ] 索引创建成功
- [ ] UUID 主键自动生成

### 2. CRUD 操作测试

- [ ] 创建商品成功
- [ ] 查询单个商品成功
- [ ] 查询商品列表成功
- [ ] 更新商品信息成功
- [ ] 更新上下架状态成功
- [ ] 删除商品成功

### 3. 查询功能测试

- [ ] 分页查询正确
- [ ] 关键词搜索正确
- [ ] 价格区间筛选正确
- [ ] 状态筛选正确
- [ ] 多条件组合查询正确
- [ ] 排序功能正确

### 4. 数据验证测试

- [ ] 必填字段验证
- [ ] 价格范围验证
- [ ] 字符串长度验证
- [ ] 状态值验证
- [ ] JSON 格式验证

### 5. 性能测试

- [ ] 索引生效（EXPLAIN 分析）
- [ ] 分页查询性能（>1000 条数据）
- [ ] 模糊搜索性能
- [ ] 多条件查询性能

### 6. 迁移测试

- [ ] 迁移文件生成正确
- [ ] 迁移应用成功
- [ ] 数据库重置成功
- [ ] Prisma Client 生成成功

---

## 附录

### 数据库连接配置

```typescript
// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

export default prisma
```

### 环境变量配置

```env
# 开发环境
DATABASE_URL="file:./dev.db"

# 生产环境（如使用 PostgreSQL）
# DATABASE_URL="postgresql://user:password@localhost:5432/myshop"
```

### Prisma Schema 最佳实践

1. **添加注释**：使用 `///` 为模型和字段添加文档注释
2. **使用 @map**：字段名使用 camelCase，数据库列名使用 snake_case
3. **合理索引**：为常用查询字段添加索引
4. **默认值**：为可选字段设置合理默认值
5. **时间戳**：使用 @default(now()) 和 @updatedAt

### 后续扩展预留

当需要扩展功能时，可添加以下表：

- `Category` - 商品分类表
- `User` - 用户表
- `Order` - 订单表
- `OrderItem` - 订单明细表
- `Cart` - 购物车表
- `CartItem` - 购物车明细表

---

**相关模块**：
- 模块 10 - 商品 API 接口
- 模块 12 - 商品管理控制器
- 模块 19 - TypeScript 类型定义

**下一步建议**：模块 12 - 商品管理控制器

