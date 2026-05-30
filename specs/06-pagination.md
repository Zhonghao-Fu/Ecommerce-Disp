# 分页模块规格说明书

## 模块概述

本模块负责实现分页导航组件，用于商品列表页的数据分页展示。组件支持页码导航、上一页/下一页按钮、页码范围智能显示、每页数量选择等功能。通过合理的分页策略，避免一次性加载过多数据，提升页面性能和用户体验。组件需要支持响应式布局，在不同设备上保持良好的可用性。

**设计原则**：
- 智能显示：根据总页数动态显示页码范围
- 用户友好：清晰的当前页标识，直观的操作按钮
- 性能优化：避免频繁请求，支持页码跳转
- 响应式：适配不同屏幕尺寸
- 无障碍：键盘导航和屏幕阅读器支持

---

## 功能需求

### 核心需求

1. **页码导航**
   - 显示页码按钮（智能范围）
   - 当前页高亮显示
   - 点击页码跳转

2. **上一页/下一页**
   - 上一页按钮（首页时禁用）
   - 下一页按钮（末页时禁用）
   - 支持快捷跳转首页/末页

3. **智能页码显示**
   - 总页数 ≤ 7：显示所有页码
   - 总页数 > 7：智能省略中间页码
   - 显示省略号（...）表示跳过

4. **每页数量选择**
   - 下拉选择器（12, 24, 36, 48）
   - 切换后重置到第 1 页
   - 显示当前数据范围

5. **信息展示**
   - 显示总记录数
   - 显示当前页码/总页数
   - 显示数据范围（如：1-12 条，共 100 条）

6. **响应式适配**
   - PC 端：完整功能
   - 移动端：简化显示，隐藏部分页码

---

## 技术实现

### 组件结构

```typescript
import { memo } from 'react'
import type { PaginationInfo } from '../types'

import styles from './Pagination.module.css'

interface PaginationProps {
  /** 分页信息 */
  pagination: PaginationInfo
  /** 页码变化回调 */
  onPageChange: (page: number) => void
  /** 每页数量变化回调 */
  onPageSizeChange?: (pageSize: number) => void
  /** 可选：每页数量选项 */
  pageSizeOptions?: number[]
  /** 可选：自定义类名 */
  className?: string
}

/**
 * 分页组件
 * 支持页码导航、上一页/下一页、每页数量选择
 */
export const Pagination = memo(function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 36, 48],
  className = '',
}: PaginationProps) {
  const { page, pageSize, total, totalPages, hasPrev, hasNext } = pagination
  
  // 生成页码数组
  const pageNumbers = generatePageNumbers(page, totalPages)
  
  // 处理页码点击
  const handlePageClick = (pageNum: number) => {
    if (pageNum === page) return
    onPageChange(pageNum)
  }
  
  // 处理上一页
  const handlePrev = () => {
    if (hasPrev) {
      onPageChange(page - 1)
    }
  }
  
  // 处理下一页
  const handleNext = () => {
    if (hasNext) {
      onPageChange(page + 1)
    }
  }
  
  // 处理首页
  const handleFirst = () => {
    if (page !== 1) {
      onPageChange(1)
    }
  }
  
  // 处理末页
  const handleLast = () => {
    if (page !== totalPages) {
      onPageChange(totalPages)
    }
  }
  
  // 处理每页数量变化
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(e.target.value)
    onPageSizeChange?.(newPageSize)
  }
  
  // 计算数据范围
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)
  
  // 只有一页时不显示分页
  if (totalPages <= 1) {
    return (
      <div className={`${styles.info} ${className}`}>
        共 {total} 条数据
      </div>
    )
  }
  
  return (
    <div className={`${styles.container} ${className}`}>
      {/* 数据信息 */}
      <div className={styles.info}>
        <span className={styles.range}>
          {startItem}-{endItem} 条，共 {total} 条
        </span>
      </div>
      
      {/* 分页导航 */}
      <nav className={styles.navigation} aria-label="分页导航">
        {/* 首页按钮 */}
        <button
          onClick={handleFirst}
          disabled={page === 1}
          className={styles.navButton}
          aria-label="首页"
        >
          «
        </button>
        
        {/* 上一页按钮 */}
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={styles.navButton}
          aria-label="上一页"
        >
          ‹
        </button>
        
        {/* 页码按钮 */}
        <div className={styles.pageNumbers}>
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              )
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum as number)}
                className={`${styles.pageButton} ${
                  pageNum === page ? styles.active : ''
                }`}
                aria-label={`第 ${pageNum} 页`}
                aria-current={pageNum === page ? 'page' : undefined}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        
        {/* 下一页按钮 */}
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={styles.navButton}
          aria-label="下一页"
        >
          ›
        </button>
        
        {/* 末页按钮 */}
        <button
          onClick={handleLast}
          disabled={page === totalPages}
          className={styles.navButton}
          aria-label="末页"
        >
          »
        </button>
      </nav>
      
      {/* 每页数量选择 */}
      {onPageSizeChange && (
        <div className={styles.pageSizeSelector}>
          <label htmlFor="pageSize" className={styles.pageSizeLabel}>
            每页显示：
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className={styles.pageSizeSelect}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} 条
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
})

/**
 * 生成智能页码数组
 * 规则：
 * - 总页数 ≤ 7：显示所有页码
 * - 总页数 > 7：显示首尾 + 当前页附近页码 + 省略号
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []
  
  // 总页数 ≤ 7，显示所有页码
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }
  
  // 总页数 > 7，智能显示
  // 始终显示第一页
  pages.push(1)
  
  // 当前页靠近开头
  if (currentPage <= 4) {
    pages.push(2, 3, 4, 5, 'ellipsis', totalPages)
  }
  // 当前页靠近末尾
  else if (currentPage >= totalPages - 3) {
    pages.push('ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
  }
  // 当前页在中间
  else {
    pages.push(
      'ellipsis',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis',
      totalPages
    )
  }
  
  return pages
}
```

### CSS 样式实现

```css
/* Pagination.module.css */

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
  margin-top: 2rem;
  border-top: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

/* 信息区域 */
.info {
  font-size: 14px;
  color: #666666;
  flex-shrink: 0;
}

.range {
  font-weight: 500;
  color: #333333;
}

/* 导航区域 */
.navigation {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

/* 导航按钮（首页、末页、上一页、下一页） */
.navButton {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 16px;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navButton:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #4a90e2;
  color: #4a90e2;
}

.navButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f9f9f9;
}

/* 页码按钮容器 */
.pageNumbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 页码按钮 */
.pageButton {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pageButton:hover:not(.active) {
  background: #f5f5f5;
  border-color: #4a90e2;
  color: #4a90e2;
}

/* 当前页 */
.pageButton.active {
  background: #4a90e2;
  border-color: #4a90e2;
  color: #ffffff;
  font-weight: 600;
}

/* 省略号 */
.ellipsis {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999999;
  letter-spacing: 2px;
}

/* 每页数量选择器 */
.pageSizeSelector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.pageSizeLabel {
  font-size: 14px;
  color: #666666;
  white-space: nowrap;
}

.pageSizeSelect {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.pageSizeSelect:hover {
  border-color: #4a90e2;
}

.pageSizeSelect:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 0;
  }
  
  .info {
    order: 1;
    text-align: center;
  }
  
  .navigation {
    order: 2;
    flex-wrap: wrap;
  }
  
  .pageSizeSelector {
    order: 3;
    justify-content: center;
  }
  
  .navButton,
  .pageButton {
    min-width: 32px;
    height: 32px;
    font-size: 14px;
    padding: 0 8px;
  }
  
  .ellipsis {
    min-width: 32px;
    height: 32px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .navigation {
    gap: 2px;
  }
  
  .pageNumbers {
    gap: 2px;
  }
  
  /* 移动端隐藏首页/末页按钮 */
  .navButton:first-child,
  .navButton:last-child {
    display: none;
  }
  
  .navButton,
  .pageButton {
    min-width: 28px;
    height: 28px;
    font-size: 13px;
  }
  
  .ellipsis {
    min-width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .pageSizeLabel {
    font-size: 13px;
  }
  
  .pageSizeSelect {
    font-size: 13px;
    padding: 4px 8px;
  }
}
```

---

## 接口说明

### Props 接口

```typescript
interface PaginationProps {
  /** 分页信息 */
  pagination: PaginationInfo
  
  /** 页码变化回调 */
  onPageChange: (page: number) => void
  
  /** 每页数量变化回调（可选） */
  onPageSizeChange?: (pageSize: number) => void
  
  /** 每页数量选项（可选，默认 [12, 24, 36, 48]） */
  pageSizeOptions?: number[]
  
  /** 自定义类名（可选） */
  className?: string
}
```

### PaginationInfo 类型

```typescript
interface PaginationInfo {
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
```

---

## UI/UX 设计

### 视觉设计规范

#### 1. 布局规范

| 区域 | PC 布局 | 移动端布局 |
|------|---------|-----------|
| 整体 | 左中右三栏 | 纵向堆叠 |
| 左侧 | 数据信息 | 居中显示 |
| 中间 | 分页导航（居中） | 居中显示 |
| 右侧 | 每页数量选择 | 居中显示 |

#### 2. 颜色规范

| 元素 | 颜色 | 用途 |
|------|------|------|
| 默认背景 | `#ffffff` | 按钮背景 |
| 默认边框 | `#d0d0d0` | 按钮边框 |
| 悬停边框 | `#4a90e2` | 悬停状态 |
| 悬停文字 | `#4a90e2` | 悬停状态 |
| 悬停背景 | `#f5f5f5` | 悬停状态 |
| 当前页背景 | `#4a90e2` | 激活状态 |
| 当前页文字 | `#ffffff` | 激活状态 |
| 禁用文字 | `rgba(0,0,0,0.4)` | 禁用状态 |
| 禁用背景 | `#f9f9f9` | 禁用状态 |
| 省略号 | `#999999` | 省略号颜色 |

#### 3. 字体规范

| 元素 | PC 字号 | 移动端字号 | 字重 |
|------|---------|-----------|------|
| 数据信息 | 14px | 14px | 400 |
| 数据范围 | 14px | 14px | 500 |
| 页码按钮 | 14px | 13px | 400 |
| 导航按钮 | 16px | 14px | 400 |
| 当前页 | 14px | 13px | 600 |

#### 4. 尺寸规范

| 元素 | PC 尺寸 | 移动端尺寸 |
|------|---------|-----------|
| 按钮宽度 | 36px (min) | 28-32px |
| 按钮高度 | 36px | 28-32px |
| 按钮圆角 | 6px | 6px |
| 按钮间距 | 4px | 2px |
| 容器内边距 | 2rem 0 | 1.5rem 0 |

### 交互设计

#### 1. 页码按钮交互

```css
/* 悬停效果 */
.pageButton:hover:not(.active) {
  background: #f5f5f5;
  border-color: #4a90e2;
  color: #4a90e2;
}

/* 当前页 */
.pageButton.active {
  background: #4a90e2;
  border-color: #4a90e2;
  color: #ffffff;
  font-weight: 600;
}
```

**动画参数**：
- 持续时间：`0.2s`
- 缓动函数：`ease`
- 属性：`all`

#### 2. 禁用状态

```css
.navButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f9f9f9;
}
```

**禁用场景**：
- 首页按钮：在第 1 页时禁用
- 上一页按钮：在第 1 页时禁用
- 下一页按钮：在最后一页时禁用
- 末页按钮：在最后一页时禁用

#### 3. 键盘导航

- **Tab 键**：在按钮间切换焦点
- **Enter/Space 键**：激活选中按钮
- **Focus 样式**：默认浏览器焦点环

### 智能页码显示逻辑

#### 场景示例

**场景 1：总页数 ≤ 7**
```
[1] [2] [3] [4] [5] [6] [7]
```

**场景 2：当前页靠近开头（currentPage ≤ 4）**
```
[1] [2] [3] [4] [5] ... [50]
```

**场景 3：当前页靠近末尾（currentPage ≥ totalPages - 3）**
```
[1] ... [46] [47] [48] [49] [50]
```

**场景 4：当前页在中间**
```
[1] ... [24] [25] [26] ... [50]
```

---

## 测试要点

### 渲染测试

- [ ] 总页数 ≤ 7 时显示所有页码
- [ ] 总页数 > 7 时智能显示页码
- [ ] 当前页高亮显示
- [ ] 省略号显示正确
- [ ] 数据范围计算正确
- [ ] 总记录数显示正确
- [ ] 总页数 = 1 时只显示信息不显示导航

### 交互测试

- [ ] 点击页码按钮跳转正确
- [ ] 点击当前页按钮无反应
- [ ] 上一页按钮跳转正确
- [ ] 下一页按钮跳转正确
- [ ] 首页按钮跳转到第 1 页
- [ ] 末页按钮跳转到最后页
- [ ] 禁用按钮不可点击
- [ ] 每页数量切换后回调触发

### 边界情况测试

- [ ] 第 1 页时首页/上一页禁用
- [ ] 最后一页时末页/下一页禁用
- [ ] 总页数为 0 时不显示
- [ ] 总页数为 1 时只显示信息
- [ ] 总记录数为 0 时显示"共 0 条"
- [ ] currentPage = 4 时页码显示正确
- [ ] currentPage = totalPages - 3 时页码显示正确
- [ ] 总页数 = 8 时页码显示正确
- [ ] 总页数 = 100 时页码显示正确

### 响应式测试

- [ ] PC 端（> 768px）三栏布局
- [ ] 移动端（< 768px）纵向堆叠
- [ ] 小屏手机（< 480px）隐藏首末页按钮
- [ ] 按钮尺寸响应式调整
- [ ] 字号响应式调整

### 无障碍测试

- [ ] `aria-label` 正确设置
- [ ] `aria-current="page"` 在当前页
- [ ] 键盘 Tab 导航可用
- [ ] 键盘 Enter/Space 可用
- [ ] 屏幕阅读器可读
- [ ] 禁用按钮有 `disabled` 属性

### 性能测试

- [ ] 使用 React.memo 避免重渲染
- [ ] 页码计算函数高效
- [ ] 大量页码（1000+）渲染流畅

---

## 使用说明

### 基础用法

```typescript
import { Pagination } from '../components/Pagination'
import type { PaginationInfo } from '../types'

const pagination: PaginationInfo = {
  page: 3,
  pageSize: 12,
  total: 100,
  totalPages: 9,
  hasPrev: true,
  hasNext: true,
}

function ProductList() {
  const handlePageChange = (page: number) => {
    console.log('Page changed to:', page)
    // 加载新页数据
  }
  
  return (
    <Pagination
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  )
}
```

### 带每页数量选择

```typescript
<Pagination
  pagination={pagination}
  onPageChange={handlePageChange}
  onPageSizeChange={(pageSize) => {
    console.log('Page size changed to:', pageSize)
    // 重置到第 1 页，加载数据
  }}
  pageSizeOptions={[12, 24, 36, 48]}
/>
```

### 在商品列表页中使用

```typescript
// ProductList.tsx
import { Pagination } from '../components/Pagination'

<Pagination
  pagination={pagination}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

---

## 性能优化建议

### 1. React.memo 包裹

```typescript
export const Pagination = memo(function Pagination(props) {
  // 组件实现
})
```

### 2. 页码计算优化

```typescript
// 使用 useMemo 缓存页码数组
const pageNumbers = useMemo(
  () => generatePageNumbers(page, totalPages),
  [page, totalPages]
)
```

### 3. 避免内联函数

```typescript
// ❌ 避免
<button onClick={() => onPageChange(1)}>首页</button>

// ✅ 推荐
const handleFirst = () => {
  if (page !== 1) onPageChange(1)
}
<button onClick={handleFirst}>首页</button>
```

---

## 文件结构

```
src/
└── components/
    ├── Pagination.tsx          # 分页组件
    └── Pagination.module.css   # 分页样式
```

---

## 依赖关系

### 上游依赖

- **React**: 组件框架
- **TypeScript 类型定义** (19-typescript-types): `PaginationInfo` 接口

### 下游使用

- **商品列表页** (02-product-list): 分页导航
- **路由管理** (08-routing): 页码同步到 URL

---

## 注意事项

### ⚠️ 重要提醒

1. **页码范围计算**：确保 `startItem` 和 `endItem` 计算正确
2. **禁用状态**：首页/末页时正确禁用按钮
3. **总页数为 1**：隐藏分页导航，只显示信息
4. **键盘导航**：确保所有按钮可通过键盘访问
5. **无障碍**：添加正确的 `aria` 属性
6. **响应式**：移动端简化显示，隐藏非必要按钮
7. **性能**：大量页码时避免渲染过多 DOM 节点

### 🔒 安全建议

1. **输入验证**：验证 `onPageChange` 回调的页码范围
2. **边界检查**：确保页码不超出 1 到 totalPages 范围

---

## 未来扩展

### 可能的功能增强

1. **跳转输入框**：输入页码直接跳转
2. **加载更多**：移动端改为"加载更多"按钮
3. **无限滚动**：滚动到底部自动加载
4. **页码缓存**：缓存已加载页的数据
5. **动画效果**：页码切换时的过渡动画
6. **主题定制**：支持不同颜色主题
7. **紧凑模式**：更小尺寸的分页组件

**注意**：当前版本仅实现基础分页功能，上述增强功能待后续迭代。