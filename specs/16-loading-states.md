# 加载状态组件模块规格说明书

## 模块概述

本模块负责实现多种加载状态组件，用于在数据请求、页面切换、组件渲染等异步操作期间提供视觉反馈。包含旋转加载器（Spinner）、骨架屏（Skeleton）、进度条等多种加载指示器，提升用户体验，减少等待焦虑。组件需要支持不同尺寸、颜色、样式配置，并具有良好的性能和可访问性。

**设计原则**：
- 视觉反馈：明确的加载状态指示
- 多样性：提供多种加载组件适配不同场景
- 可配置：支持尺寸、颜色、文本自定义
- 性能优先：轻量级实现，避免卡顿
- 无障碍：屏幕阅读器友好

---

## 功能需求

### 核心需求

1. **旋转加载器（Spinner）**
   - 圆形旋转动画
   - 支持多种尺寸（small, medium, large）
   - 可选加载文本
   - 支持颜色自定义

2. **骨架屏（Skeleton）**
   - 模拟内容占位
   - 支持文本、图片、卡片等多种形状
   - 呼吸动画效果
   - 可组合使用

3. **进度条（Progress Bar）**
   - 线性进度指示
   - 支持确定/不确定模式
   - 百分比显示
   - 平滑动画

4. **全屏加载遮罩**
   - 半透明背景遮罩
   - 居中加载提示
   - 阻止背景交互

5. **响应式适配**
   - 尺寸响应式调整
   - 移动端优化

---

## 技术实现

### 1. LoadingSpinner 组件

```typescript
import { memo } from 'react'

import styles from './LoadingSpinner.module.css'

interface LoadingSpinnerProps {
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 加载文本 */
  text?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 旋转加载器组件
 */
export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'medium',
  text,
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div 
      className={`${styles.container} ${styles[size]} ${className}`}
      role="status"
      aria-label="加载中"
    >
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
      <span className={styles.screenReader}>{text || '加载中...'}</span>
    </div>
  )
})
```

### LoadingSpinner CSS

```css
/* LoadingSpinner.module.css */

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 尺寸变体 */
.small .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.medium .spinner {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.large .spinner {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.text {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.small .text {
  font-size: 12px;
}

.large .text {
  font-size: 16px;
}

/* 屏幕阅读器文本（视觉隐藏） */
.screenReader {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 768px) {
  .large .spinner {
    width: 50px;
    height: 50px;
  }
}
```

### 2. Skeleton 组件

```typescript
import { memo } from 'react'

import styles from './Skeleton.module.css'

interface SkeletonProps {
  /** 骨架类型 */
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 行数（text 类型） */
  rows?: number
  /** 自定义类名 */
  className?: string
}

/**
 * 骨架屏组件
 */
export const Skeleton = memo(function Skeleton({
  variant = 'text',
  width,
  height,
  rows = 1,
  className = '',
}: SkeletonProps) {
  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  }

  if (variant === 'text') {
    return (
      <div className={`${styles.textSkeleton} ${className}`} style={style}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={styles.textLine}
            style={{
              width: index === rows - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'circular') {
    return (
      <div
        className={`${styles.circular} ${className}`}
        style={{ ...style, borderRadius: '50%' }}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div className={`${styles.card} ${className}`}>
        <div className={styles.cardImage} />
        <div className={styles.cardContent}>
          <div className={styles.cardTitle} />
          <div className={styles.cardText} />
        </div>
      </div>
    )
  }

  // rectangular
  return (
    <div
      className={`${styles.rectangular} ${className}`}
      style={style}
    />
  )
})
```

### Skeleton CSS

```css
/* Skeleton.module.css */

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 文本骨架 */
.textSkeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.textLine {
  height: 16px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 圆形骨架 */
.circular {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 矩形骨架 */
.rectangular {
  background: #f0f0f0;
  animation: pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}

/* 卡片骨架 */
.card {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cardImage {
  width: 100%;
  height: 200px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.cardContent {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cardTitle {
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.cardText {
  height: 16px;
  background: #f0f0f0;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}
```

### 3. ProgressBar 组件

```typescript
import { memo } from 'react'

import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  /** 进度值（0-100），undefined 表示不确定模式 */
  value?: number
  /** 是否显示百分比 */
  showLabel?: boolean
  /** 颜色 */
  color?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 进度条组件
 */
export const ProgressBar = memo(function ProgressBar({
  value,
  showLabel = false,
  color = '#4a90e2',
  className = '',
}: ProgressBarProps) {
  const isDeterminate = value !== undefined
  const progressValue = Math.min(100, Math.max(0, value || 0))

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${!isDeterminate ? styles.indeterminate : ''}`}
          style={{
            width: isDeterminate ? `${progressValue}%` : undefined,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && isDeterminate && (
        <span className={styles.label}>{Math.round(progressValue)}%</span>
      )}
    </div>
  )
})
```

### ProgressBar CSS

```css
/* ProgressBar.module.css */

.container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.track {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 不确定模式动画 */
.fill.indeterminate {
  width: 30%;
  animation: indeterminate 1.5s infinite;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

.label {
  font-size: 14px;
  color: #666666;
  min-width: 45px;
  text-align: right;
}
```

### 4. LoadingOverlay 组件

```typescript
import { memo } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

import styles from './LoadingOverlay.module.css'

interface LoadingOverlayProps {
  /** 是否显示 */
  visible: boolean
  /** 加载文本 */
  text?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 全屏加载遮罩组件
 */
export const LoadingOverlay = memo(function LoadingOverlay({
  visible,
  text = '加载中...',
  className = '',
}: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <div className={`${styles.overlay} ${className}`}>
      <div className={styles.content}>
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  )
})
```

### LoadingOverlay CSS

```css
/* LoadingOverlay.module.css */

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.content {
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
```

---

## 状态类型

### 1. 加载场景分类

| 场景 | 推荐组件 | 使用位置 |
|------|---------|---------|
| 页面初始加载 | LoadingSpinner (large) | 页面中心 |
| 列表数据加载 | Skeleton Card | 列表区域 |
| 图片加载 | Skeleton (rectangular) | 图片占位 |
| 表单提交 | LoadingOverlay | 全屏遮罩 |
| 按钮点击 | Spinner (small) | 按钮内 |
| 文件上传 | ProgressBar | 上传区域 |
| 路由切换 | Spinner (large) | 页面中心 |

### 2. 尺寸规范

| 尺寸 | Spinner 大小 | 使用场景 |
|------|-------------|---------|
| small | 24px | 按钮内、小区域 |
| medium | 40px | 列表加载、卡片内 |
| large | 60px | 页面加载、全屏遮罩 |

### 3. 颜色规范

| 元素 | 颜色 | 用途 |
|------|------|------|
| Spinner 主色 | `#4a90e2` | 旋转环前景色 |
| Spinner 背景 | `#f3f3f3` | 旋转环背景色 |
| Skeleton 基础 | `#f0f0f0` | 骨架背景 |
| Skeleton 高光 | `#e0e0e0` | 骨架动画高光 |
| Progress 主色 | `#4a90e2` | 进度条填充色 |
| Progress 轨道 | `#f0f0f0` | 进度条背景 |
| Overlay 背景 | `rgba(255,255,255,0.9)` | 遮罩半透明 |
| 加载文本 | `#666666` | 提示文字 |

---

## UI/UX 设计

### 1. 动画规范

#### Spinner 旋转动画
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

animation: spin 1s linear infinite;
```

**参数**：
- 持续时间：1s
- 缓动：linear（匀速）
- 迭代：infinite（无限循环）

#### Skeleton 闪烁动画
```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

animation: shimmer 1.5s infinite;
```

**参数**：
- 持续时间：1.5s
- 效果：从左到右的光扫过
- 背景渐变：3色渐变模拟高光

#### Skeleton 呼吸动画
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

animation: pulse 1.5s ease-in-out infinite;
```

**参数**：
- 持续时间：1.5s
- 缓动：ease-in-out
- 效果：透明度渐变

#### ProgressBar 不确定模式
```css
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

animation: indeterminate 1.5s infinite;
```

**参数**：
- 持续时间：1.5s
- 效果：滑块从左到右移动
- 宽度：30% 的进度块

### 2. 使用示例

#### 页面加载
```typescript
if (loading && products.length === 0) {
  return (
    <div className={styles.container}>
      <LoadingSpinner size="large" text="正在加载商品..." />
    </div>
  )
}
```

#### 列表骨架屏
```typescript
function ProductListSkeleton() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  )
}
```

#### 按钮加载状态
```typescript
<button disabled={loading}>
  {loading ? (
    <>
      <LoadingSpinner size="small" />
      提交中...
    </>
  ) : (
    '提交'
  )}
</button>
```

#### 图片占位
```typescript
<div className={styles.imageWrapper}>
  {!imageLoaded && <Skeleton variant="rectangular" width="100%" height="200px" />}
  <img 
    src={imageUrl}
    onLoad={() => setImageLoaded(true)}
    style={{ display: imageLoaded ? 'block' : 'none' }}
  />
</div>
```

#### 全屏遮罩
```typescript
<LoadingOverlay 
  visible={isSubmitting} 
  text="正在提交..." 
/>
```

#### 进度条
```typescript
<ProgressBar 
  value={uploadProgress} 
  showLabel 
/>
```

---

## 测试要点

### LoadingSpinner 测试

- [ ] 三种尺寸正确渲染（small, medium, large）
- [ ] 旋转动画流畅运行
- [ ] 加载文本正确显示
- [ ] 无文本时不显示文本区域
- [ ] `aria-label` 正确设置
- [ ] `role="status"` 正确设置
- [ ] 屏幕阅读器可读
- [ ] 自定义类名正确应用

### Skeleton 测试

- [ ] 四种变体正确渲染（text, circular, rectangular, card）
- [ ] 文本骨架支持多行
- [ ] 最后一行文本宽度为 75%
- [ ] 闪烁动画流畅运行
- [ ] 呼吸动画流畅运行
- [ ] 自定义宽高正确应用
- [ ] 卡片骨架包含图片和内容区
- [ ] 响应式尺寸正确

### ProgressBar 测试

- [ ] 确定模式进度正确
- [ ] 不确定模式动画正确
- [ ] 百分比标签正确显示
- [ ] 百分比标签可隐藏
- [ ] 进度值限制在 0-100
- [ ] 负数处理为 0
- [ ] 超过 100 处理为 100
- [ ] 自定义颜色正确应用

### LoadingOverlay 测试

- [ ] visible=false 时不渲染
- [ ] visible=true 时显示遮罩
- [ ] 背景半透明正确
- [ ] 毛玻璃效果正确
- [ ] z-index 最高（9999）
- [ ] 内容居中显示
- [ ] 加载文本正确传递
- [ ] 点击遮罩不关闭（无交互）

### 性能测试

- [ ] 动画使用 CSS transform（GPU 加速）
- [ ] 动画不阻塞主线程
- [ ] 组件使用 React.memo 避免重渲染
- [ ] 骨架屏数量合理（不超过 20 个）
- [ ] 卸载时动画正确停止

### 无障碍测试

- [ ] Spinner 有 `role="status"`
- [ ] Spinner 有 `aria-label`
- [ ] 屏幕阅读器文本视觉隐藏但可读
- [ ] 键盘焦点不受影响
- [ ] Overlay 不捕获键盘焦点

### 边界情况测试

- [ ] 快速切换加载状态无闪烁
- [ ] 加载状态持续 10 秒+ 无性能问题
- [ ] 多个加载组件同时使用无冲突
- [ ] 移动端触摸设备动画流畅
- [ ] 低性能设备动画降级（可选）

---

## 使用说明

### 导入组件

```typescript
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Skeleton } from '../components/Skeleton'
import { ProgressBar } from '../components/ProgressBar'
import { LoadingOverlay } from '../components/LoadingOverlay'
```

### 基础用法

```typescript
// Spinner
<LoadingSpinner size="medium" text="加载中..." />

// Skeleton
<Skeleton variant="card" />
<Skeleton variant="text" rows={3} />
<Skeleton variant="circular" width={50} height={50} />

// ProgressBar
<ProgressBar value={75} showLabel />
<ProgressBar /> {/* 不确定模式 */}

// LoadingOverlay
<LoadingOverlay visible={true} text="处理中..." />
```

---

## 文件结构

```
src/
└── components/
    ├── LoadingSpinner.tsx
    ├── LoadingSpinner.module.css
    ├── Skeleton.tsx
    ├── Skeleton.module.css
    ├── ProgressBar.tsx
    ├── ProgressBar.module.css
    ├── LoadingOverlay.tsx
    └── LoadingOverlay.module.css
```

---

## 依赖关系

### 上游依赖

- **React**: 组件框架

### 下游使用

- **商品列表页** (02-product-list): 初始加载
- **商品详情页** (05-product-detail): 数据加载
- **路由管理** (08-routing): 懒加载 fallback
- **所有页面**: 通用加载状态

---

## 注意事项

### ⚠️ 重要提醒

1. **性能**：避免同时渲染过多骨架屏（建议 < 20 个）
2. **动画**：使用 CSS transform 和 opacity（GPU 加速）
3. **无障碍**：Spinner 必须包含 `role="status"` 和 `aria-label`
4. **屏幕阅读器**：使用视觉隐藏文本提供加载信息
5. **z-index**：Overlay 使用 9999 确保最高层级
6. **响应式**：移动端适当缩小尺寸
7. **卸载清理**：组件卸载时停止动画

### 🔒 最佳实践

1. **首屏加载**：使用 Skeleton 而非 Spinner（感知更快）
2. **按钮加载**：使用 small Spinner + 禁用按钮
3. **图片加载**：使用 Skeleton 占位，避免布局抖动
4. **长时间操作**：使用 ProgressBar 显示进度
5. **全屏操作**：使用 LoadingOverlay 阻止交互

---

## 未来扩展

### 可能的功能增强

1. **自定义动画**：支持自定义旋转动画
2. **主题支持**：支持暗色模式
3. **延迟显示**：避免快速闪烁（延迟 200ms 显示）
4. **进度预估**：智能预估剩余时间
5. **取消按钮**：长时间加载可取消
6. **骨架屏预设**：常用布局的骨架屏模板
7. **动画速度配置**：可调整动画速度
8. **全局加载状态**：Redux/Zustand 管理全局加载

**注意**：当前版本仅实现基础加载组件，上述增强功能待后续迭代。