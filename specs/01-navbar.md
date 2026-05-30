# 导航栏模块规格说明书

## 模块概述

本模块负责实现网站顶部导航栏组件，作为整个应用的全局导航入口。导航栏包含网站 Logo、标题、主要导航链接，并在移动端提供响应式汉堡菜单。作为 RootLayout 的顶部组件，导航栏在所有页面保持一致，提供品牌识别和快速导航功能。

**设计原则**：
- 品牌一致性：统一的 Logo 和标题展示
- 导航清晰：明确的导航链接，易于理解
- 响应式：PC 端横向导航，移动端汉堡菜单
- 固定定位：滚动时保持在顶部
- 简洁设计：避免过度装饰，突出内容

---

## 功能需求

### 核心需求

1. **品牌展示**
   - 网站 Logo（图标或文字）
   - 网站标题
   - 点击返回首页

2. **导航链接**
   - 首页/商品列表
   - 关于页面（预留）
   - 联系页面（预留）

3. **响应式布局**
   - PC 端：横向导航链接
   - 移动端：汉堡菜单 + 下拉导航

4. **交互功能**
   - Logo 点击跳转首页
   - 导航链接高亮当前页面
   - 移动端菜单展开/收起
   - 滚动时固定顶部

---

## 技术实现

### 组件代码

```typescript
// src/components/Navbar.tsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

interface NavLink {
  path: string
  label: string
}

const navLinks: NavLink[] = [
  { path: '/products', label: '商品列表' },
  { path: '/about', label: '关于我们' },
  { path: '/contact', label: '联系方式' },
]

/**
 * 导航栏组件
 */
export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo 和标题 */}
        <Link to="/" className={styles.brand} onClick={closeMenu}>
          <span className={styles.logo}>🛍️</span>
          <span className={styles.title}>电商展示系统</span>
        </Link>

        {/* PC 端导航链接 */}
        <ul className={styles.navLinks}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* 移动端汉堡菜单按钮 */}
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={isMenuOpen}
        >
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileNavLinks}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </nav>
  )
}
```

### 样式代码

```css
/* src/components/Navbar.module.css */

.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #333;
  transition: opacity 0.2s;
}

.brand:hover {
  opacity: 0.8;
}

.logo {
  font-size: 1.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
}

/* PC Navigation Links */
.navLinks {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navLink {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.navLink:hover {
  color: #4a90e2;
  background-color: #f0f7ff;
}

.navLink.active {
  color: #4a90e2;
  background-color: #e3f2fd;
}

/* Mobile Menu Button */
.menuButton {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 24px;
}

.hamburger span {
  display: block;
  height: 2px;
  background-color: #333;
  transition: all 0.3s;
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Menu */
.mobileMenu {
  display: none;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.mobileNavLinks {
  list-style: none;
  margin: 0;
  padding: 1rem 1.5rem;
}

.mobileNavLink {
  display: block;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.mobileNavLink:hover {
  color: #4a90e2;
  background-color: #f0f7ff;
}

.mobileNavLink.active {
  color: #4a90e2;
  background-color: #e3f2fd;
}

/* Responsive */
@media (max-width: 768px) {
  .navLinks {
    display: none;
  }

  .menuButton {
    display: block;
  }

  .mobileMenu {
    display: block;
  }

  .container {
    padding: 0.75rem 1rem;
  }

  .title {
    font-size: 1.1rem;
  }
}
```

---

## 接口说明

### Props

Navbar 组件不需要 props，使用内部状态管理。

### 状态管理

- **isMenuOpen**: `boolean` - 移动端菜单展开状态
- **location**: `useLocation()` - 当前路由位置，用于高亮活动链接

### 路由集成

- 使用 `Link` 组件进行声明式导航
- 使用 `useLocation()` 检测当前页面
- 点击导航链接时自动关闭移动端菜单

---

## UI/UX 设计

### 布局结构

```
┌─────────────────────────────────────────────┐
│  🛍️ 电商展示系统    [商品列表] [关于] [联系] │  ← PC 端
└─────────────────────────────────────────────┘

┌──────────────────────────────┐
│  🛍️ 电商展示系统        ☰   │  ← 移动端（折叠）
└──────────────────────────────┘
┌──────────────────────────────┐
│  🛍️ 电商展示系统        ✕   │  ← 移动端（展开）
│  ─────────────────────────  │
│  [商品列表]                  │
│  [关于]                      │
│  [联系]                      │
└──────────────────────────────┘
```

### 颜色方案

- **背景色**: `#ffffff` (白色)
- **文字色**: `#333333` (深灰)
- **链接色**: `#666666` (中灰)
- **活动色**: `#4a90e2` (蓝色)
- **悬停背景**: `#f0f7ff` (浅蓝)
- **阴影**: `0 2px 4px rgba(0, 0, 0, 0.1)`

### 交互效果

- **Logo 悬停**: 透明度降低到 0.8
- **链接悬停**: 蓝色文字 + 浅蓝背景
- **活动链接**: 蓝色文字 + 浅蓝背景
- **汉堡菜单**: 三条线动画变换为 X
- **菜单展开**: 平滑过渡效果

### 响应式断点

- **PC 端** (> 768px): 横向导航链接
- **移动端** (≤ 768px): 汉堡菜单 + 下拉导航

### 可访问性

- `aria-label`: 菜单按钮标签
- `aria-expanded`: 菜单展开状态
- 键盘导航支持（Tab 键）
- 焦点指示器

---

## 测试要点

### 渲染测试

- [ ] Logo 和标题正确显示
- [ ] 导航链接列表正确渲染
- [ ] PC 端显示横向导航
- [ ] 移动端显示汉堡菜单
- [ ] 初始状态菜单关闭

### 交互测试

- [ ] 点击 Logo 跳转首页
- [ ] 点击导航链接跳转对应页面
- [ ] 当前页面链接高亮显示
- [ ] 移动端点击汉堡菜单展开
- [ ] 移动端再次点击关闭
- [ ] 点击导航链接自动关闭菜单

### 响应式测试

- [ ] PC 端 (> 768px) 显示横向导航
- [ ] 移动端 (≤ 768px) 显示汉堡菜单
- [ ] 平板端适配良好
- [ ] 窗口大小切换时正确响应

### 样式测试

- [ ] 悬停效果正常工作
- [ ] 活动链接样式正确
- [ ] 阴影效果显示
- [ ] 固定定位滚动时保持顶部
- [ ] 汉堡菜单动画流畅

### 可访问性测试

- [ ] 键盘导航可用
- [ ] 屏幕阅读器正确朗读
- [ ] 焦点指示器可见
- [ ] ARIA 属性正确

### 边界测试

- [ ] 空路由路径处理
- [ ] 未知路由不报错
- [ ] 快速点击菜单按钮
- [ ] 长标题文本不换行

---