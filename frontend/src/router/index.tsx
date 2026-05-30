import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Loading } from '../components'

// Lazy load pages for code splitting
const ProductList = lazy(() => import('../pages/ProductList'))
const ProductDetail = lazy(() => import('../pages/ProductDetail'))

// Placeholder pages (can be created later)
function AboutPage() {
  return (
    <div style={{ padding: '32px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>关于我们</h1>
      <p>这是关于我们的页面，将在后续开发中实现。</p>
    </div>
  )
}

function ContactPage() {
  return (
    <div style={{ padding: '32px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>联系我们</h1>
      <p>这是联系我们的页面，将在后续开发中实现。</p>
    </div>
  )
}

function HomePage() {
  return (
    <div style={{ padding: '32px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>首页</h1>
      <p>欢迎来到商品管理系统</p>
      <button
        onClick={() => window.location.href = '/products'}
        style={{
          padding: '12px 24px',
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '16px'
        }}
      >
        浏览商品
      </button>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#999' }}>404</h1>
      <h2 style={{ fontSize: '24px', color: '#666', marginTop: '16px' }}>页面不存在</h2>
      <p style={{ color: '#999', marginTop: '8px' }}>您访问的页面不存在或已被移除</p>
      <button
        onClick={() => window.location.href = '/'}
        style={{
          padding: '10px 24px',
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'pointer',
          marginTop: '24px'
        }}
      >
        返回首页
      </button>
    </div>
  )
}

/**
 * Loading fallback component for lazy-loaded pages
 */
function PageLoading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loading message="页面加载中..." size="large" />
    </div>
  )
}

/**
 * Main Router Component
 * Defines all application routes
 */
export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<HomePage />} />

        {/* Product Routes */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Static Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* 404 Route */}
        <Route path="/404" element={<NotFoundPage />} />
        
        {/* Redirect unknown routes to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
