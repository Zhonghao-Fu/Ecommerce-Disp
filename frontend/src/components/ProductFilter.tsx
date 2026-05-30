import { useState, useEffect } from 'react'
import type { ProductFilterState } from '../types'
import styles from './ProductFilter.module.css'

interface ProductFilterProps {
  filters: ProductFilterState
  onFilterChange: (filters: Partial<ProductFilterState>) => void
}

export default function ProductFilter({ filters, onFilterChange }: ProductFilterProps) {
  const [keyword, setKeyword] = useState(filters.keyword || '')
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || '')
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '')
  const [status, setStatus] = useState(filters.status)
  const [sortBy, setSortBy] = useState(filters.sortBy)
  const [sortOrder, setSortOrder] = useState(filters.sortOrder)

  // Apply filters with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword, minPrice, maxPrice])

  const applyFilters = () => {
    const newFilters: Partial<ProductFilterState> = {
      page: 1, // Reset to first page when filters change
    }

    if (keyword.trim()) {
      newFilters.keyword = keyword.trim()
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      newFilters.minPrice = Number(minPrice)
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      newFilters.maxPrice = Number(maxPrice)
    }

    newFilters.status = status
    newFilters.sortBy = sortBy
    newFilters.sortOrder = sortOrder

    onFilterChange(newFilters)
  }

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
  }

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value)
  }

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value)
  }

  const handleStatusChange = (value: ProductFilterState['status']) => {
    setStatus(value)
    setTimeout(applyFilters, 0)
  }

  const handleSortByChange = (value: ProductFilterState['sortBy']) => {
    setSortBy(value)
    setTimeout(applyFilters, 0)
  }

  const handleSortOrderChange = (value: ProductFilterState['sortOrder']) => {
    setSortOrder(value)
    setTimeout(applyFilters, 0)
  }

  const handleReset = () => {
    setKeyword('')
    setMinPrice('')
    setMaxPrice('')
    setStatus('all')
    setSortBy('createdAt')
    setSortOrder('desc')
    onFilterChange({
      page: 1,
      keyword: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  return (
    <div className={styles.filter}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>筛选条件</h3>
        <button className={styles.resetButton} onClick={handleReset}>
          重置
        </button>
      </div>

      <div className={styles.filterGrid}>
        {/* Keyword Search */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="keyword">
            关键词搜索
          </label>
          <input
            id="keyword"
            type="text"
            className={styles.input}
            placeholder="搜索商品名称..."
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>价格区间</label>
          <div className={styles.priceRange}>
            <input
              type="number"
              className={styles.input}
              placeholder="最低价"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
            />
            <span className={styles.priceSeparator}>-</span>
            <input
              type="number"
              className={styles.input}
              placeholder="最高价"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>商品状态</label>
          <div className={styles.selectGroup}>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ProductFilterState['status'])}
            >
              <option value="all">全部</option>
              <option value="on_sale">在售</option>
              <option value="off_sale">下架</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>排序方式</label>
          <div className={styles.sortGroup}>
            <select
              className={styles.select}
              value={sortBy}
              onChange={(e) => handleSortByChange(e.target.value as ProductFilterState['sortBy'])}
            >
              <option value="createdAt">上架时间</option>
              <option value="price">价格</option>
              <option value="name">名称</option>
            </select>
            <select
              className={styles.select}
              value={sortOrder}
              onChange={(e) => handleSortOrderChange(e.target.value as ProductFilterState['sortOrder'])}
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
