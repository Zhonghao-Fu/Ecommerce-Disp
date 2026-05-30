# 商品详情页模块规格说明书

## 模块概述

本模块负责实现商品详情展示页面，是用户了解商品完整信息的核心页面。页面通过 URL 参数获取商品 ID，调用后端 API 获取商品完整数据，并展示商品图片轮播、名称、价格、描述、状态等详细信息。该页面需要处理加载状态、错误状态、商品不存在等多种场景，提供良好的用户体验和视觉呈现。

**设计原则**：
- 信息完整：展示商品所有关键信息
- 视觉优先：高质量图片展示，吸引用户
- 清晰布局：信息层次分明，易于阅读
- 状态处理：完善加载、错误、空状态处理
- 响应式：适配不同设备屏幕

---

## 功能需求

### 核心需求

1. **商品完整信息展示**
   - 商品图片轮播/画廊
   - 商品名称（标题）
   - 商品价格（突出显示）
   - 商品描述（支持长文本）
   - 商品状态（上架/下架）
   - 创建/更新时间

2. **图片轮播功能**
   - 多图展示（如有）
   - 左右切换按钮
   - 指示器（小圆点）
   - 图片放大查看（可选）

3. **交互功能**
   - 返回列表页按钮
   - 图片点击放大
   - 键盘导航（左右箭头）

4. **状态处理**
   - 加载中：显示骨架屏或 Loading
   - 商品不存在：404 提示页
   - 网络错误：错误提示 + 重试按钮
   - 下架商品：明确提示

5. **响应式适配**
   - PC 端：左右分栏布局（图片 + 信息）
   - 移动端：上下堆叠布局
   - 图片自适应尺寸

---

## 技术实现

### 页面组件结构

```typescript
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductById } from '../services/productService'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ImageGallery } from '../components/ImageGallery'
import type { Product } from '../types'

import styles from './ProductDetail.module.css'

/**
 * 商品详情页组件
 */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // 数据状态
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 获取商品详情
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('商品 ID 不存在')
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        const data = await getProductById(id)
        setProduct(data)
      } catch (err: any) {
        console.error('Failed to fetch product:', err)
        if (err.statusCode === 404) {
          setError('NOT_FOUND')
        } else {
          setError(err.message || '加载失败，请稍后重试')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id])
  
  // 返回列表页
  const handleBack = () => {
    navigate('/products')
  }
  
  // 加载中
  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="large" text="加载中..." />
      </div>
    )
  }
  
  // 错误状态
  if (error) {
    if (error === 'NOT_FOUND') {
      return (
        <div className={styles.container}>
          <div className={styles.errorState}>
            <h2>商品不存在</h2>
            <p>该商品可能已被下架或删除</p>
            <button onClick={handleBack} className={styles.backButton}>
              返回列表页
            </button>
          </div>
        </div>
      )
    }
    
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>加载失败</h2>
          <p>{error}</p>
          <button onClick={handleBack} className={styles.backButton}>
            返回列表页
          </button>
        </div>
      </div>
    )
  }
  
  // 无数据
  if (!product) {
    return null
  }
  
  const { name, price, description, images, status, createdAt, updatedAt } = product
  const isOffShelf = status === 'off_sale'
  
  return (
    <div className={styles.container}>
      {/* 返回按钮 */}
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ← 返回列表
        </button>
        {isOffShelf && (
          <span className={styles.offShelfBadge}>已下架</span>
        )}
      </div>
      
      {/* 商品内容区 */}
      <div className={styles.content}>
        {/* 左侧：图片画廊 */}
        <div className={styles.imageSection}>
          <ImageGallery 
            images={images} 
            productName={name}
          />
        </div>
        
        {/* 右侧：商品信息 */}
        <div className={styles.infoSection}>
          {/* 商品名称 */}
          <h1 className={styles.productName}>{name}</h1>
          
          {/* 商品价格 */}
          <div className={styles.priceSection}>
            <span className={styles.currency}>¥</span>
            <span className={styles.price}>{price.toFixed(2)}</span>
          </div>
          
          {/* 商品描述 */}
          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>商品描述</h3>
            <div className={styles.description}>
              {description || '暂无描述'}
            </div>
          </div>
          
          {/* 时间信息 */}
          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>上架时间：</span>
              <span className={styles.metaValue}>
                {new Date(createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>更新时间：</span>
              <span className={styles.metaValue}>
                {new Date(updatedAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
          
          {/* 下架提示 */}
          {isOffShelf && (
            <div className={styles.offShelfNotice}>
              <p>⚠️ 该商品已下架，暂不支持购买</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### ImageGallery 组件（图片轮播）

```typescript
import { useState, useCallback } from 'react'
import { LazyImage } from './LazyImage'

import styles from './ImageGallery.module.css'

interface ImageGalleryProps {
  /** 图片 URL 数组 */
  images: string[]
  /** 商品名称（用于 alt 属性） */
  productName: string
}

/**
 * 图片画廊组件
 * 支持多图轮播、左右切换、指示器
 */
export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 如果没有图片，显示占位图
  const imageList = images.length > 0 ? images : ['/placeholder-product.png']
  
  // 切换到上一张
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => 
      prev === 0 ? imageList.length - 1 : prev - 1
    )
  }, [imageList.length])
  
  // 切换到下一张
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => 
      prev === imageList.length - 1 ? 0 : prev + 1
    )
  }, [imageList.length])
  
  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])
  
  // 只有一张图片时不显示切换按钮
  if (imageList.length === 1) {
    return (
      <div className={styles.singleImage}>
        <LazyImage
          src={imageList[0]}
          alt={productName}
          className={styles.mainImage}
          placeholder="/placeholder-product.png"
        />
      </div>
    )
  }
  
  return (
    <div className={styles.gallery}>
      {/* 主图 */}
      <div className={styles.mainImageWrapper}>
        <LazyImage
          src={imageList[currentIndex]}
          alt={`${productName} - 图片 ${currentIndex + 1}`}
          className={styles.mainImage}
          placeholder="/placeholder-product.png"
        />
        
        {/* 切换按钮 */}
        <button 
          onClick={handlePrev} 
          className={`${styles.navButton} ${styles.prevButton}`}
          aria-label="上一张图片"
        >
          ‹
        </button>
        <button 
          onClick={handleNext} 
          className={`${styles.navButton} ${styles.nextButton}`}
          aria-label="下一张图片"
        >
          ›
        </button>
      </div>
      
      {/* 指示器 */}
      <div className={styles.indicators}>
        {imageList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${styles.indicator} ${
              index === currentIndex ? styles.active : ''
            }`}
            aria-label={`查看第 ${index + 1} 张图片`}
          />
        ))}
      </div>
      
      {/* 缩略图列表 */}
      <div className={styles.thumbnails}>
        {imageList.map((img, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${styles.thumbnail} ${
              index === currentIndex ? styles.active : ''
            }`}
          >
            <LazyImage
              src={img}
              alt={`${productName} 缩略图 ${index + 1}`}
              className={styles.thumbnailImage}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
```

### CSS 样式实现

```css
/* ProductDetail.module.css */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
}

/* 头部区域 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.backButton {
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.backButton:hover {
  background: #f5f5f5;
  border-color: #4a90e2;
  color: #4a90e2;
}

.offShelfBadge {
  padding: 6px 16px;
  background: #ff6b6b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
}

/* 内容区域 */
.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* 图片区域 */
.imageSection {
  position: sticky;
  top: 2rem;
}

/* 信息区域 */
.infoSection {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.productName {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0;
}

/* 价格区域 */
.priceSection {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.currency {
  font-size: 20px;
  color: #e74c3c;
  font-weight: 600;
}

.price {
  font-size: 36px;
  color: #e74c3c;
  font-weight: 700;
  line-height: 1;
}

/* 描述区域 */
.descriptionSection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sectionTitle {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #4a90e2;
  display: inline-block;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #555555;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  min-height: 100px;
}

/* 元信息 */
.metaInfo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 6px;
}

.metaItem {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.metaLabel {
  color: #666666;
  min-width: 90px;
}

.metaValue {
  color: #333333;
}

/* 下架提示 */
.offShelfNotice {
  padding: 1rem;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 6px;
  font-size: 14px;
  color: #856404;
}

.offShelfNotice p {
  margin: 0;
}

/* 错误状态 */
.errorState {
  text-align: center;
  padding: 4rem 2rem;
}

.errorState h2 {
  font-size: 24px;
  color: #333333;
  margin-bottom: 1rem;
}

.errorState p {
  font-size: 16px;
  color: #666666;
  margin-bottom: 2rem;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .content {
    gap: 2rem;
  }
  
  .productName {
    font-size: 24px;
  }
  
  .price {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1.5rem 1rem;
  }
  
  .content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .imageSection {
    position: static;
  }
  
  .productName {
    font-size: 22px;
  }
  
  .price {
    font-size: 28px;
  }
  
  .currency {
    font-size: 18px;
  }
  
  .header {
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .productName {
    font-size: 20px;
  }
  
  .price {
    font-size: 24px;
  }
  
  .currency {
    font-size: 16px;
  }
  
  .sectionTitle {
    font-size: 16px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .metaItem {
    font-size: 13px;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .metaLabel {
    min-width: auto;
  }
}

/* ImageGallery.module.css */

.gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.singleImage {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mainImageWrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mainImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #ffffff;
}

/* 导航按钮 */
.navButton {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  font-size: 24px;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.navButton:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.prevButton {
  left: 12px;
}

.nextButton {
  right: 12px;
}

/* 指示器 */
.indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0.5rem 0;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #d0d0d0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.indicator:hover {
  border-color: #4a90e2;
}

.indicator.active {
  background: #4a90e2;
  border-color: #4a90e2;
  transform: scale(1.2);
}

/* 缩略图 */
.thumbnails {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f5f5f5;
  padding: 0;
}

.thumbnail:hover {
  border-color: #4a90e2;
}

.thumbnail.active {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
}

.thumbnailImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .navButton {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
  
  .prevButton {
    left: 8px;
  }
  
  .nextButton {
    right: 8px;
  }
  
  .thumbnail {
    width: 50px;
    height: 50px;
  }
}
```

---

## 接口说明

### 路由参数

```typescript
// URL 格式: /product/:id
// 示例: /product/prod_abc123

const { id } = useParams<{ id: string }>()
```

### API 调用

```typescript
// 获取商品详情
const product = await getProductById(id: string): Promise<Product>
```

### Product 类型

```typescript
interface Product {
  /** 商品唯一标识 */
  id: string
  
  /** 商品名称 */
  name: string
  
  /** 商品价格（单位：元） */
  price: number
  
  /** 商品描述 */
  description: string
  
  /** 商品图片 URL 数组 */
  images: string[]
  
  /** 商品状态 */
  status: 'on_sale' | 'off_sale'
  
  /** 创建时间 */
  createdAt: string
  
  /** 更新时间 */
  updatedAt: string
}
```

---

## UI/UX 设计

### 视觉设计规范

#### 1. 布局规范

| 区域 | PC 布局 | 移动端布局 |
|------|---------|-----------|
| 整体 | 左右分栏 (1:1) | 上下堆叠 |
| 最大宽度 | 1200px | 100% |
| 间距 | 3rem | 2rem |
| 内边距 | 2rem 1rem | 1.5rem 1rem |

#### 2. 颜色规范

| 元素 | 颜色 | 用途 |
|------|------|------|
| 标题色 | `#1a1a1a` | 商品名称 |
| 价格色 | `#e74c3c` | 价格显示 |
| 价格背景 | 渐变 `#fff5f5 → #ffffff` | 价格区域背景 |
| 描述文字 | `#555555` | 描述内容 |
| 标签文字 | `#666666` | 元信息标签 |
| 下架标签 | `#ff6b6b` | 已下架徽章 |
| 下架提示背景 | `#fff3cd` | 警告提示 |
| 错误提示 | `#856404` | 警告文字 |

#### 3. 字体规范

| 元素 | PC 字号 | 移动端字号 | 字重 |
|------|---------|-----------|------|
| 商品名称 | 28px | 20-24px | 700 |
| 价格 | 36px | 24-32px | 700 |
| 货币符号 | 20px | 16-18px | 600 |
| 章节标题 | 18px | 16px | 600 |
| 描述内容 | 15px | 14px | 400 |
| 元信息 | 14px | 13px | 400 |

#### 4. 图片规范

| 图片类型 | 比例 | 显示方式 | 背景 |
|---------|------|---------|------|
| 主图 | 1:1 (正方形) | contain（完整显示） | 白色 |
| 缩略图 | 1:1 | cover（裁剪填充） | 灰色 |

### 交互设计

#### 1. 图片轮播交互

- **左右切换按钮**：悬停时放大、阴影加深
- **指示器**：点击切换，当前项蓝色高亮
- **缩略图**：点击切换，当前项蓝色边框 + 阴影
- **键盘导航**：← → 键切换图片
- **自动播放**：当前版本不支持（可扩展）

#### 2. 返回按钮交互

```css
.backButton:hover {
  background: #f5f5f5;
  border-color: #4a90e2;
  color: #4a90e2;
}
```

- 悬停时边框和文字变为蓝色
- 背景变为浅灰色

#### 3. 加载状态

```typescript
<LoadingSpinner size="large" text="加载中..." />
```

- 居中显示
- 大尺寸旋转动画
- 加载提示文字

#### 4. 错误状态

| 错误类型 | 显示内容 | 操作 |
|---------|---------|------|
| 404 商品不存在 | "商品不存在" + 说明 | 返回列表页 |
| 网络错误 | 错误信息 | 返回列表页 |
| 其他错误 | 通用错误提示 | 返回列表页 |

---

## 测试要点

### 渲染测试

- [ ] 正常商品数据正确渲染
- [ ] 商品名称、价格、描述正确显示
- [ ] 图片画廊正确显示
- [ ] 多图时显示轮播功能
- [ ] 单图时不显示切换按钮
- [ ] 时间格式正确（本地化）
- [ ] 下架商品显示下架标签和提示

### 交互测试

- [ ] 点击返回按钮返回列表页
- [ ] 图片左右切换按钮正常工作
- [ ] 点击指示器切换图片
- [ ] 点击缩略图切换图片
- [ ] 键盘左右箭头切换图片
- [ ] 最后一张点下一张回到第一张
- [ ] 第一张点上一张跳到最后一张

### 状态测试

- [ ] 加载中显示 Loading 动画
- [ ] 商品不存在显示 404 提示
- [ ] 网络错误显示错误信息
- [ ] 无图片显示占位图
- [ ] 下架商品视觉区分明显
- [ ] 描述为空显示"暂无描述"

### 响应式测试

- [ ] PC 端（> 1024px）左右分栏布局
- [ ] 平板端（768px - 1024px）布局正确
- [ ] 移动端（< 768px）上下堆叠布局
- [ ] 小屏手机（< 480px）字号正确
- [ ] 图片自适应宽度
- [ ] 元信息在移动端纵向排列

### 性能测试

- [ ] 图片使用懒加载
- [ ] 首屏加载无性能问题
- [ ] 图片切换流畅无卡顿
- [ ] 组件卸载时清理事件监听

### 无障碍测试

- [ ] `aria-label` 正确设置
- [ ] 键盘导航可用
- [ ] 屏幕阅读器可读
- [ ] 按钮可聚焦

### 边界情况测试

- [ ] 商品名称极长（100+ 字符）正确显示
- [ ] 描述文本包含换行符正确渲染
- [ ] 描述文本包含特殊字符正确显示
- [ ] 价格为 0 时正确显示
- [ ] 图片数组为空显示占位图
- [ ] 图片数组包含 1 张图片不显示轮播
- [ ] 图片数组包含 10+ 张缩略图可滚动
- [ ] URL 参数 id 缺失时显示错误
- [ ] API 返回超时显示错误
- [ ] 快速返回列表页取消请求

---

## 使用说明

### 路由配置

```typescript
// App.tsx
import { Routes, Route } from 'react-router-dom'
import ProductDetail from './pages/ProductDetail'

function App() {
  return (
    <Routes>
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/products" element={<ProductList />} />
    </Routes>
  )
}
```

### 从列表页跳转

```typescript
// ProductCard.tsx
import { Link } from 'react-router-dom'

<Link to={`/product/${product.id}`}>
  <ProductCard product={product} />
</Link>
```

---

## 性能优化建议

### 1. 数据预取

```typescript
// 从列表页预取详情数据（可选）
const queryClient = useQueryClient()

// 在列表页鼠标悬停时预取
onMouseEnter={() => {
  queryClient.prefetchQuery(
    ['product', product.id],
    () => getProductById(product.id)
  )
}}
```

### 2. 图片优化

```typescript
// 使用 WebP 格式
<img src="/product.webp" />

// 设置合适的图片尺寸
<img 
  src="/product-800.jpg"
  srcSet="/product-400.jpg 400w, /product-800.jpg 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 3. 请求取消

```typescript
useEffect(() => {
  const controller = new AbortController()
  
  const fetchProduct = async () => {
    const data = await getProductById(id, {
      signal: controller.signal
    })
  }
  
  fetchProduct()
  
  return () => {
    controller.abort()  // 组件卸载时取消请求
  }
}, [id])
```

---

## 文件结构

```
src/
└── pages/
    └── ProductDetail/
        ├── ProductDetail.tsx          # 详情页主组件
        ├── ProductDetail.module.css   # 详情页样式
        ├── ImageGallery.tsx           # 图片画廊组件
        └── ImageGallery.module.css    # 画廊样式
```

---

## 依赖关系

### 上游依赖

- **React**: 组件框架
- **react-router-dom**: 路由参数、导航
- **API 服务层** (15-api-service): `getProductById` 方法
- **TypeScript 类型定义** (19-typescript-types): `Product` 接口
- **加载状态组件** (16-loading-states): `LoadingSpinner`
- **懒加载图片** (04-product-card): `LazyImage` 组件

### 下游使用

- **路由管理** (08-routing): 定义 `/product/:id` 路由
- **商品卡片** (04-product-card): 点击跳转至详情页

---

## 注意事项

### ⚠️ 重要提醒

1. **URL 参数验证**：检查 `id` 是否存在，避免无效请求
2. **错误分类处理**：区分 404、网络错误、其他错误
3. **时间本地化**：使用 `toLocaleString('zh-CN')` 格式化时间
4. **图片加载失败**：提供占位图降级方案
5. **组件卸载清理**：清除键盘事件监听、取消未完成的请求
6. **SEO 友好**：可考虑添加 `<title>` 和 `<meta>` 标签
7. **缓存策略**：使用 React Query 或 SWR 缓存商品详情

### 🔒 安全建议

1. **XSS 防护**：描述文本避免使用 `dangerouslySetInnerHTML`
2. **URL 验证**：确保图片 URL 来自可信来源
3. **参数校验**：验证 URL 参数 `id` 格式合法性

---

## 未来扩展

### 可能的功能增强

1. **收藏功能**：添加收藏按钮
2. **分享功能**：社交媒体分享按钮
3. **相关推荐**：展示相关商品列表
4. **用户评价**：显示商品评价和评分
5. **规格选择**：颜色、尺寸等规格选择器
6. **数量选择**：购买数量选择器
7. **加入购物车**：添加购物车按钮
8. **图片放大镜**：鼠标悬停放大查看细节
9. **面包屑导航**：首页 > 列表 > 详情
10. **历史记录**：浏览历史记录功能

**注意**：当前版本仅实现基础展示功能，上述增强功能待后续迭代。