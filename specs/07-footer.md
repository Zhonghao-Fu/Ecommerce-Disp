# 页脚模块规格说明书

## 模块概述

本模块负责实现网站底部页脚组件，展示网站信息、联系方式、社交媒体链接和版权声明。作为 RootLayout 的底部组件，页脚在所有页面保持一致，提供用户获取更多信息和联系网站的渠道。页脚设计简洁清晰，信息层次分明。

**设计原则**：
- 信息完整：提供必要的网站信息
- 结构清晰：分栏展示不同类型信息
- 简洁美观：避免信息过载
- 响应式：多端适配良好
- 可维护：易于更新联系信息和链接

---

## 功能需求

### 核心需求

1. **网站信息**
   - 网站名称和 Logo
   - 网站简介
   - 快速导航链接

2. **联系方式**
   - 电子邮箱
   - 联系电话（可选）
   - 工作地址（可选）

3. **社交媒体**
   - GitHub 链接
   - 微信/QQ（可选）
   - 微博/Twitter（可选）

4. **版权信息**
   - 版权声明
   - 当前年份自动更新
   - ICP 备案（可选）

5. **响应式布局**
   - PC 端：多栏并排布局
   - 移动端：单栏堆叠布局

---

## 技术实现

### 组件代码

```typescript
// src/components/Footer.tsx
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

interface SocialLink {
  name: string
  url: string
  icon: string
}

interface FooterLink {
  label: string
  path: string
}

const socialLinks: SocialLink[] = [
  { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { name: '微博', url: 'https://weibo.com', icon: '📱' },
  { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
]

const footerLinks: FooterLink[] = [
  { label: '商品列表', path: '/products' },
  { label: '关于我们', path: '/about' },
  { label: '联系方式', path: '/contact' },
]

/**
 * 页脚组件
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 第一栏：网站信息 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.logo}>🛍️</span>
            电商展示系统
          </h3>
          <p className={styles.description}>
            一个简洁优雅的商品展示平台，为您提供优质的购物体验。
            浏览我们的精选商品，发现更多好物。
          </p>
        </div>

        {/* 第二栏：快速导航 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>快速导航</h3>
          <ul className={styles.linkList}>
            {footerLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 第三栏：联系方式 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>联系我们</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <span className={styles.icon}>📧</span>
              <a href="mailto:contact@example.com" className={styles.contactLink}>
                contact@example.com
              </a>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.icon}>📞</span>
              <a href="tel:+86-123-4567-8900" className={styles.contactLink}>
                +86-123-4567-8900
              </a>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.icon}>📍</span>
              <span className={styles.address}>
                北京市朝阳区某某街道
              </span>
            </li>
          </ul>
        </div>

        {/* 第四栏：社交媒体 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>关注我们</h3>
          <div className={styles.socialLinks}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={social.name}
                title={social.name}
              >
                <span className={styles.socialIcon}>{social.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className={styles.copyright}>
        <div className={styles.container}>
          <p>
            &copy; {currentYear} 电商展示系统. All rights reserved.
          </p>
          <p className={styles.beian}>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.beianLink}
            >
              京ICP备12345678号
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### 样式代码

```css
/* src/components/Footer.module.css */

.footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  margin-top: auto;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 1.5rem 2rem;
}

/* Sections Grid */
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.section {
  padding: 0 1rem;
}

.sectionTitle {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  font-size: 1.3rem;
}

.description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #bdc3c7;
  margin: 0;
}

/* Link List */
.linkList {
  list-style: none;
  margin: 0;
  padding: 0;
}

.linkList li {
  margin-bottom: 0.5rem;
}

.link {
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  display: inline-block;
}

.link:hover {
  color: #4a90e2;
  transform: translateX(4px);
}

/* Contact List */
.contactList {
  list-style: none;
  margin: 0;
  padding: 0;
}

.contactItem {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.contactLink {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.2s;
}

.contactLink:hover {
  color: #4a90e2;
}

.address {
  color: #bdc3c7;
  line-height: 1.5;
}

/* Social Links */
.socialLinks {
  display: flex;
  gap: 0.75rem;
}

.socialLink {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.2s;
}

.socialLink:hover {
  background-color: #4a90e2;
  transform: translateY(-2px);
}

.socialIcon {
  font-size: 1.2rem;
}

/* Copyright */
.copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 2rem;
  padding-top: 1.5rem;
}

.copyright .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0;
  grid-template-columns: none;
}

.copyright p {
  margin: 0;
  font-size: 0.85rem;
  color: #95a5a6;
}

.beian {
  flex-shrink: 0;
}

.beianLink {
  color: #95a5a6;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.beianLink:hover {
  color: #4a90e2;
}

/* Responsive */
@media (max-width: 1024px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 1rem 1.5rem;
  }

  .section {
    padding: 0;
  }

  .copyright .container {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .socialLinks {
    justify-content: center;
  }

  .sectionTitle {
    font-size: 1rem;
  }

  .description,
  .link,
  .contactItem,
  .copyright p {
    font-size: 0.85rem;
  }
}
```

---

## 接口说明

### Props

Footer 组件不需要 props，使用内部数据配置。

### 数据配置

可在组件内部修改以下配置：

- **socialLinks**: 社交媒体链接数组
- **footerLinks**: 快速导航链接数组
- **联系信息**: 邮箱、电话、地址
- **备案信息**: ICP 备案号

### 自动更新

- **currentYear**: 使用 `new Date().getFullYear()` 自动获取当前年份

---

## UI/UX 设计

### 布局结构

```
┌─────────────────────────────────────────────────────────┐
│  🛍️ 电商展示系统    │  快速导航  │  联系我们  │  关注我们  │
│  网站简介...        │  - 商品列表 │  📧 邮箱   │  🐙 📱 🐦 │
│                     │  - 关于我们 │  📞 电话   │            │
│                     │  - 联系方式 │  📍 地址   │            │
├─────────────────────────────────────────────────────────┤
│  © 2026 电商展示系统. All rights reserved.  京ICP备...  │
└─────────────────────────────────────────────────────────┘

移动端（单栏堆叠）：
┌──────────────────────┐
│  🛍️ 电商展示系统      │
│  网站简介...          │
├──────────────────────┤
│  快速导航             │
│  - 商品列表           │
│  - 关于我们           │
│  - 联系方式           │
├──────────────────────┤
│  联系我们             │
│  📧 邮箱              │
│  📞 电话              │
│  📍 地址              │
├──────────────────────┤
│  关注我们             │
│  🐙 📱 🐦            │
├──────────────────────┤
│  © 2026 电商展示系统  │
│  京ICP备...           │
└──────────────────────┘
```

### 颜色方案

- **背景色**: `#2c3e50` (深蓝灰)
- **文字色**: `#ecf0f1` (浅灰白)
- **次要文字**: `#bdc3c7` (中灰)
- **版权文字**: `#95a5a6` (深灰)
- **链接悬停**: `#4a90e2` (蓝色)
- **社交图标背景**: `rgba(255, 255, 255, 0.1)`
- **社交图标悬停**: `#4a90e2`
- **分隔线**: `rgba(255, 255, 255, 0.1)`

### 交互效果

- **导航链接悬停**: 蓝色文字 + 右移 4px
- **联系链接悬停**: 蓝色文字
- **社交图标悬停**: 蓝色背景 + 上移 2px
- **备案链接悬停**: 蓝色文字
- **所有过渡**: 0.2s ease

### 响应式断点

- **PC 端** (> 1024px): 4 栏并排
- **平板端** (768px - 1024px): 2 栏并排
- **移动端** (< 768px): 单栏堆叠

### 可访问性

- `aria-label`: 社交媒体链接标签
- `title`: 社交媒体链接提示
- `target="_blank"`: 外部链接新窗口打开
- `rel="noopener noreferrer"`: 安全性保护
- 键盘导航支持
- 足够的颜色对比度

---

## 测试要点

### 渲染测试

- [ ] 四栏内容正确显示
- [ ] 网站 Logo 和标题显示
- [ ] 网站简介文本完整
- [ ] 快速导航链接列表正确
- [ ] 联系信息完整显示
- [ ] 社交媒体图标显示
- [ ] 版权信息正确（年份自动更新）
- [ ] 备案链接显示

### 交互测试

- [ ] 点击导航链接跳转正确
- [ ] 点击邮箱打开邮件客户端
- [ ] 点击电话拨号（移动端）
- [ ] 点击社交链接新窗口打开
- [ ] 点击备案链接跳转工信部网站
- [ ] 所有悬停效果正常

### 响应式测试

- [ ] PC 端 (> 1024px) 4 栏布局
- [ ] 平板端 (768px - 1024px) 2 栏布局
- [ ] 移动端 (< 768px) 单栏布局
- [ ] 版权信息在移动端垂直堆叠
- [ ] 社交图标居中对齐
- [ ] 字体大小适配

### 样式测试

- [ ] 背景颜色正确
- [ ] 文字颜色层次分明
- [ ] 悬停效果流畅
- [ ] 社交图标圆形背景
- [ ] 分隔线显示正常
- [ ] 间距和边距合理

### 可访问性测试

- [ ] 键盘导航可用
- [ ] 屏幕阅读器正确朗读
- [ ] ARIA 属性正确
- [ ] 外部链接安全性
- [ ] 颜色对比度符合 WCAG 标准

### 数据测试

- [ ] 年份自动更新（跨年后测试）
- [ ] 社交链接数组可配置
- [ ] 导航链接数组可配置
- [ ] 联系信息易于修改
- [ ] 备案信息可配置

### 边界测试

- [ ] 长文本不换行处理
- [ ] 空链接数组不报错
- [ ] 外部链接无效时不崩溃
- [ ] 窗口大小快速切换
- [ ] 极端屏幕尺寸适配

---