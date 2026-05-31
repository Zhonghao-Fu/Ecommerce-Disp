import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useProducts } from '../hooks'
import { ProductGrid, Pagination, Loading, Empty, ProductFilter } from '../components'
import { useCurrency } from '../context/CurrencyContext'
import styles from './ProductList.module.css'

export default function ProductList() {
  const intl = useIntl()
  const { currency } = useCurrency()
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
      status: 'on_sale',  // 用户端默认只显示在架商品
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
          <h1 className={styles.title}>{intl.formatMessage({ id: 'product.list.title' })}</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.filterToggle}
              onClick={toggleFilters}
            >
              {showFilters ? intl.formatMessage({ id: 'product.hideFilter' }) : intl.formatMessage({ id: 'product.showFilter' })}
            </button>
            {(filters.keyword || filters.minPrice || filters.maxPrice || filters.status !== 'on_sale') && (
              <button
                className={styles.resetButton}
                onClick={() => {
                  resetFilters()
                  setShowFilters(false)
                }}
              >
                {intl.formatMessage({ id: 'product.resetFilter' })}
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
          <span dangerouslySetInnerHTML={{
            __html: intl.formatMessage(
              { id: 'product.results' },
              { total: pagination.total }
            )
          }} />
          {filters.keyword && (
            <span>, {intl.formatMessage({ id: 'product.searchKeyword' }, { keyword: filters.keyword })}</span>
          )}
          <span> ({intl.formatMessage({ id: 'product.pricesIn' })}: {currency})</span>
        </div>
      )}

      {/* Error State */}
      {error && !products.length && (
        <Empty
          icon="❌"
          title={intl.formatMessage({ id: 'product.loadFailed' })}
          description={error.message}
          actionText={intl.formatMessage({ id: 'common.retry' })}
          onAction={() => setFilters({})}
        />
      )}

      {/* Product Grid */}
      {!error && (
        <ProductGrid
          products={products}
          emptyMessage={intl.formatMessage({ id: 'product.empty' })}
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
        <Loading message={intl.formatMessage({ id: 'product.loading' })} size="small" />
      )}
    </div>
  )
}
