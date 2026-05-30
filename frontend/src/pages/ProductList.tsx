import { useState } from 'react'
import { useProducts } from '../hooks'
import { ProductGrid, Pagination, Loading, Empty, ProductFilter } from '../components'
import styles from './ProductList.module.css'

export default function ProductList() {
  const [showFilters, setShowFilters] = useState(false)

  const {
    data: products,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    resetFilters
  } = useProducts({
    initialFilters: {
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  })

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    setFilters({ page })
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  if (loading && !products.length) {
    return (
      <div className={styles.container}>
        <Loading message="加载商品中..." size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>商品列表</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.filterToggle}
              onClick={toggleFilters}
            >
              {showFilters ? '隐藏筛选' : '显示筛选'}
            </button>
            {(filters.keyword || filters.minPrice || filters.maxPrice || filters.status !== 'all') && (
              <button
                className={styles.resetButton}
                onClick={() => {
                  resetFilters()
                  setShowFilters(false)
                }}
              >
                重置筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className={styles.filterSection}>
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Results Info */}
      {pagination && (
        <div className={styles.resultsInfo}>
          <span>
            共 <strong>{pagination.total}</strong> 件商品
            {filters.keyword && `，搜索关键词："${filters.keyword}"`}
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !products.length && (
        <Empty
          icon="❌"
          title="加载失败"
          description={error.message}
          actionText="重新加载"
          onAction={() => setFilters({})}
        />
      )}

      {/* Product Grid */}
      {!error && (
        <ProductGrid
          products={products}
          emptyMessage="暂无商品"
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={filters.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Loading indicator for subsequent loads */}
      {loading && products.length > 0 && (
        <Loading message="加载中..." size="small" />
      )}
    </div>
  )
}
