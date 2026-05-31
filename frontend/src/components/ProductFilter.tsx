import { useState, useCallback } from 'react'
import { useIntl } from 'react-intl'
import type { ProductFilterState } from '../types'
import styles from './ProductFilter.module.css'

interface ProductFilterProps {
  filters: ProductFilterState
  onFilterChange: (filters: Partial<ProductFilterState>) => void
}

export default function ProductFilter({ filters, onFilterChange }: ProductFilterProps) {
  const intl = useIntl()
  
  // Local state for input fields - initialized from filters
  const [keyword, setKeyword] = useState(filters.keyword || '')
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || '')
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '')
  const [status, setStatus] = useState(filters.status)
  const [sortBy, setSortBy] = useState(filters.sortBy)
  const [sortOrder, setSortOrder] = useState(filters.sortOrder)

  // Apply filters immediately (for selects) or via search button (for text inputs)
  const applyFilters = useCallback((updates: Partial<ProductFilterState>) => {
    const newFilters: Partial<ProductFilterState> = {
      page: 1,
      status,
      sortBy,
      sortOrder,
      ...updates
    }

    // Include keyword - use current state value (can be empty string)
    if (keyword.trim()) {
      newFilters.keyword = keyword.trim()
    } else {
      newFilters.keyword = undefined  // Explicitly clear keyword
    }
    
    // Include price range
    if (minPrice && !isNaN(Number(minPrice))) {
      newFilters.minPrice = Number(minPrice)
    } else {
      newFilters.minPrice = undefined  // Explicitly clear
    }
    
    if (maxPrice && !isNaN(Number(maxPrice))) {
      newFilters.maxPrice = Number(maxPrice)
    } else {
      newFilters.maxPrice = undefined  // Explicitly clear
    }

    onFilterChange(newFilters)
  }, [keyword, minPrice, maxPrice, status, sortBy, sortOrder, onFilterChange])

  // Handle search button click
  const handleSearch = () => {
    applyFilters({})
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
    applyFilters({ status: value })
  }

  const handleSortByChange = (value: ProductFilterState['sortBy']) => {
    setSortBy(value)
    applyFilters({ sortBy: value })
  }

  const handleSortOrderChange = (value: ProductFilterState['sortOrder']) => {
    setSortOrder(value)
    applyFilters({ sortOrder: value })
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
        <h3 className={styles.filterTitle}>{intl.formatMessage({ id: 'filter.title' })}</h3>
        <div className={styles.headerActions}>
          <button className={styles.searchButton} onClick={handleSearch}>
            {intl.formatMessage({ id: 'common.search' })}
          </button>
          <button className={styles.resetButton} onClick={handleReset}>
            {intl.formatMessage({ id: 'common.reset' })}
          </button>
        </div>
      </div>

      <div className={styles.filterGrid}>
        {/* Keyword Search */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="keyword">
            {intl.formatMessage({ id: 'filter.keyword' })}
          </label>
          <input
            id="keyword"
            type="text"
            className={styles.input}
            placeholder={intl.formatMessage({ id: 'filter.keywordPlaceholder' })}
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{intl.formatMessage({ id: 'filter.price' })}</label>
          <div className={styles.priceRange}>
            <input
              type="number"
              className={styles.input}
              placeholder={intl.formatMessage({ id: 'filter.minPrice' })}
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
            />
            <span className={styles.priceSeparator}>-</span>
            <input
              type="number"
              className={styles.input}
              placeholder={intl.formatMessage({ id: 'filter.maxPrice' })}
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{intl.formatMessage({ id: 'filter.status' })}</label>
          <div className={styles.selectGroup}>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ProductFilterState['status'])}
            >
              <option value="all">{intl.formatMessage({ id: 'status.all' })}</option>
              <option value="on_sale">{intl.formatMessage({ id: 'status.on_sale' })}</option>
              <option value="off_sale">{intl.formatMessage({ id: 'status.off_sale' })}</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{intl.formatMessage({ id: 'filter.sort' })}</label>
          <div className={styles.sortGroup}>
            <select
              className={styles.select}
              value={sortBy}
              onChange={(e) => handleSortByChange(e.target.value as ProductFilterState['sortBy'])}
            >
              <option value="createdAt">{intl.formatMessage({ id: 'sort.createdAt' })}</option>
              <option value="price">{intl.formatMessage({ id: 'sort.price' })}</option>
              <option value="name">{intl.formatMessage({ id: 'sort.name' })}</option>
            </select>
            <select
              className={styles.select}
              value={sortOrder}
              onChange={(e) => handleSortOrderChange(e.target.value as ProductFilterState['sortOrder'])}
            >
              <option value="desc">{intl.formatMessage({ id: 'sort.desc' })}</option>
              <option value="asc">{intl.formatMessage({ id: 'sort.asc' })}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
