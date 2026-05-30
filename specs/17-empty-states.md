# 空状态组件模块规格说明书

## 模块概述

本模块负责实现空状态（Empty State）和错误状态（Error State）组件，用于在数据为空、请求失败、网络错误等场景下提供友好的用户提示。空状态设计是用户体验的重要组成部分，能够有效引导用户操作，减少挫败感，提升产品专业度。组件需要支持多种场景、可自定义内容、包含操作引导。

**设计原则**：
- 友好提示：清晰的说明文字，避免技术术语
- 行动引导：提供明确的操作建议或按钮
- 视觉吸引：使用插图或图标增强视觉效果
- 场景适配：针对不同场景提供不同提示
- 响应式：适配不同屏幕尺寸

---

## 功能需求

### 核心需求

1. **空数据状态**
   - 无商品时的提示
   - 无搜索结果提示
   - 无筛选结果提示
   - 自定义图标/插图

2. **错误状态**
   - 网络错误提示
   - 服务器错误提示
   - 404 未找到提示
   - 权限不足提示

3. **操作引导**
   - 重试按钮
   - 返回列表按钮
   - 清除筛选按钮
   - 自定义操作按钮

4. **可配置性**
   - 自定义标题
   - 自定义描述
   - 自定义图标
   - 自定义操作按钮

5. **响应式适配**
   - 移动端布局优化
   - 图标尺寸响应式
   - 文字大小响应式

---

## 技术实现

### EmptyState 组件

```typescript
import { memo, ReactNode } from 'react'

import styles from './EmptyState.module.css'

interface EmptyStateProps {
  /** 标题 */
  title: string
  /** 描述文字 */
  description?: string
  /** 图标（可选，支持 emoji 或自定义组件） */
  icon?: string | ReactNode
  /** 操作按钮（可选） */
  action?: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * 空状态组件
 * 用于展示数据为空、无结果等场景
 */
export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon = '📦',
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        {/* 图标 */}
        <div className={styles.iconWrapper}>
          {typeof icon === 'string' ? (
            <span className={styles.icon}>{icon}</span>
          ) : (
            icon
          )}
        </div>
        
        {/* 标题 */}
        <h3 className={styles.title}>{title}</h3>
        
        {/* 描述 */}
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        {/* 操作按钮 */}
        {action && (
          <div className={styles.actions}>
            {action}
          </div>
        )}
      </div>
    </div>
  )
})
```

### EmptyState CSS

```css
/* EmptyState.module.css */

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.content {
  text-align: center;
  max-width: 500px;
}

.iconWrapper {
  margin-bottom: 1.5rem;
}

.icon {
  font-size: 80px;
  display: block;
  line-height: 1;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.description {
  font-size: 15px;
  color: #666666;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 响应式 */
@media (max-width: 768px) {
  .container {
    min-height: 300px;
    padding: 1.5rem;
  }
  
  .icon {
    font-size: 60px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .description {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .container {
    min-height: 250px;
  }
  
  .icon {
    font-size: 50px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .description {
    font-size: 13px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions > * {
    width: 100%;
  }
}
```

### ErrorState 组件

```typescript
import { memo, ReactNode } from 'react'

import styles from './ErrorState.module.css'

interface ErrorStateProps {
  /** 错误标题 */
  title?: string
  /** 错误描述 */
  description: string
  /** 错误码（可选） */
  errorCode?: string | number
  /** 操作按钮 */
  action?: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * 错误状态组件
 * 用于展示网络错误、服务器错误等场景
 */
export const ErrorState = memo(function ErrorState({
  title = '出错了',
  description,
  errorCode,
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        {/* 错误图标 */}
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>⚠️</span>
        </div>
        
        {/* 标题 */}
        <h3 className={styles.title}>{title}</h3>
        
        {/* 错误描述 */}
        <p className={styles.description}>{description}</p>
        
        {/* 错误码 */}
        {errorCode && (
          <p className={styles.errorCode}>错误码: {errorCode}</p>
        )}
        
        {/* 操作按钮 */}
        {action && (
          <div className={styles.actions}>
            {action}
          </div>
        )}
      </div>
    </div>
  )
})
```

### ErrorState CSS

```css
/* ErrorState.module.css */

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: #fff5f5;
  border-radius: 8px;
}

.content {
  text-align: center;
  max-width: 500px;
}

.iconWrapper {
  margin-bottom: 1.5rem;
}

.icon {
  font-size: 80px;
  display: block;
  line-height: 1;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #e74c3c;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.description {
  font-size: 15px;
  color: #666666;
  line-height: 1.6;
  margin: 0 0 0.5rem 0;
}

.errorCode {
  font-size: 13px;
  color: #999999;
  font-family: monospace;
  margin: 0 0 1.5rem 0;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 响应式 */
@media (max-width: 768px) {
  .container {
    min-height: 300px;
    padding: 1.5rem;
  }
  
  .icon {
    font-size: 60px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .description {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .container {
    min-height: 250px;
  }
  
  .icon {
    font-size: 50px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .description {
    font-size: 13px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions > * {
    width: 100%;
  }
}
```

---

## 使用场景

### 1. 空数据场景

#### 商品列表为空
```typescript
<EmptyState
  icon="🛍️"
  title="暂无商品"
  description="当前还没有商品，请稍后再来查看"
  action={
    <button onClick={() => window.location.reload()}>
      刷新页面
    </button>
  }
/>
```

#### 搜索无结果
```typescript
<EmptyState
  icon="🔍"
  title="未找到相关商品"
  description={`未找到包含「${keyword}」的商品，请尝试其他关键词`}
  action={
    <button onClick={onClearSearch}>
      清除搜索
    </button>
  }
/>
```

#### 筛选无结果
```typescript
<EmptyState
  icon="🎯"
  title="没有符合条件的商品"
  description="请调整筛选条件后重试"
  action={
    <>
      <button onClick={onClearFilters}>
        清除筛选
      </button>
      <button onClick={onBackToList}>
        返回列表
      </button>
    </>
  }
/>
```

#### 购物车为空
```typescript
<EmptyState
  icon="🛒"
  title="购物车是空的"
  description="快去挑选心仪的商品吧"
  action={
    <Link to="/products">
      去逛逛
    </Link>
  }
/>
```

### 2. 错误场景

#### 网络错误
```typescript
<ErrorState
  title="网络异常"
  description="网络连接失败，请检查网络设置后重试"
  errorCode="NETWORK_ERROR"
  action={
    <button onClick={onRetry}>
      重新加载
    </button>
  }
/>
```

#### 服务器错误
```typescript
<ErrorState
  title="服务器错误"
  description="服务器开小差了，请稍后再试"
  errorCode={error.code}
  action={
    <button onClick={onRetry}>
      重试
    </button>
  }
/>
```

#### 权限不足
```typescript
<ErrorState
  icon="🔒"
  title="权限不足"
  description="您没有权限访问此资源，请联系管理员"
  action={
    <button onClick={() => navigate('/login')}>
      去登录
    </button>
  }
/>
```

#### 404 未找到
```typescript
<ErrorState
  title="页面不存在"
  description="您访问的页面已被移除或不存在"
  errorCode="404"
  action={
    <>
      <Link to="/products">返回首页</Link>
      <button onClick={() => window.history.back()}>返回上一页</button>
    </>
  }
/>
```

---

## UI/UX 设计

### 1. 视觉设计规范

#### 尺寸规范

| 元素 | PC 尺寸 | 移动端尺寸 |
|------|---------|-----------|
| 图标 | 80px | 50-60px |
| 标题 | 22px | 18-20px |
| 描述 | 15px | 13-14px |
| 错误码 | 13px | 12px |
| 最小高度 | 400px | 250-300px |
| 内边距 | 2rem | 1.5rem |

#### 颜色规范

| 元素 | 颜色 | 用途 |
|------|------|------|
| Empty 标题 | `#333333` | 空状态标题 |
| Empty 描述 | `#666666` | 空状态描述 |
| Error 标题 | `#e74c3c` | 错误状态标题 |
| Error 描述 | `#666666` | 错误描述 |
| Error 背景 | `#fff5f5` | 错误区域背景 |
| 错误码 | `#999999` | 错误码文字 |
| 按钮主色 | `#4a90e2` | 主要操作按钮 |

#### 图标规范

| 场景 | 推荐图标 | 类型 |
|------|---------|------|
| 数据为空 | 📦 | Emoji |
| 商品为空 | 🛍️ | Emoji |
| 搜索无结果 | 🔍 | Emoji |
| 筛选无结果 | 🎯 | Emoji |
| 购物车空 | 🛒 | Emoji |
| 网络错误 | ⚠️ | Emoji |
| 权限不足 | 🔒 | Emoji |
| 服务器错误 | 🔧 | Emoji |

### 2. 交互设计

#### 按钮样式

```css
/* 主要按钮 */
.primaryButton {
  padding: 12px 24px;
  background: #4a90e2;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primaryButton:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

/* 次要按钮 */
.secondaryButton {
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

.secondaryButton:hover {
  background: #f5f9ff;
  transform: translateY(-2px);
}
```

#### 动画效果

**无动画**：空状态和错误状态不需要动画，保持简洁

**可选淡入**：
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content {
  animation: fadeIn 0.3s ease;
}
```

### 3. 文案规范

#### 标题文案
- 简洁明了，不超过 10 个字
- 避免技术术语
- 语气友好

**示例**：
- ✅ "暂无商品"
- ✅ "未找到相关商品"
- ✅ "网络异常"
- ❌ "数据加载失败，错误码：500"

#### 描述文案
- 解释原因，提供解决方案
- 长度适中，1-2 句话
- 语气友善，避免指责

**示例**：
- ✅ "当前还没有商品，请稍后再来查看"
- ✅ "网络连接失败，请检查网络设置后重试"
- ❌ "服务器错误，请联系开发人员"

---

## 测试要点

### EmptyState 测试

- [ ] 标题正确显示
- [ ] 描述文字正确显示
- [ ] 无描述时不显示描述区域
- [ ] 图标（字符串）正确渲染
- [ ] 图标（组件）正确渲染
- [ ] 默认图标为 📦
- [ ] 操作按钮正确显示
- [ ] 无操作按钮时不显示按钮区域
- [ ] 自定义类名正确应用
- [ ] 响应式布局正确

### ErrorState 测试

- [ ] 标题正确显示（默认"出错了"）
- [ ] 错误描述正确显示
- [ ] 错误码正确显示
- [ ] 无错误码时不显示
- [ ] 操作按钮正确显示
- [ ] 背景颜色为浅红色
- [ ] 标题颜色为红色
- [ ] 响应式布局正确

### 场景测试

- [ ] 商品列表为空显示正确
- [ ] 搜索无结果显示正确
- [ ] 筛选无结果显示正确
- [ ] 网络错误显示正确
- [ ] 服务器错误显示正确
- [ ] 404 错误显示正确
- [ ] 权限不足显示正确

### 交互测试

- [ ] 重试按钮点击回调正确
- [ ] 清除筛选按钮点击回调正确
- [ ] 返回列表按钮导航正确
- [ ] 按钮悬停效果正常
- [ ] 按钮点击反馈正常

### 响应式测试

- [ ] PC 端（> 768px）布局正确
- [ ] 平板端（480px - 768px）布局正确
- [ ] 手机端（< 480px）布局正确
- [ ] 图标尺寸响应式调整
- [ ] 文字大小响应式调整
- [ ] 按钮在移动端纵向排列

### 无障碍测试

- [ ] 标题使用正确的语义标签（h3）
- [ ] 按钮可键盘聚焦
- [ ] 按钮有明确的 `aria-label`
- [ ] 屏幕阅读器可读

### 边界情况测试

- [ ] 标题为空时使用默认标题
- [ ] 描述包含 HTML 特殊字符正确转义
- [ ] 描述文本超长正确换行
- [ ] 多个按钮正确排列
- [ ] 图标组件渲染错误不影响整体

---

## 使用说明

### 基础用法

```typescript
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'

// 空状态
<EmptyState
  icon="🛍️"
  title="暂无商品"
  description="当前还没有商品，请稍后再来查看"
  action={
    <button onClick={() => window.location.reload()}>
      刷新页面
    </button>
  }
/>

// 错误状态
<ErrorState
  title="网络异常"
  description="网络连接失败，请检查网络设置后重试"
  action={
    <button onClick={onRetry}>重新加载</button>
  }
/>
```

### 在列表页中使用

```typescript
function ProductList() {
  if (loading) {
    return <LoadingSpinner size="large" text="加载中..." />
  }
  
  if (error) {
    return (
      <ErrorState
        title="加载失败"
        description={error.message}
        action={
          <button onClick={handleRetry}>重试</button>
        }
      />
    )
  }
  
  if (products.length === 0) {
    return (
      <EmptyState
        icon="🛍️"
        title="暂无商品"
        description={
          hasFilters 
            ? "没有符合条件的商品，请调整筛选条件"
            : "当前还没有商品"
        }
        action={
          hasFilters ? (
            <button onClick={clearFilters}>清除筛选</button>
          ) : null
        }
      />
    )
  }
  
  return <ProductGrid products={products} />
}
```

---

## 文件结构

```
src/
└── components/
    ├── EmptyState.tsx
    ├── EmptyState.module.css
    ├── ErrorState.tsx
    └── ErrorState.module.css
```

---

## 依赖关系

### 上游依赖

- **React**: 组件框架

### 下游使用

- **商品列表页** (02-product-list): 空数据、错误展示
- **商品详情页** (05-product-detail): 错误展示
- **所有数据请求场景**: 通用空状态/错误状态

---

## 注意事项

### ⚠️ 重要提醒

1. **图标选择**：使用通用 emoji 或自定义 SVG 图标
2. **文案友好**：避免技术术语，使用用户能理解的语言
3. **操作引导**：始终提供可操作的按钮或建议
4. **区分场景**：空数据和错误使用不同组件
5. **响应式**：移动端按钮纵向排列
6. **颜色区分**：错误状态使用红色系，空状态使用中性色
7. **背景色**：错误状态添加浅红背景增强提示

### 🔒 最佳实践

1. **空状态**：使用 EmptyState，语气温和
2. **错误状态**：使用 ErrorState，明确问题
3. **提供出路**：始终提供至少一个操作按钮
4. **记录错误**：错误状态应记录日志供调试
5. **避免堆叠**：不要同时显示多个错误状态
6. **超时处理**：长时间加载后显示错误而非一直 loading

---

## 未来扩展

### 可能的功能增强

1. **自定义插图**：支持 SVG 插图替代 emoji
2. **动画效果**：添加淡入、缩放等进入动画
3. **主题支持**：支持暗色模式
4. **多语言**：国际化文案支持
5. **预设模板**：常用场景的预设配置
6. **数据统计**：空状态显示推荐商品
7. **智能引导**：根据用户行为推荐操作
8. **错误报告**：一键提交错误报告

**注意**：当前版本仅实现基础空状态和错误状态组件，上述增强功能待后续迭代。