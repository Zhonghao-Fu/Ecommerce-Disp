# 商品卡片组件模块规格说明书

## 模块概述

本模块负责实现单个商品的卡片展示组件，是商品列表页的基本单元。卡片组件展示商品的核心信息（图片、名称、价格、状态），并提供点击跳转至详情页的交互功能。通过组件化设计，确保卡片在不同设备和布局下的一致性展示，同时支持懒加载、悬停效果等用户体验优化。

**设计原则**：
- 信息精简：仅展示关键信息，避免信息过载
- 视觉吸引：美观的卡片设计，提升购买欲望
- 交互流畅：悬停效果、点击反馈自然流畅
- 性能优先：图片懒加载，减少首屏加载时间
- 响应式：自适应不同屏幕尺寸

---

## 功能需求

### 核心需求

1. **商品基本信息展示**
   - 商品主图（首张图片）
   - 商品名称（最多两行，超出省略）
   - 商品价格（突出显示）
   - 商品状态标签（上架/下架）

2. **交互功能**
   - 点击卡片跳转至商品详情页
   - 悬停效果（PC 端）
   - 图片懒加载

3. **状态处理**
   - 图片加载失败时的占位图
   - 下架商品的视觉区分
   - 价格缺失处理

4. **响应式适配**
   - 自适应不同网格列数
   - 移动端触摸友好
   - 字体和间距自适应

---

## 技术实现

### 组件结构

```typescript
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { LazyImage } from './LazyImage'
import type { ProductListItem } from '../types'

import styles from './ProductCard.module.css'

interface ProductCardProps {
  /** 商品数据 */
  product: ProductListItem
  /** 可选：自定义类名 */
  className?: string
}

/**
 * 商品卡片组件
 * 展示商品基本信息，点击跳转至详情页
 */
export const ProductCard = memo(function ProductCard({ 
  product, 
  className = '' 
}: ProductCardProps) {
  const { id, name, price, images, status } = product
  
  // 获取首张图片，无图时使用占位图
  const mainImage = images?.[0] || '/placeholder-product.png'
  
  // 判断是否下架
  const isOffShelf = status === 'off_sale'
  
  return (
    <Link 
      to={`/product/${id}`}
      className={`${styles.card} ${isOffShelf ? styles.offShelf : ''} ${className}`}
      aria-label={`查看 ${name} 详情`}
    >
      {/* 商品图片 */}
      <div className={styles.imageWrapper}>
        <LazyImage
          src={mainImage}
          alt={name}
          className={styles.image}
          placeholder="/placeholder-product.png"
          loading="lazy"
        />
        
        {/* 状态标签 */}
        {isOffShelf && (
          <span className={styles.statusBadge}>
            已下架
          </span>
        )}
      </div>
      
      {/* 商品信息 */}
      <div className={styles.info}>
        {/* 商品名称 */}
        <h3 className={styles.name} title={name}>
          {name}
        </h3>
        
        {/* 商品价格 */}
        <div className={styles.priceSection}>
          <span className={styles.currency}>¥</span>
          <span className={styles.price}>
            {price?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </Link>
  )
})
```

### CSS 样式实现

```css
/* ProductCard.module.css */

.card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  position: relative;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card.offShelf {
  opacity: 0.6;
  filter: grayscale(50%);
}

.card.offShelf:hover {
  opacity: 0.8;
  filter: grayscale(30%);
}

/* 图片容器 */
.imageWrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f5f5f5;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .image {
  transform: scale(1.05);
}

/* 状态标签 */
.statusBadge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

/* 商品信息 */
.info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  line-height: 1.5;
  margin: 0;
  
  /* 两行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 42px;
}

/* 价格区域 */
.priceSection {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-top: auto;
}

.currency {
  font-size: 14px;
  color: #e74c3c;
  font-weight: 600;
}

.price {
  font-size: 20px;
  color: #e74c3c;
  font-weight: 700;
  line-height: 1;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .name {
    font-size: 13px;
    min-height: 39px;
  }
  
  .price {
    font-size: 18px;
  }
  
  .currency {
    font-size: 13px;
  }
  
  .info {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .name {
    font-size: 12px;
    min-height: 36px;
  }
  
  .price {
    font-size: 16px;
  }
  
  .currency {
    font-size: 12px;
  }
  
  .statusBadge {
    font-size: 11px;
    padding: 3px 10px;
  }
}
```

---

## 接口说明

### Props 接口

```typescript
interface ProductCardProps {
  /** 商品数据（列表项格式） */
  product: ProductListItem
  
  /** 可选：自定义 CSS 类名 */
  className?: string
}
```

### ProductListItem 类型

```typescript
interface ProductListItem {
  /** 商品唯一标识 */
  id: string
  
  /** 商品名称 */
  name: string
  
  /** 商品价格（单位：元） */
  price: number
  
  /** 商品图片 URL 数组 */
  images: string[]
  
  /** 商品状态：'on_sale' | 'off_sale' */
  status: 'on_sale' | 'off_sale'
}
```

### 路由跳转

```typescript
// 点击卡片跳转路径
<Link to={`/product/${id}`}>  
  // 例如：/product/prod_abc123
</Link>
```

---

## UI/UX 设计

### 视觉设计规范

#### 1. 尺寸规范

| 设备 | 卡片宽度 | 图片比例 | 内边距 | 圆角 |
|------|---------|---------|--------|------|
| PC (> 1024px) | 自适应 | 1:1 (正方形) | 12px | 8px |
| 平板 (768px - 1024px) | 自适应 | 1:1 | 10px | 8px |
| 手机 (< 768px) | 自适应 | 1:1 | 10px | 6px |

#### 2. 颜色规范

| 元素 | 颜色 | 用途 |
|------|------|------|
| 背景色 | `#ffffff` | 卡片背景 |
| 阴影 | `rgba(0, 0, 0, 0.08)` | 默认阴影 |
| 悬停阴影 | `rgba(0, 0, 0, 0.12)` | 悬停阴影 |
| 主文字色 | `#333333` | 商品名称 |
| 价格色 | `#e74c3c` | 价格显示（红色） |
| 下架遮罩 | `opacity: 0.6` | 下架商品透明度 |
| 状态标签背景 | `rgba(0, 0, 0, 0.7)` | 半透明黑色 |
| 占位图背景 | `#f5f5f5` | 图片加载前背景 |

#### 3. 字体规范

| 元素 | PC 字号 | 移动端字号 | 字重 |
|------|---------|-----------|------|
| 商品名称 | 14px | 12-13px | 500 |
| 价格 | 20px | 16-18px | 700 |
| 货币符号 | 14px | 12-13px | 600 |
| 状态标签 | 12px | 11px | 500 |

#### 4. 间距规范

| 间距位置 | PC | 移动端 |
|---------|-----|--------|
| 卡片内边距 | 12px | 10px |
| 名称与价格间距 | 8px | 8px |
| 状态标签位置 | top: 8px, right: 8px | 同上 |
| 卡片间距（父容器） | 1.5rem | 1rem |

### 交互设计

#### 1. 悬停效果（PC 端）

```css
/* 卡片上浮 */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 图片放大 */
.card:hover .image {
  transform: scale(1.05);
}
```

**动画参数**：
- 持续时间：`0.3s`
- 缓动函数：`ease`
- 属性：`all`（平滑过渡）

#### 2. 点击反馈

- 使用 `<Link>` 组件提供路由跳转
- 浏览器默认光标：`cursor: pointer`
- 触摸设备：无悬停效果，直接点击

#### 3. 图片懒加载

```typescript
<LazyImage
  src={mainImage}
  alt={name}
  loading="lazy"  // 原生懒加载
  placeholder="/placeholder-product.png"  // 占位图
/>
```

**懒加载策略**：
- 使用浏览器原生 `loading="lazy"`
- 图片进入视口前显示占位图
- 图片加载失败时显示默认占位图

### 状态处理

#### 1. 下架商品视觉区分

```css
.card.offShelf {
  opacity: 0.6;
  filter: grayscale(50%);  /* 灰度滤镜 */
}
```

**视觉效果**：
- 透明度降低至 60%
- 50% 灰度，降低色彩饱和度
- 右上角显示“已下架”标签
- 悬停时恢复部分透明度（80%）

#### 2. 图片加载失败处理

```typescript
// LazyImage 组件内部处理
<img
  src={src}
  onError={(e) => {
    e.currentTarget.src = placeholder  // 替换为占位图
  }}
/>
```

#### 3. 数据缺失处理

| 缺失字段 | 处理策略 |
|---------|---------|
| 图片数组为空 | 显示占位图 `/placeholder-product.png` |
| 价格为 undefined | 显示 `0.00` |
| 名称为空 | 显示默认文本“未命名商品” |

---

## 测试要点

### 渲染测试

- [ ] 正常商品数据正确渲染
- [ ] 商品名称显示完整
- [ ] 价格格式正确（保留两位小数）
- [ ] 图片正确加载
- [ ] 上架商品无状态标签
- [ ] 下架商品显示“已下架”标签

### 交互测试

- [ ] 点击卡片跳转至正确的商品详情页
- [ ] PC 端悬停效果正常（卡片上浮、图片放大）
- [ ] 悬停动画流畅无卡顿
- [ ] 移动端点击无悬停效果
- [ ] 光标显示为 pointer

### 状态测试

- [ ] 图片加载失败显示占位图
- [ ] 图片数组为空显示占位图
- [ ] 下架商品样式正确（灰度、透明度）
- [ ] 下架商品悬停效果减弱
- [ ] 价格为 undefined 时显示 0.00
- [ ] 名称超长时两行省略

### 响应式测试

- [ ] PC 端（> 1024px）样式正确
- [ ] 平板端（768px - 1024px）样式正确
- [ ] 手机端（< 768px）样式正确
- [ ] 小屏手机（< 480px）样式正确
- [ ] 字体大小响应式调整
- [ ] 卡片内边距响应式调整

### 性能测试

- [ ] 图片使用懒加载
- [ ] 使用 React.memo 避免不必要重渲染
- [ ] 悬停动画使用 CSS transform（GPU 加速）
- [ ] 首屏卡片加载无性能问题

### 无障碍测试

- [ ] `aria-label` 正确设置
- [ ] 键盘 Tab 导航可聚焦
- [ ] 键盘 Enter 键可激活跳转
- [ ] 屏幕阅读器可读

### 边界情况测试

- [ ] 商品名称极长（100+ 字符）正确省略
- [ ] 商品名称包含特殊字符正确显示
- [ ] 价格为 0 时正确显示 `¥0.00`
- [ ] 价格为极大值正确显示
- [ ] 图片 URL 无效时显示占位图
- [ ] images 数组包含多个 URL 时取第一个
- [ ] status 字段缺失时的降级处理

---

## 使用说明

### 基础用法

```typescript
import { ProductCard } from '../components/ProductCard'
import type { ProductListItem } from '../types'

const product: ProductListItem = {
  id: 'prod_123',
  name: 'iPhone 15 Pro Max',
  price: 9999.00,
  images: ['https://example.com/iphone.jpg'],
  status: 'on_sale',
}

function ProductGrid() {
  return (
    <div className="grid">
      <ProductCard product={product} />
    </div>
  )
}
```

### 在商品列表页中使用

```typescript
// ProductList.tsx
import { ProductCard } from '../components/ProductCard'

{products.map(product => (
  <ProductCard 
    key={product.id} 
    product={product} 
  />
))}
```

### 自定义样式

```typescript
<ProductCard 
  product={product}
  className="custom-card"  // 添加自定义类名
/>
```

---

## 性能优化建议

### 1. React.memo 包裹

```typescript
export const ProductCard = memo(function ProductCard(props) {
  // 组件实现
})
```

**作用**：仅在 `product` prop 变化时重新渲染

### 2. 图片懒加载

```typescript
<img 
  src={imageSrc}
  loading="lazy"  // 浏览器原生懒加载
/>
```

### 3. CSS 动画优化

```css
/* 使用 transform 和 opacity（GPU 加速） */
.card:hover {
  transform: translateY(-4px);  /* ✅ 好 */
}

/* 避免使用会影响布局的属性 */
.card:hover {
  /* margin-top: -4px; */  /* ❌ 避免 */
}
```

### 4. 避免内联样式

```typescript
// ❌ 避免
<div style={{ opacity: isOffShelf ? 0.6 : 1 }}>

// ✅ 推荐
<div className={isOffShelf ? styles.offShelf : ''}>
```

---

## 文件结构

```
src/
└── components/
    ├── ProductCard.tsx          # 商品卡片组件
    ├── ProductCard.module.css   # 卡片样式（CSS Modules）
    └── LazyImage.tsx            # 懒加载图片组件（可选）
```

---

## 依赖关系

### 上游依赖

- **React**: 组件框架
- **react-router-dom**: 路由跳转（`<Link>` 组件）
- **TypeScript 类型定义**: `ProductListItem` 接口

### 下游使用

- **商品列表页** (02-product-list): 在网格中渲染商品卡片
- **商品详情页** (05-product-detail): 可能展示相关商品卡片

---

## 注意事项

### ⚠️ 重要提醒

1. **价格单位**：前端显示的是**元**，后端存储的是**分**，确保数据转换正确
2. **图片优化**：建议使用 WebP 格式，设置合理的图片尺寸
3. **SEO 友好**：`<Link>` 组件支持爬虫索引，优于 `<a onClick>`
4. **性能监控**：可使用 React DevTools Profiler 监控卡片渲染性能
5. **缓存策略**：考虑使用 React Query 或 SWR 缓存商品数据
6. **图片 CDN**：生产环境建议使用 CDN 加速图片加载
7. **错误边界**：商品列表页应包裹 Error Boundary，避免单个卡片错误影响整体

### 🔒 安全建议

1. **XSS 防护**：商品名称渲染时避免使用 `dangerouslySetInnerHTML`
2. **URL 验证**：图片 URL 应来自可信来源
3. **数据验证**：使用前验证 product 数据结构完整性

---

## 未来扩展

### 可能的功能增强

1. **收藏功能**：添加收藏按钮（❤️ 图标）
2. **快速预览**：悬停显示快速预览弹窗
3. **加入购物车**：添加“加入购物车”按钮
4. **折扣标签**：显示折扣百分比或折扣标签
5. **评分展示**：显示商品评分（星级）
6. **库存提示**：显示“仅剩 X 件”提示
7. **多图片轮播**：卡片内支持多图滑动查看
8. **骨架屏**：加载时显示骨架屏而非占位图

**注意**：当前版本仅实现基础展示功能，上述增强功能待后续迭代。