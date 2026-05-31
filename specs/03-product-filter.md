# 商品筛选模块规格说明书

## 模块概述

本模块负责实现商品筛选功能组件，提供关键词搜索、价格区间筛选、状态筛选、排序选择等多种筛选条件。作为商品列表页的重要组成部分，筛选组件帮助用户快速定位目标商品，提升购物体验。组件需要支持响应式布局、实时搜索、防抖优化、状态同步等功能。

**设计原则**：
- 用户友好：直观的筛选界面，操作简单
- 实时反馈：筛选条件变化即时更新结果
- 性能优化：搜索防抖，避免频繁请求
- 状态同步：筛选条件与 URL 参数同步
- 响应式设计：适配不同屏幕尺寸

---

## 功能需求

### 核心需求

1. **关键词搜索**
   - 输入框输入商品名称关键词
   - 实时搜索（防抖 500ms）
   - 清空按钮
   - 搜索按钮（移动端）

2. **价格区间筛选**
   - 最低价输入框
   - 最高价输入框
   - 快捷价格区间按钮（0-100, 100-500, 500-1000, 1000+）
   - 价格输入验证（非负数、最大值限制）

3. **状态筛选**
   - 全部商品（包含在售和下架）
   - 在售（`on_sale`）
   - 下架（`off_sale`）
   - 单选模式
   - **注意**：`status='all'` 会查询所有商品，不过滤状态

4. **排序选择**
   - 默认排序（创建时间降序）
   - 价格升序
   - 价格降序
   - 名称 A-Z
   - 名称 Z-A
   - 最新上架

5. **筛选操作**
   - 应用筛选按钮
   - 清除所有筛选按钮
   - 当前筛选条件显示
   - 筛选条件计数

---

## 技术实现

### 技术选型

- **框架**: React 18+ 或 Vue 3+
- **状态管理**: React Hooks（useState、useEffect、useCallback、useMemo）
- **防抖**: lodash-es debounce 或自定义 Hook
- **样式**: Tailwind CSS 或 CSS Modules
- **图标**: 内联 SVG 或图标库

### 文件结构

```
frontend/src/
├── components/
│   ├── FilterBar.tsx                # 筛选栏主组件
│   ├── FilterBar.module.css         # 筛选栏样式
│   ├── SearchInput.tsx              # 搜索输入框子组件
│   ├── PriceRange.tsx               # 价格区间子组件
│   ├── StatusFilter.tsx             # 状态筛选子组件
│   └── SortSelect.tsx               # 排序选择子组件
├── hooks/
│   └── useDebounce.ts               # 防抖 Hook
└── types/
    └── filter.ts                    # 筛选相关类型
```

---

## 组件实现

### 1. 筛选栏主组件

```typescript
// frontend/src/components/FilterBar.tsx
import { useState, useCallback, useMemo } from 'react'
import { SearchInput } from './SearchInput'
import { PriceRange } from './PriceRange'
import { StatusFilter } from './StatusFilter'
import { SortSelect } from './SortSelect'
import { useDebounce } from '../hooks/useDebounce'
import type { ProductQueryParams } from '../types'

import styles from './FilterBar.module.css'

interface FilterBarProps {
  /** 当前查询参数 */
  queryParams: ProductQueryParams
  /** 查询参数变化回调 */
  onQueryChange: (params: ProductQueryParams) => void
  /** 自定义类名 */
  className?: string
}

/**
 * 筛选栏组件
 */
export function FilterBar({ queryParams, onQueryChange, className = '' }: FilterBarProps) {
  // 本地状态（用于输入框）
  const [keywordInput, setKeywordInput] = useState(queryParams.keyword || '')
  const [minPriceInput, setMinPriceInput] = useState(queryParams.minPrice?.toString() || '')
  const [maxPriceInput, setMaxPriceInput] = useState(queryParams.maxPrice?.toString() || '')

  // 防抖关键词搜索
  const debouncedKeyword = useDebounce(keywordInput, 300)

  // 关键词变化处理
  const handleKeywordChange = useCallback(() => {
    onQueryChange({
      ...queryParams,
      keyword: debouncedKeyword || undefined,
    })
  }, [debouncedKeyword, queryParams, onQueryChange])

  // 关键词输入处理
  const handleKeywordInput = (value: string) => {
    setKeywordInput(value)
  }

  // 关键词清空处理
  const handleKeywordClear = () => {
    setKeywordInput('')
    onQueryChange({
      ...queryParams,
      keyword: undefined,
    })
  }

  // 价格区间变化处理
  const handlePriceChange = useCallback(() => {
    const minPrice = minPriceInput ? parseFloat(minPriceInput) : undefined
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput) : undefined
    
    onQueryChange({
      ...queryParams,
      minPrice,
      maxPrice,
    })
  }, [minPriceInput, maxPriceInput, queryParams, onQueryChange])

  // 最低价输入处理
  const handleMinPriceInput = (value: string) => {
    setMinPriceInput(value)
  }

  // 最高价输入处理
  const handleMaxPriceInput = (value: string) => {
    setMaxPriceInput(value)
  }

  // 快捷价格区间选择
  const handleQuickPriceSelect = (min: number | undefined, max: number | undefined) => {
    setMinPriceInput(min?.toString() || '')
    setMaxPriceInput(max?.toString() || '')
    
    onQueryChange({
      ...queryParams,
      minPrice: min,
      maxPrice: max,
    })
  }

  // 状态筛选变化处理
  const handleStatusChange = (status: 'on_sale' | 'off_sale' | undefined) => {
    onQueryChange({
      ...queryParams,
      status,
    })
  }

  // 排序变化处理
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onQueryChange({
      ...queryParams,
      sortBy: sortBy as any,
      sortOrder,
    })
  }

  // 清除所有筛选
  const handleClearAll = () => {
    setKeywordInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    
    onQueryChange({
      page: 1,
      pageSize: queryParams.pageSize,
    })
  }

  // 计算活跃筛选条件数量
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (queryParams.keyword) count++
    if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) count++
    if (queryParams.status) count++
    if (queryParams.sortBy && queryParams.sortBy !== 'createdAt') count++
    return count
  }, [queryParams])

  return (
    <div className={`${styles.filterBar} ${className}`}>
      {/* 顶部：搜索框 + 清除按钮 */}
      <div className={styles.filterBarTop}>
        <SearchInput
          value={keywordInput}
          onChange={handleKeywordInput}
          onSearch={handleKeywordChange}
          onClear={handleKeywordClear}
          placeholder="搜索商品名称..."
          className={styles.searchInput}
        />
        
        {activeFilterCount > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearAll}
          >
            清除筛选 ({activeFilterCount})
          </button>
        )}
      </div>

      {/* 中部：价格区间 + 状态筛选 */}
      <div className={styles.filterBarMiddle}>
        <PriceRange
          minPrice={minPriceInput}
          maxPrice={maxPriceInput}
          onMinPriceChange={handleMinPriceInput}
          onMaxPriceChange={handleMaxPriceInput}
          onApply={handlePriceChange}
          onQuickSelect={handleQuickPriceSelect}
          className={styles.priceRange}
        />
        
        <StatusFilter
          value={queryParams.status}
          onChange={handleStatusChange}
          className={styles.statusFilter}
        />
      </div>

      {/* 底部：排序选择 */}
      <div className={styles.filterBarBottom}>
        <SortSelect
          sortBy={queryParams.sortBy || 'createdAt'}
          sortOrder={queryParams.sortOrder || 'desc'}
          onChange={handleSortChange}
          className={styles.sortSelect}
        />
      </div>
    </div>
  )
}
```

### 2. 搜索输入框组件

```typescript
// frontend/src/components/SearchInput.tsx
import { useRef, useEffect } from 'react'

import styles from './FilterBar.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
  placeholder?: string
  className?: string
}

/**
 * 搜索输入框组件
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = '搜索商品...',
  className = '',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className={`${styles.searchInputWrapper} ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      
      {/* 清空按钮 */}
      {value && (
        <button
          type="button"
          className={styles.clearIcon}
          onClick={onClear}
          aria-label="清空搜索"
        >
          ✕
        </button>
      )}
      
      {/* 搜索按钮 */}
      <button
        type="button"
        className={styles.searchButton}
        onClick={onSearch}
        aria-label="搜索"
      >
        🔍
      </button>
    </div>
  )
}
```

### 3. 价格区间组件

```typescript
// frontend/src/components/PriceRange.tsx
import styles from './FilterBar.module.css'

interface PriceRangeProps {
  minPrice: string
  maxPrice: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onApply: () => void
  onQuickSelect: (min: number | undefined, max: number | undefined) => void
  className?: string
}

/**
 * 快捷价格区间选项
 */
const QUICK_PRICE_RANGES = [
  { label: '0-100', min: 0, max: 100 },
  { label: '100-500', min: 100, max: 500 },
  { label: '500-1000', min: 500, max: 1000 },
  { label: '1000+', min: 1000, max: undefined },
]

/**
 * 价格区间组件
 */
export function PriceRange({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onApply,
  onQuickSelect,
  className = '',
}: PriceRangeProps) {
  // 价格输入验证
  const handlePriceInput = (type: 'min' | 'max', value: string) => {
    // 只允许数字和小数点
    if (!/^\d*\.?\d*$/.test(value)) return
    
    // 限制最大值
    const numValue = parseFloat(value)
    if (numValue > 999999) return
    
    if (type === 'min') {
      onMinPriceChange(value)
    } else {
      onMaxPriceChange(value)
    }
  }

  return (
    <div className={`${styles.priceRange} ${className}`}>
      <label className={styles.priceRangeLabel}>价格区间</label>
      
      <div className={styles.priceRangeInputs}>
        <input
          type="text"
          value={minPrice}
          onChange={(e) => handlePriceInput('min', e.target.value)}
          placeholder="最低价"
          className={styles.priceInput}
        />
        <span className={styles.priceSeparator}>-</span>
        <input
          type="text"
          value={maxPrice}
          onChange={(e) => handlePriceInput('max', e.target.value)}
          placeholder="最高价"
          className={styles.priceInput}
        />
        <button
          type="button"
          className={styles.applyButton}
          onClick={onApply}
        >
          确定
        </button>
      </div>
      
      {/* 快捷价格区间 */}
      <div className={styles.quickPriceRanges}>
        {QUICK_PRICE_RANGES.map((range) => (
          <button
            key={range.label}
            type="button"
            className={styles.quickPriceButton}
            onClick={() => onQuickSelect(range.min, range.max)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 4. 状态筛选组件

```typescript
// frontend/src/components/StatusFilter.tsx
import styles from './FilterBar.module.css'

interface StatusFilterProps {
  value: 'on_sale' | 'off_sale' | undefined
  onChange: (status: 'on_sale' | 'off_sale' | undefined) => void
  className?: string
}

/**
 * 状态筛选选项
 */
const STATUS_OPTIONS = [
  { label: '全部', value: undefined },
  { label: '已上架', value: 'on_sale' as const },
  { label: '已下架', value: 'off_sale' as const },
]

/**
 * 状态筛选组件
 */
export function StatusFilter({ value, onChange, className = '' }: StatusFilterProps) {
  return (
    <div className={`${styles.statusFilter} ${className}`}>
      <label className={styles.statusFilterLabel}>商品状态</label>
      
      <div className={styles.statusOptions}>
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            className={`${styles.statusOption} ${
              value === option.value ? styles.statusOptionActive : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 5. 排序选择组件

```typescript
// frontend/src/components/SortSelect.tsx
import styles from './FilterBar.module.css'

interface SortSelectProps {
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  className?: string
}

/**
 * 排序选项
 */
const SORT_OPTIONS = [
  { label: '默认排序', sortBy: 'createdAt', sortOrder: 'desc' as const },
  { label: '价格从低到高', sortBy: 'price', sortOrder: 'asc' as const },
  { label: '价格从高到低', sortBy: 'price', sortOrder: 'desc' as const },
  { label: '名称 A-Z', sortBy: 'name', sortOrder: 'asc' as const },
  { label: '名称 Z-A', sortBy: 'name', sortOrder: 'desc' as const },
  { label: '最新上架', sortBy: 'createdAt', sortOrder: 'desc' as const },
]

/**
 * 排序选择组件
 */
export function SortSelect({ sortBy, sortOrder, onChange, className = '' }: SortSelectProps) {
  return (
    <div className={`${styles.sortSelect} ${className}`}>
      <label className={styles.sortSelectLabel}>排序方式</label>
      
      <select
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => {
          const [newSortBy, newSortOrder] = e.target.value.split('-')
          onChange(newSortBy, newSortOrder as 'asc' | 'desc')
        }}
        className={styles.sortSelectDropdown}
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={`${option.sortBy}-${option.sortOrder}`}
            value={`${option.sortBy}-${option.sortOrder}`}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

## UI/UX 设计

### 1. 桌面端布局

```
┌────────────────────────────────────────────────────────┐
│ [🔍 搜索商品...]                           [清除筛选 (2)]│
├────────────────────────────────────────────────────────┤
│ 价格区间: [____] - [____] [确定]                        │
│ [0-100] [100-500] [500-1000] [1000+]                   │
│                                                        │
│ 商品状态: [全部] [已上架] [已下架]                      │
├────────────────────────────────────────────────────────┤
│ 排序方式: [默认排序 ▼]                                 │
└────────────────────────────────────────────────────────┘
```

### 2. 移动端布局

```
┌─────────────────────────┐
│ [🔍 搜索商品...] [搜索] │
│               [清除(2)] │
├─────────────────────────┤
│ 价格区间:                │
│ [____] - [____] [确定]  │
│ [0-100] [100-500]       │
│ [500-1000] [1000+]      │
├─────────────────────────┤
│ 商品状态:                │
│ [全部] [已上架] [已下架]│
├─────────────────────────┤
│ 排序方式: [默认排序 ▼]  │
└─────────────────────────┘
```

### 3. 样式设计

```css
/* frontend/src/components/FilterBar.module.css */

.filterBar {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.filterBarTop {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.searchInputWrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.searchInput {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.searchInput:focus {
  outline: none;
  border-color: #4a90e2;
}

.clearIcon {
  position: absolute;
  right: 3rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #999;
}

.searchButton {
  position: absolute;
  right: 0.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.clearButton {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #666;
  white-space: nowrap;
}

.filterBarMiddle {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.priceRangeLabel,
.statusFilterLabel,
.sortSelectLabel {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.priceRangeInputs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.priceInput {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.priceSeparator {
  color: #999;
}

.applyButton {
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.quickPriceRanges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quickPriceButton {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.quickPriceButton:hover {
  background: #e8f0fe;
  border-color: #4a90e2;
}

.statusOptions {
  display: flex;
  gap: 0.5rem;
}

.statusOption {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.statusOptionActive {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.sortSelectDropdown {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filterBar {
    padding: 1rem;
  }
  
  .filterBarMiddle {
    grid-template-columns: 1fr;
  }
  
  .quickPriceRanges {
    gap: 0.375rem;
  }
  
  .quickPriceButton {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
```

---

## 防抖 Hook

```typescript
// frontend/src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

/**
 * 防抖 Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
```

---

## 交互设计

### 1. 关键词搜索交互

```
用户输入关键词
  ↓
触发 onChange（更新本地状态）
  ↓
等待 300ms（防抖）
  ↓
触发 onSearch（调用 API）
  ↓
更新商品列表
```

### 2. 价格区间交互

```
用户输入价格
  ↓
验证输入（数字、范围）
  ↓
点击“确定”按钮
  ↓
触发 onApply（调用 API）
  ↓
更新商品列表

或：点击快捷价格区间
  ↓
自动填充输入框
  ↓
立即调用 API
```

### 3. 状态筛选交互

```
用户点击状态按钮
  ↓
高亮选中按钮
  ↓
立即调用 API
  ↓
更新商品列表
```

### 4. 排序选择交互

```
用户选择排序方式
  ↓
下拉框更新
  ↓
立即调用 API
  ↓
更新商品列表
```

---

## 测试要点

### 1. 渲染测试

- [ ] 筛选栏正确渲染所有子组件
- [ ] 搜索框显示默认值
- [ ] 价格输入框显示默认值
- [ ] 状态按钮正确高亮
- [ ] 排序下拉框显示正确选项
- [ ] 清除按钮仅在活跃筛选时显示
- [ ] 筛选计数正确

### 2. 关键词搜索测试

- [ ] 输入关键词触发 onChange
- [ ] 防抖 300ms 后触发搜索
- [ ] 清空按钮工作正常
- [ ] 回车键触发搜索
- [ ] 搜索按钮点击触发搜索
- [ ] 清空后重新搜索

### 3. 价格区间测试

- [ ] 输入最低价正确
- [ ] 输入最高价正确
- [ ] 输入验证（非数字拒绝）
- [ ] 超过最大值拒绝
- [ ] 点击确定触发筛选
- [ ] 快捷价格区间点击正确
- [ ] 清除价格区间

### 4. 状态筛选测试

- [ ] 点击“全部”清除状态筛选
- [ ] 点击“已上架”筛选上架商品
- [ ] 点击“已下架”筛选下架商品
- [ ] 按钮高亮正确
- [ ] 单选模式正常

### 5. 排序选择测试

- [ ] 选择价格升序正确
- [ ] 选择价格降序正确
- [ ] 选择名称排序正确
- [ ] 选择时间排序正确
- [ ] 下拉框显示正确

### 6. 清除筛选测试

- [ ] 点击清除按钮清空所有条件
- [ ] 输入框清空
- [ ] 状态按钮重置
- [ ] 排序重置为默认
- [ ] 调用 onQueryChange 正确

### 7. 响应式测试

- [ ] 桌面端布局正确（2列）
- [ ] 平板端布局正确（2列）
- [ ] 移动端布局正确（1列）
- [ ] 按钮大小适配
- [ ] 字体大小适配

### 8. 性能测试

- [ ] 防抖生效（300ms）
- [ ] 快速输入不触发多次请求
- [ ] 组件渲染性能良好
- [ ] 内存使用合理

### 9. 边界情况测试

- [ ] 空关键词处理
- [ ] 价格 0 处理
- [ ] 价格最大值处理
- [ ] 特殊字符输入
- [ ] 超长关键词
- [ ] 快速连续点击
- [ ] 网络请求失败处理

---

## 附录

### 筛选条件类型定义

```typescript
// frontend/src/types/filter.ts

/**
 * 筛选条件接口
 */
export interface FilterState {
  /** 关键词 */
  keyword?: string
  /** 最低价 */
  minPrice?: number
  /** 最高价 */
  maxPrice?: number
  /** 商品状态 */
  status?: 'on_sale' | 'off_sale'
  /** 排序字段 */
  sortBy?: 'price' | 'createdAt' | 'name'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 快捷价格区间
 */
export interface QuickPriceRange {
  label: string
  min: number | undefined
  max: number | undefined
}

/**
 * 排序选项
 */
export interface SortOption {
  label: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}
```

### 最佳实践

✅ **推荐做法**：

1. **使用防抖优化搜索**
   ```typescript
   const debouncedKeyword = useDebounce(keywordInput, 300)
   ```

2. **本地状态与筛选状态分离**
   - 输入框使用本地状态（实时响应）
   - 筛选使用父组件状态（触发 API）

3. **价格输入验证**
   - 只允许数字和小数点
   - 限制最大值 999999
   - 验证最小值 <= 最大值

4. **活跃的筛选条件计数**
   - 用户体验友好
   - 一键清除所有筛选

❌ **避免做法**：

1. **不要每次输入都触发 API**
2. **不要忽略输入验证**
3. **不要硬编码筛选选项**
4. **不要忘记响应式设计**

### 相关资源

- [React Hooks 文档](https://react.dev/reference/react)
- [Debounce 实现](https://lodash.com/docs/#debounce)
- [CSS Grid 布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)
- [表单验证最佳实践](https://web.dev/form-validation/)

---

**相关模块**：
- 模块 02 - 商品列表页模块
- 模块 04 - 商品卡片组件模块
- 模块 15 - API 服务层模块
- 模块 19 - TypeScript 类型定义

**下一步建议**：模块 04 - 商品卡片组件模块
