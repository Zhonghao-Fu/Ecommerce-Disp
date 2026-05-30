# 路由管理模块规格说明书

## 模块概述

本模块负责配置前端路由系统，管理页面导航和 URL 结构。使用 React Router DOM 实现单页应用（SPA）的路由功能，支持页面切换、URL 参数传递、路由守卫、404 错误页等核心功能。路由配置是整个前端应用的导航中枢，直接影响用户体验和 SEO 表现。

**设计原则**：
- 语义化 URL：URL 路径清晰表达页面含义
- 嵌套路由：支持复杂的页面布局结构
- 路由守卫：保护特定路由（如未来的管理后台）
- 滚动行为：页面切换时自动滚动到顶部
- 懒加载：路由级代码分割，优化首屏加载

---

## 功能需求

### 核心需求

1. **页面路由**
   - 首页/商品列表页路由
   - 商品详情页路由（动态参数）
   - 404 未找到页面路由

2. **URL 参数管理**
   - 商品列表页：支持查询参数（page, keyword, price 等）
   - 商品详情页：支持动态路由参数（id）

3. **导航功能**
   - 编程式导航（代码跳转）
   - 声明式导航（Link 组件）
   - 浏览器前进/后退支持

4. **路由守卫**
   - 404 路由捕获
   - 错误边界保护
   - 未来扩展：认证守卫

5. **滚动行为**
   - 页面切换时滚动到顶部
   - 锚点导航支持

6. **性能优化**
   - 路由懒加载（代码分割）
   - 预加载优化

---

## 技术实现

### 路由配置文件

```typescript
// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

// 懒加载页面组件
const ProductListPage = lazy(() => import('../pages/ProductList'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'))
const NotFoundPage = lazy(() => import('../pages/NotFound'))

// 根布局组件
import RootLayout from '../layouts/RootLayout'

/**
 * 创建路由配置
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <RootLayout />
      </ErrorBoundary>
    ),
    children: [
      // 首页重定向到商品列表
      {
        index: true,
        element: <Navigate to="/products" replace />,
      },
      
      // 商品列表页
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingSpinner size="large" text="加载中..." />}>
            <ProductListPage />
          </Suspense>
        ),
      },
      
      // 商品详情页
      {
        path: 'product/:id',
        element: (
          <Suspense fallback={<LoadingSpinner size="large" text="加载中..." />}>
            <ProductDetailPage />
          </Suspense>
        ),
        // 验证 ID 参数
        loader: async ({ params }) => {
          if (!params.id || params.id.trim() === '') {
            throw new Response('商品 ID 无效', { status: 400 })
          }
          return { id: params.id }
        },
        errorElement: <NotFoundPage />,
      },
      
      // 404 页面
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingSpinner size="large" text="加载中..." />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
])

/**
 * 路由提供者组件
 */
export default function AppRouter() {
  return <RouterProvider router={router} />
}
```

### 根布局组件

```typescript
// src/layouts/RootLayout.tsx
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import styles from './RootLayout.module.css'

/**
 * 根布局组件
 * 包含导航栏、主内容区、页脚
 */
export default function RootLayout() {
  const location = useLocation()
  
  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])
  
  return (
    <div className={styles.layout}>
      {/* 导航栏 */}
      <Navbar />
      
      {/* 主内容区 */}
      <main className={styles.main}>
        <Outlet />
      </main>
      
      {/* 页脚 */}
      <Footer />
    </div>
  )
}
```

### 应用入口

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
)
```

### 导航工具函数

```typescript
// src/utils/navigation.ts
import { NavigateFunction } from 'react-router-dom'

/**
 * 跳转到商品详情页
 */
export const navigateToProduct = (
  navigate: NavigateFunction,
  productId: string
) => {
  navigate(`/product/${productId}`)
}

/**
 * 跳转到商品列表页
 */
export const navigateToProductList = (
  navigate: NavigateFunction,
  queryParams?: Record<string, string>
) => {
  if (queryParams) {
    const params = new URLSearchParams(queryParams)
    navigate(`/products?${params.toString()}`)
  } else {
    navigate('/products')
  }
}

/**
 * 返回列表页（带参数）
 */
export const goBackToList = (
  navigate: NavigateFunction,
  fallback: string = '/products'
) => {
  navigate(fallback)
}
```

### 404 页面组件

```typescript
// src/pages/NotFound.tsx
import { Link } from 'react-router-dom'

import styles from './NotFound.module.css'

/**
 * 404 页面组件
 */
export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>页面未找到</h2>
        <p className={styles.description}>
          抱歉，您访问的页面不存在或已被移除
        </p>
        <div className={styles.actions}>
          <Link to="/products" className={styles.backButton}>
            返回商品列表
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className={styles.historyButton}
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 404 页面样式

```css
/* NotFound.module.css */

.container {
  min-height: calc(100vh - 300px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.content {
  text-align: center;
  max-width: 600px;
}

.code {
  font-size: 120px;
  font-weight: 700;
  color: #4a90e2;
  margin: 0;
  line-height: 1;
}

.title {
  font-size: 28px;
  color: #333333;
  margin: 1rem 0;
}

.description {
  font-size: 16px;
  color: #666666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.backButton {
  padding: 12px 24px;
  background: #4a90e2;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.backButton:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.historyButton {
  padding: 12px 24px;
  background: #ffffff;
  color: #4a90e2;
  border: 2px solid #4a90e2;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.historyButton:hover {
  background: #f5f9ff;
  transform: translateY(-2px);
}

/* 响应式 */
@media (max-width: 768px) {
  .code {
    font-size: 80px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .backButton,
  .historyButton {
    width: 100%;
  }
}
```

### RootLayout 样式

```css
/* RootLayout.module.css */

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 移动端调整 */
@media (max-width: 768px) {
  .main {
    padding: 1.5rem 1rem;
  }
}
```

---

## 接口说明

### 路由配置

| 路径 | 组件 | 参数 | 说明 |
|------|------|------|------|
| `/` | Navigate | - | 重定向到 `/products` |
| `/products` | ProductListPage | 查询参数 | 商品列表页 |
| `/product/:id` | ProductDetailPage | `id` (string) | 商品详情页 |
| `*` | NotFoundPage | - | 404 页面 |

### 查询参数（列表页）

```typescript
interface ProductListQueryParams {
  /** 页码 */
  page?: string
  
  /** 每页数量 */
  pageSize?: string
  
  /** 搜索关键词 */
  keyword?: string
  
  /** 最低价格 */
  minPrice?: string
  
  /** 最高价格 */
  maxPrice?: string
  
  /** 商品状态 */
  status?: 'on_sale' | 'off_sale'
  
  /** 排序字段 */
  sortBy?: 'price' | 'createdAt' | 'name'
  
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}
```

### URL 示例

```typescript
// 商品列表页 - 默认
/products

// 商品列表页 - 带筛选
/products?page=2&pageSize=24&keyword=iPhone&minPrice=1000&maxPrice=5000&status=on_sale&sortBy=price&sortOrder=asc

// 商品详情页
/product/prod_abc123

// 404 页面
/nonexistent-page
```

### React Router Hooks

```typescript
// 在组件中使用
import { 
  useNavigate,      // 编程式导航
  useParams,        // 获取路由参数
  useLocation,      // 获取当前位置
  useSearchParams,  // 获取查询参数
  Link,             // 声明式导航
  Navigate,         // 重定向
} from 'react-router-dom'

function ExampleComponent() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  // 导航
  navigate('/products')
  navigate(`/product/${id}`)
  navigate(-1) // 后退
  
  // 获取参数
  const page = searchParams.get('page')
  
  // 获取路径
  const pathname = location.pathname
}
```

---

## UI/UX 设计

### 路由结构图

```
/ (根路径)
├── RootLayout (根布局)
│   ├── Navbar (导航栏)
│   ├── <main> (主内容区)
│   │   ├── / → /products (重定向)
│   │   ├── /products (商品列表)
│   │   ├── /product/:id (商品详情)
│   │   └── * (404 页面)
│   └── Footer (页脚)
```

### 页面切换动画

**当前版本**：无动画（直接切换）

**未来扩展**：可添加页面切换过渡动画

```css
/* 可选：淡入淡出效果 */
.page-transition-enter {
  opacity: 0;
}

.page-transition-enter-active {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.page-transition-exit {
  opacity: 1;
}

.page-transition-exit-active {
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

### 滚动行为

```typescript
// 页面切换时滚动到顶部
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
}, [location.pathname])
```

**行为说明**：
- `behavior: 'instant'`：立即滚动，无动画
- 触发时机：`pathname` 变化时
- 目标位置：页面顶部 (0, 0)

### 加载状态

```typescript
<Suspense fallback={<LoadingSpinner size="large" text="加载中..." />}>
  <ProductListPage />
</Suspense>
```

**显示时机**：
- 路由懒加载组件时
- 组件代码下载中
- 显示 Loading 动画

---

## 测试要点

### 路由配置测试

- [ ] 根路径 `/` 重定向到 `/products`
- [ ] `/products` 正确渲染商品列表页
- [ ] `/product/:id` 正确渲染商品详情页
- [ ] `/product/abc123` 传递正确的 id 参数
- [ ] 未知路径显示 404 页面
- [ ] 空 ID 参数被正确验证

### 导航功能测试

- [ ] Link 组件跳转正确
- [ ] navigate() 编程式导航正确
- [ ] 浏览器后退按钮工作正常
- [ ] 浏览器前进按钮工作正常
- [ ] 页面切换后 URL 更新正确

### 查询参数测试

- [ ] `/products?page=2` 解析 page 参数
- [ ] `/products?keyword=test` 解析 keyword 参数
- [ ] 多个参数同时解析正确
- [ ] 参数缺失时使用默认值
- [ ] 参数类型转换正确（string → number）

### 动态参数测试

- [ ] `/product/123` 解析 id = "123"
- [ ] `/product/abc-def-ghi` 解析 id = "abc-def-ghi"
- [ ] `/product/` (空 id) 显示错误或 404
- [ ] 特殊字符 ID 正确处理

### 滚动行为测试

- [ ] 页面切换后滚动到顶部
- [ ] 列表页翻页后滚动到顶部
- [ ] 详情页返回后滚动到顶部
- [ ] 锚点链接滚动正确

### 懒加载测试

- [ ] 路由组件懒加载生效
- [ ] 加载时显示 Loading 动画
- [ ] 加载完成后正确渲染组件
- [ ] 网络慢时 Loading 不闪烁

### 404 页面测试

- [ ] 访问不存在的路径显示 404
- [ ] 404 页面样式正确
- [ ] "返回列表" 按钮跳转正确
- [ ] "返回上一页" 按钮工作正常
- [ ] 404 页面响应式正确

### 错误边界测试

- [ ] 组件渲染错误被捕获
- [ ] 显示友好的错误提示
- [ ] 错误不影响其他路由
- [ ] 控制台输出错误详情

### 性能测试

- [ ] 首屏只加载必要代码
- [ ] 路由切换无卡顿
- [ ] 懒加载组件大小合理
- [ ] 内存无泄漏

---

## 使用说明

### 基础路由使用

```typescript
// App.tsx
import AppRouter from './router'

function App() {
  return <AppRouter />
}
```

### 在组件中导航

```typescript
import { useNavigate, Link } from 'react-router-dom'

function ProductCard({ product }) {
  const navigate = useNavigate()
  
  // 方式 1: Link 组件（推荐）
  return (
    <Link to={`/product/${product.id}`}>
      <Card>{product.name}</Card>
    </Link>
  )
  
  // 方式 2: navigate 函数
  const handleClick = () => {
    navigate(`/product/${product.id}`)
  }
  
  return <button onClick={handleClick}>查看详情</button>
}
```

### 获取路由参数

```typescript
import { useParams, useSearchParams } from 'react-router-dom'

function ProductDetail() {
  // 动态参数
  const { id } = useParams<{ id: string }>()
  
  // 查询参数
  const [searchParams] = useSearchParams()
  const page = searchParams.get('page') || '1'
  
  return <div>Product ID: {id}</div>
}
```

### 编程式导航

```typescript
import { useNavigate } from 'react-router-dom'

function ProductList() {
  const navigate = useNavigate()
  
  // 跳转到指定路径
  const goToDetail = (id: string) => {
    navigate(`/product/${id}`)
  }
  
  // 后退
  const goBack = () => {
    navigate(-1)
  }
  
  // 替换当前历史记录
  const redirect = () => {
    navigate('/products', { replace: true })
  }
  
  // 携带状态
  const navigateWithState = () => {
    navigate('/products', { 
      state: { from: 'detail', productId: '123' } 
    })
  }
}
```

### 路由守卫（未来扩展）

```typescript
// 认证守卫示例
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth()
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return <>{children}</>
}

// 使用
{
  path: 'admin',
  element: (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  ),
}
```

---

## 性能优化建议

### 1. 路由懒加载

```typescript
const ProductListPage = lazy(() => import('../pages/ProductList'))
```

**优势**：
- 减少首屏包体积
- 按需加载页面代码
- 提升首屏加载速度

### 2. 预加载优化

```typescript
// 鼠标悬停时预加载
const prefetchProduct = (id: string) => {
  import(`../pages/ProductDetail`)
}

<Link 
  to={`/product/${id}`}
  onMouseEnter={() => prefetchProduct(id)}
>
  查看详情
</Link>
```

### 3. 代码分割策略

```typescript
// 按路由分割
lazy(() => import('../pages/ProductList'))
lazy(() => import('../pages/ProductDetail'))

// 按功能模块分割
lazy(() => import('../components/ImageGallery'))
```

### 4. 避免不必要的重渲染

```typescript
// ✅ 使用 memo 包裹组件
const ProductList = memo(function ProductList() {
  // ...
})

// ✅ 使用 useCallback 缓存函数
const navigateToDetail = useCallback(
  (id: string) => navigate(`/product/${id}`),
  [navigate]
)
```

---

## 文件结构

```
src/
├── main.tsx                    # 应用入口
├── router/
│   └── index.tsx               # 路由配置
├── layouts/
│   ├── RootLayout.tsx          # 根布局组件
│   └── RootLayout.module.css   # 布局样式
├── pages/
│   ├── ProductList/
│   │   ├── ProductList.tsx     # 商品列表页
│   │   └── ProductList.module.css
│   ├── ProductDetail/
│   │   ├── ProductDetail.tsx   # 商品详情页
│   │   └── ProductDetail.module.css
│   └── NotFound.tsx            # 404 页面
└── utils/
    └── navigation.ts           # 导航工具函数
```

---

## 依赖关系

### 上游依赖

- **React Router DOM**: 路由库（v6+）
- **React**: 组件框架
- **加载状态组件** (16-loading-states): LoadingSpinner
- **错误边界组件**: ErrorBoundary

### 下游使用

- **导航栏** (01-navbar): 使用 Link 组件导航
- **商品列表页** (02-product-list): 查询参数管理
- **商品详情页** (05-product-detail): 动态路由参数
- **分页组件** (06-pagination): 页码同步到 URL
- **商品卡片** (04-product-card): 点击跳转详情

---

## 注意事项

### ⚠️ 重要提醒

1. **React Router 版本**：使用 v6+（API 与 v5 完全不同）
2. **useNavigate vs useHistory**：v6 使用 `useNavigate` 替代 `useHistory`
3. **Routes vs Switch**：v6 使用 `<Routes>` 替代 `<Switch>`
4. **路径匹配**：v6 使用相对路径，更直观
5. **懒加载 Suspense**：必须包裹 `<Suspense>` 提供 fallback
6. **滚动行为**：手动实现，React Router v6 不自动处理
7. **查询参数**：使用 `useSearchParams` 而非路由参数

### 🔒 安全建议

1. **参数验证**：验证动态路由参数（如 ID 格式）
2. **XSS 防护**：URL 参数渲染时注意转义
3. **路由守卫**：未来管理后台需要认证保护
4. **错误边界**：防止路由组件错误导致白屏

---

## 未来扩展

### 可能的功能增强

1. **路由过渡动画**：页面切换淡入淡出效果
2. **面包屑导航**：自动生成面包屑
3. **路由元数据**：设置页面标题、SEO 标签
4. **权限路由**：基于角色的路由访问控制
5. **路由预加载**：智能预测用户行为预加载页面
6. **历史记录管理**：自定义前进/后退行为
7. **深度链接**：支持分享带参数的 URL
8. **路由缓存**：缓存已访问页面状态
9. **多语言路由**：`/en/products`, `/zh/products`
10. **Analytics 集成**：路由切换时发送页面访问统计

**注意**：当前版本仅实现基础路由功能，上述增强功能待后续迭代。