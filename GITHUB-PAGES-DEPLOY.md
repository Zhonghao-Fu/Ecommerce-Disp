# GitHub Pages 部署指南

## 🚀 快速部署前端到 GitHub Pages

### 前置条件
- 项目已推送到 GitHub
- 使用 React + Vite 构建

---

## 方案 1：使用 GitHub Actions 自动部署（推荐）⭐

### 步骤 1：创建 GitHub Actions 工作流

创建文件 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
          cache-dependency-path: 'frontend/pnpm-lock.yaml'

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install dependencies
        run: cd frontend && pnpm install

      - name: Build
        run: cd frontend && pnpm build
        env:
          VITE_API_BASE_URL: https://your-backend-url.com/api/v1

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'frontend/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 步骤 2：配置 Vite 基础路径

修改 `frontend/vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/E-commerceProductDispWeb/', // 替换为你的仓库名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

### 步骤 3：配置环境变量

创建 `frontend/.env.production`：

```env
# GitHub Pages 部署时使用的外部 API
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
VITE_NODE_ENV=production
```

### 步骤 4：启用 GitHub Pages

1. 进入 GitHub 仓库 → **Settings** → **Pages**
2. **Source** 选择：**GitHub Actions**
3. 保存后，推送代码到 `main` 分支会自动触发部署

### 步骤 5：查看部署状态

- Actions 页面：`https://github.com/用户名/仓库名/actions`
- 部署成功后访问：`https://用户名.github.io/仓库名/`

---

## 方案 2：手动部署

### 步骤 1：构建项目

```bash
cd frontend
pnpm build
```

### 步骤 2：创建 gh-pages 分支

```bash
# 安装 gh-pages
pnpm add -D gh-pages

# 在 package.json 添加脚本
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

### 步骤 3：部署

```bash
pnpm deploy
```

---

## ⚠️ 重要注意事项

### 1. API 集成问题

GitHub Pages **只支持静态文件**，无法托管后端。你需要：

**选项 A：使用外部 API 服务**
- Railway (railway.app) - 免费额度 $5/月
- Render (render.com) - 免费层
- Fly.io - 免费额度

**选项 B：使用 Mock 数据**
修改 `frontend/src/config/api.ts`：

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 如果没有配置外部 API，使用 Mock 数据
export const USE_MOCK = !import.meta.env.VITE_API_BASE_URL
```

**选项 C：前后端同域部署**
- 将后端部署到支持 Node.js 的平台
- 配置反向代理，使前后端在同一域名下

### 2. 路由配置

如果使用 React Router 的 `BrowserRouter`，需要添加 404 页面重定向：

创建 `frontend/public/404.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/E-commerceProductDispWeb/'">
</head>
<body>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</body>
</html>
```

修改 `frontend/src/main.tsx`：

```typescript
import { BrowserRouter, useLocation } from 'react-router-dom'

// 处理 GitHub Pages 路由重定向
function RedirectHandler() {
  const location = useLocation()
  
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      // 从完整 URL 中提取路径
      const url = new URL(redirect)
      if (url.pathname !== location.pathname) {
        window.history.replaceState({}, '', url.pathname)
      }
    }
  }, [location])
  
  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/E-commerceProductDispWeb/">
    <RedirectHandler />
    <App />
  </BrowserRouter>
)
```

### 3. 图片资源

确保所有图片使用相对路径或 CDN，不要使用本地路径。

---

## 🔧 后端部署建议

### Railway（推荐）

1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 配置环境变量：
   ```env
   NODE_ENV=production
   DATABASE_URL=file:./dev.db
   CORS_ORIGINS=https://yourusername.github.io
   PORT=$PORT
   ```
4. 添加启动命令：
   ```bash
   npx prisma generate && npx prisma db push && node dist/server.js
   ```

### Render

1. 访问 https://render.com
2. 创建 Web Service
3. 配置：
   - Build: `cd backend && npm install && npx prisma generate && npx tsc`
   - Start: `node dist/server.js`

---

## 📊 部署检查清单

- [ ] 修改 `vite.config.ts` 的 `base` 路径
- [ ] 配置 `.env.production` 的 API URL
- [ ] 创建 `.github/workflows/deploy.yml`
- [ ] 在 GitHub Settings 启用 Pages
- [ ] 测试部署后的页面访问
- [ ] 验证 API 连接是否正常
- [ ] 检查路由跳转是否正确
- [ ] 确认图片资源加载正常

---

**最后更新**: 2026-06-01
