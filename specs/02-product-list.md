# 商品列表页模块规格说明书

## 模块概述

本模块负责实现商品列表展示页面，是电商系统的核心页面之一。页面包含商品网格布局、数据加载、分页导航、筛选条件集成等功能。通过调用后端 API 获取商品数据，并使用商品卡片组件进行展示。该页面需要处理加载状态、空状态、错误状态等多种 UI 场景，提供良好的用户体验。

**设计原则**：
- 用户优先：快速展示商品，减少等待时间
- 响应式布局：适配 PC、平板、手机多种设备
- 性能优化：分页加载，避免一次性加载过多数据
- 状态管理：清晰处理 loading、error、empty 状态
- 组件化：复用商品卡片、分页、筛选等组件
- **默认筛选**：用户端默认只显示在架商品（`status: 'on_sale'`）

---

## 功能需求

### 核心需求

1. **商品展示**
   - 网格布局展示商品卡片
   - 响应式列数（PC 4列、平板 3列、手机 2列）
   - 商品图片懒加载
   - 卡片点击跳转详情页

2. **数据加载**
   - 初始加载商品列表
   - 分页数据加载
   - 筛选条件变化时重新加载
   - 加载状态展示

3. **分页功能**
   - 页码导航
   - 上一页/下一页按钮
   - 每页数量选择（12、24、48）
   - 总条数显示
   - 页码跳转

4. **筛选集成**
   - 与筛选组件联动
   - 关键词搜索
   - 价格区间筛选
   - 状态筛选（默认：在售）
   - 排序选择
   - **注意**：用户端默认 `status: 'on_sale'`，筛选器选择"全部"时显示所有商品（包括下架）

5. **状态处理**
   - Loading 状态（首次加载、分页切换）
   - Empty 状态（无数据提示）
   - Error 状态（错误提示、重试按钮）

---

## 技术实现

### 技术选型

- **框架**: React 18+ 或 Vue 3+（推荐 React）
- **状态管理**: React Hooks（useState、useEffect）
- **路由**: React Router 6+
- **样式**: Tailwind CSS 或 CSS Modules
- **HTTP 客户端**: Axios（已在模块15封装）

### 文件结构

```
frontend/src/
├── pages/
│   ├── ProductList.tsx              # 商品列表页主组件
│   └── ProductList.module.css       # 页面样式（如使用 CSS Modules）
├── components/
│   ├── ProductCard.tsx              # 商品卡片组件（模块04）
│   ├── Pagination.tsx               # 分页组件（模块06）
│   ├── FilterBar.tsx                # 筛选栏组件（模块03）
│   ├── LoadingSpinner.tsx           # 加载动画（模块16）
│   └── EmptyState.tsx               # 空状态组件（模块17）
├── hooks/
│   └── useProducts.ts               # 商品数据获取 Hook
├── api/
│   └── product.api.ts               # 商品 API（模块15）
└── types/
    └── product.ts                   # 类型定义（模块19）
```

---

## 页面组件实现

### 1. 商品列表页主组件

```typescript
// frontend/src/pages/ProductList.tsx
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productApi } from '../api/product.api'
import { ProductCard } from '../components/ProductCard'
import { Pagination } from '../components/Pagination'
import { FilterBar } from '../components/FilterBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { ApiError } from '../utils/errorHandler'
import type { ProductListItem, ProductQueryParams, PaginationInfo } from '../types'

import styles from './ProductList.module.css'

/**
 * 商品列表页组件
 */
export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // 数据状态
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
    hasPrev: false,
    hasNext: false,
  })
  
  // UI 状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 筛选条件
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '12'),
    keyword: searchParams.get('keyword') || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    status: (searchParams.get('status') as 'on_sale' | 'off_sale' | 'all') || 'on_sale', // 默认只显示在架商品
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  })

  /**
   * 加载商品数据
   */
  const loadProducts = useCallback(async (params: ProductQueryParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await productApi.getProducts({
        ...params,
        status: params.status || 'on_sale', // 默认只显示在架商品，'all' 显示所有商品
      })
      
      setProducts(result.items)
      setPagination(result.pagination)
      
      // 同步到 URL 参数
      updateUrlParams(params)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('加载商品失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 更新 URL 参数
   */
  const updateUrlParams = (params: ProductQueryParams) => {
    const newParams = new URLSearchParams()
    
    if (params.page && params.page > 1) newParams.set('page', String(params.page))
    if (params.pageSize && params.pageSize !== 12) newParams.set('pageSize', String(params.pageSize))
    if (params.keyword) newParams.set('keyword', params.keyword)
    if (params.minPrice) newParams.set('minPrice', String(params.minPrice))
    if (params.maxPrice) newParams.set('maxPrice', String(params.maxPrice))
    if (params.status) newParams.set('status', params.status)
    if (params.sortBy) newParams.set('sortBy', params.sortBy)
    if (params.sortOrder) newParams.set('sortOrder', params.sortOrder)
    
    setSearchParams(newParams)
  }

  /**
   * 初始加载
   */
  useEffect(() => {
    loadProducts(queryParams)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 页码变化处理
   */
  const handlePageChange = (page: number) => {
    const newParams = { ...queryParams, page }
    setQueryParams(newParams)
    loadProducts(newParams)
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * 每页数量变化处理
   */
  const handlePageSizeChange = (pageSize: number) => {
    const newParams = { ...queryParams, page: 1, pageSize }
    setQueryParams(newParams)
    loadProducts(newParams)
  }

  /**
   * 筛选条件变化处理
   */
  const handleFilterChange = (params: ProductQueryParams) => {
    const newParams = { ...queryParams, ...params, page: 1 } // 重置到第一页
    setQueryParams(newParams)
    loadProducts(newParams)
  }

  /**
   * 商品卡片点击处理
   */
  const handleProductClick = (product: ProductListItem) => {
    // 跳转到商品详情页
    window.location.href = `/products/${product.id}`
  }

  /**
   * 重试按钮点击
   */
  const handleRetry = () => {
    loadProducts(queryParams)
  }

  // Loading 状态
  if (loading && products.length === 0) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="large" message="正在加载商品..." />
      </div>
    )
  }

  // Error 状态
  if (error && products.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon="⚠️"
          title="加载失败"
          description={error}
          action={{
            label: '重试',
            onClick: handleRetry,
          }}
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 页面标题 */}
      <header className={styles.header}>
        <h1 className={styles.title}>商品列表</h1>
        <p className={styles.subtitle}>
          共 {pagination.total} 件商品
        </p>
      </header>

      {/* 筛选栏 */}
      <FilterBar
        queryParams={queryParams}
        onQueryChange={handleFilterChange}
        className={styles.filterBar}
      />

      {/* 商品网格 */}
      {products.length > 0 ? (
        <>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
              />
            ))}
          </div>

          {/* 分页 */}
          <Pagination
            currentPage={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[12, 24, 48]}
            className={styles.pagination}
          />
        </>
      ) : (
        /* Empty 状态 */
        <EmptyState
          icon="📦"
          title="暂无商品"
          description="当前筛选条件下没有找到商品，请调整筛选条件"
          action={{
            label: '清除筛选',
            onClick: () => handleFilterChange({}),
          }}
        />
      )}

      {/* 加载中（分页切换时） */}
      {loading && products.length > 0 && (
        <LoadingSpinner size="small" className={styles.loadingOverlay} />
      )}
    </div>
  )
}
```

---

## UI/UX 设计

### 1. 页面布局

```
┌─────────────────────────────────────────┐
│           Header (导航栏)                 │
├─────────────────────────────────────────┤
│  商品列表              共 100 件商品       │
├─────────────────────────────────────────┤
│  [筛选栏 - 关键词、价格、排序]             │
├─────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Card │ │ Card │ │ Card │ │ Card │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Card │ │ Card │ │ Card │ │ Card │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Card │ │ Card │ │ Card │ │ Card │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
├─────────────────────────────────────────┤
│  [分页组件] ← 1 2 3 4 5 ... 10 →         │
│  每页：[12 ▼]                            │
├─────────────────────────────────────────┤
│           Footer (页脚)                  │
└─────────────────────────────────────────┘
```

### 2. 响应式网格布局

```css
/* frontend/src/pages/ProductList.module.css */

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: #666;
}

.filterBar {
  margin-bottom: 2rem;
}

/* 响应式网格 */
.productGrid {
  display: grid;
  gap: 1.5rem;
  /* 默认：手机 2 列 */
  grid-template-columns: repeat(2, 1fr);
}

/* 平板：3 列 */
@media (min-width: 768px) {
  .productGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* PC：4 列 */
@media (min-width: 1024px) {
  .productGrid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.pagination {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
}

.loadingOverlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 3. 交互设计

#### 加载状态

```
┌─────────────────────────────┐
│                             │
│         ⏳                  │
│   正在加载商品...            │
│                             │
└─────────────────────────────┘
```

#### 空状态

```
┌─────────────────────────────┐
│                             │
│         📦                  │
│      暂无商品                │
│  当前筛选条件下没有找到商品    │
│  请调整筛选条件              │
│                             │
│    [清除筛选]                │
│                             │
└─────────────────────────────┘
```

#### 错误状态

```
┌─────────────────────────────┐
│                             │
│         ⚠️                  │
│      加载失败                │
│  网络连接失败，请检查网络设置  │
│                             │
│    [重试]                    │
│                             │
└─────────────────────────────┘
```

### 4. 卡片间距和边距

```css
/* 商品卡片间距 */
.productGrid {
  gap: 1.5rem; /* 24px */
}

/* 卡片内边距 */
.productCard {
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 页面上边距 */
.container {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
```

---

## 数据流

### 1. 初始加载流程

```
组件挂载
  ↓
useEffect 触发
  ↓
loadProducts(queryParams)
  ↓
设置 loading = true
  ↓
调用 productApi.getProducts()
  ↓
等待响应...
  ↓
成功：更新 products 和 pagination
失败：更新 error
  ↓
设置 loading = false
  ↓
渲染商品列表或错误提示
```

### 2. 筛选流程

```
用户修改筛选条件
  ↓
FilterBar 触发 onQueryChange
  ↓
handleFilterChange(newParams)
  ↓
更新 queryParams 状态
  ↓
重置 page = 1
  ↓
loadProducts(newParams)
  ↓
更新 URL 参数
  ↓
重新渲染列表
```

### 3. 分页流程

```
用户点击页码
  ↓
Pagination 触发 onPageChange
  ↓
handlePageChange(newPage)
  ↓
更新 queryParams.page
  ↓
loadProducts(newParams)
  ↓
滚动到页面顶部
  ↓
更新列表数据
```

---

## 状态管理

### 组件状态清单

| 状态名 | 类型 | 说明 | 初始值 |
|--------|------|------|--------|
| `products` | `ProductListItem[]` | 商品列表数据 | `[]` |
| `pagination` | `PaginationInfo` | 分页信息 | `{page: 1, pageSize: 12, ...}` |
| `loading` | `boolean` | 加载状态 | `false` |
| `error` | `string \| null` | 错误信息 | `null` |
| `queryParams` | `ProductQueryParams` | 查询参数 | `{page: 1, pageSize: 12, ...}` |

### URL 参数同步

**URL 示例**：
```
/products?page=2&pageSize=24&keyword=耳机&minPrice=100&maxPrice=500&status=on_sale&sortBy=price&sortOrder=asc
```

**同步规则**：
- 仅同步非默认值的参数
- 页码为 1 时不显示
- pageSize 为 12 时不显示
- 空值参数不显示

---

## 性能优化

### 1. 图片懒加载

```typescript
// 使用原生 lazy loading
<img 
  src={product.images[0]} 
  alt={product.name}
  loading="lazy"
/>

// 或使用 Intersection Observer
const ImageWithLazyLoad = ({ src, alt }) => {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      }
    )
    
    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  return <img ref={imgRef} src={isVisible ? src : placeholder} alt={alt} />
}
```

### 2. 防抖优化

```typescript
// 关键词搜索防抖
import { debounce } from 'lodash-es'

const handleSearchChange = debounce((keyword: string) => {
  handleFilterChange({ keyword })
}, 300)
```

### 3. 虚拟滚动（可选）

当商品数量超过 100 时，考虑使用虚拟滚动：

```bash
npm install react-window
```

---

## 测试要点

### 1. 渲染测试

- [ ] 页面正确渲染标题和商品数量
- [ ] 商品网格布局正确（PC 4列、平板 3列、手机 2列）
- [ ] 商品卡片正确渲染
- [ ] 筛选栏正确渲染
- [ ] 分页组件正确渲染
- [ ] 卡片间距和边距正确

### 2. 数据加载测试

- [ ] 初始加载显示 Loading 状态
- [ ] 加载成功后显示商品列表
- [ ] 加载失败显示错误状态
- [ ] 无数据时显示空状态
- [ ] 分页切换时显示 Loading 覆盖层
- [ ] 数据正确传递给商品卡片

### 3. 分页功能测试

- [ ] 点击页码正确切换数据
- [ ] 上一页/下一页按钮工作正常
- [ ] 每页数量切换正确
- [ ] 超出范围页码处理
- [ ] 分页切换后滚动到顶部
- [ ] URL 参数同步更新

### 4. 筛选功能测试

- [ ] 关键词搜索正确
- [ ] 价格区间筛选正确
- [ ] 状态筛选正确
- [ ] 排序切换正确
- [ ] 多条件组合筛选正确
- [ ] 筛选后重置到第一页
- [ ] 清除筛选功能正常

### 5. 交互测试

- [ ] 点击商品卡片跳转详情页
- [ ] 重试按钮点击重新加载
- [ ] 清除筛选按钮工作正常
- [ ] Loading 状态阻止重复请求
- [ ] 快速切换页码不会重复请求

### 6. URL 参数测试

- [ ] 初始加载读取 URL 参数
- [ ] 筛选变化更新 URL
- [ ] 分页变化更新 URL
- [ ] 刷新页面保持筛选状态
- [ ] 分享链接打开正确状态

### 7. 响应式测试

- [ ] 手机屏幕（375px）2列布局
- [ ] 平板屏幕（768px）3列布局
- [ ] PC屏幕（1024px）4列布局
- [ ] 超大屏幕（1440px）居中显示
- [ ] 触摸设备交互正常

### 8. 性能测试

- [ ] 首次加载时间 < 2秒
- [ ] 图片懒加载生效
- [ ] 滚动流畅（60fps）
- [ ] 内存使用合理
- [ ] 网络请求数量正常

### 9. 边界情况测试

- [ ] 空列表处理
- [ ] 单条数据显示
- [ ] 大量数据分页（>1000条）
- [ ] 超长商品名称
- [ ] 特殊字符处理
- [ ] 网络断开重试
- [ ] 并发请求处理

---

## 附录

### 路由配置

```typescript
// frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 环境变量

```env
# frontend/.env.development
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

### 最佳实践

✅ **推荐做法**：

1. **使用自定义 Hook 封装数据获取逻辑**
   ```typescript
   const { products, loading, error, pagination } = useProducts()
   ```

2. **URL 参数同步筛选状态**
   - 用户刷新页面保持状态
   - 分享链接可直接打开筛选结果

3. **清晰的 Loading 状态管理**
   - 首次加载：全屏 Loading
   - 分页切换：局部 Loading 覆盖层

4. **友好的错误提示**
   - 显示具体错误信息
   - 提供重试按钮

❌ **避免做法**：

1. **不要一次性加载所有数据**
2. **不要忽略 Loading 状态**
3. **不要硬编码 API URL**
4. **不要忘记错误处理**
5. **不要在组件中直接调用 axios**

### 相关资源

- [React Hooks 文档](https://react.dev/reference/react)
- [React Router 文档](https://reactrouter.com/)
- [CSS Grid 布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)
- [Intersection Observer API](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)

---

**相关模块**：
- 模块 03 - 商品筛选模块
- 模块 04 - 商品卡片组件模块
- 模块 06 - 分页模块
- 模块 15 - API 服务层模块
- 模块 16 - 加载状态组件模块
- 模块 17 - 空状态组件模块

**下一步建议**：模块 04 - 商品卡片组件模块 或 模块 03 - 商品筛选模块
