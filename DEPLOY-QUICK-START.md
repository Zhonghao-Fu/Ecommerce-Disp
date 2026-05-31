# 🚀 GitHub Pages 快速部署指南

## 5 分钟完成部署

### 步骤 1：推送代码到 GitHub

代码已自动包含部署配置，直接推送即可：

```bash
git add .
git commit -m "feat: 添加 GitHub Pages 部署配置"
git push origin main
```

### 步骤 2：启用 GitHub Pages

1. 访问你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. **Source** 选择：**GitHub Actions**
4. 点击 **Save**

### 步骤 3：配置后端 API（重要！）

GitHub Pages 只托管静态文件，**你需要配置后端 API**：

#### 选项 A：使用外部 API 服务（推荐）

1. **部署后端到 Railway**（免费）：
   ```bash
   # 访问 https://railway.app
   # 连接 GitHub 仓库
   # 配置环境变量：
   NODE_ENV=production
   DATABASE_URL=file:./dev.db
   CORS_ORIGINS=https://zhonghao-fu.github.io
   PORT=$PORT
   ```

2. **获取后端 URL**，例如：`https://your-app.railway.app`

3. **在 GitHub 仓库设置中添加 Secret**：
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-app.railway.app/api/v1`

#### 选项 B：本地测试（无后端）

如果暂时只想展示前端 UI：
- 无需配置，直接部署
- 页面会显示，但 API 调用会失败

### 步骤 4：等待部署完成

1. 访问 **Actions** 标签页查看部署进度
2. 通常 2-3 分钟完成
3. 部署成功后会显示访问链接

### 步骤 5：访问你的网站

格式：`https://你的用户名.github.io/仓库名/`

例如：`https://zhonghao-fu.github.io/E-commerceProductDispWeb/`

---

##  部署检查清单

- [ ] 代码已推送到 GitHub main 分支
- [ ] GitHub Pages 已启用（使用 GitHub Actions）
- [ ] 已配置后端 API URL（或接受无 API 模式）
- [ ] Actions 工作流执行成功
- [ ] 网站可以正常访问
- [ ] 路由跳转正常工作
- [ ] 图片资源加载正常

---

## ⚠️ 常见问题

### Q1: 页面显示空白？
**A**: 检查浏览器控制台是否有 CORS 错误，需要配置后端允许 GitHub Pages 域名访问。

### Q2: 路由跳转 404？
**A**: 已配置 404.html 重定向，刷新页面即可。

### Q3: API 调用失败？
**A**: 
- 检查 `VITE_API_BASE_URL` 是否正确配置
- 确保后端服务正在运行
- 检查 CORS 配置

### Q4: 图片不显示？
**A**: 确保图片使用完整的 URL（CDN 或外部链接），不要使用相对路径。

---

## 🎯 下一步优化建议

1. **自定义域名**
   - 在 GitHub Pages 设置中配置自定义域名
   - 更新 DNS 记录

2. **HTTPS**
   - GitHub Pages 自动提供 HTTPS
   - 确保后端 API 也使用 HTTPS

3. **性能优化**
   - 启用 CDN 缓存
   - 压缩图片资源
   - 使用 lazy loading

4. **SEO 优化**
   - 添加 meta tags
   - 生成 sitemap
   - 配置 Open Graph

---

## 📞 需要帮助？

查看详细文档：[GITHUB-PAGES-DEPLOY.md](./GITHUB-PAGES-DEPLOY.md)
