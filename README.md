# E-commerce Product Display System

一个现代化的电商商品展示系统，支持商品浏览、筛选、搜索和后台管理功能。

## ✨ 功能特性

### 用户端
- 📦 商品列表展示（支持分页）
- 🔍 多条件筛选（关键词、价格区间、状态、排序）
- 📱 响应式设计，支持移动端
- 🖼️ 商品详情查看
- 🔄 实时加载状态和空状态处理

### 管理端
- 📊 商品数据统计
- ✏️ 商品CRUD操作（增删改查）
- 📸 图片上传（支持拖拽、预览）
- 🏷️ 商品上下架管理
- ⚡ 实时同步更新

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **样式**: CSS Modules

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **ORM**: Prisma
- **数据库**: SQLite
- **文件上传**: Multer
- **验证**: Zod

## 📁 项目结构

```
WebProject/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   │   ├── admin/      # 管理端组件
│   │   │   └── ...
│   │   ├── pages/          # 页面组件
│   │   │   ├── Admin/     # 管理端页面
│   │   │   └── ...
│   │   ├── services/       # API服务层
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── types/          # TypeScript类型定义
│   │   ├── router/         # 路由配置
│   │   ├── config/         # 配置文件
│   │   └── utils/          # 工具函数
│   └── ...
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── validators/     # 数据验证
│   │   └── utils/          # 工具函数
│   ├── prisma/             # 数据库配置
│   │   └── schema.prisma   # 数据模型
│   └── uploads/            # 上传文件存储
├── specs/                    # 设计文档
└── FrontEndDesign/          # UI原型设计
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9 或 pnpm >= 8

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 数据库初始化

```bash
cd backend

# 生成Prisma客户端
npx prisma generate

# 创建数据库并应用迁移
npx prisma db push

# 导入测试数据
npx ts-node prisma/seed.ts
```

### 启动开发服务器

#### 方式一：分别启动

```bash
# 启动后端（终端1）
cd backend
npx nodemon

# 启动前端（终端2）
cd frontend
npm run dev
```

#### 方式二：使用npm scripts

```bash
# 如果配置了concurrently
npm run dev:all
```

### 访问地址

- **前端展示页**: http://localhost:3000/products
- **管理后台**: http://localhost:3000/admin/products
- **后端API**: http://localhost:4000
- **健康检查**: http://localhost:4000/api/health
- **API文档**: http://localhost:4000/api/v1/products

## 📝 环境变量

### 前端 (.env)
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_NODE_ENV=development
```

### 后端 (.env)
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CORS_ORIGINS="http://localhost:3000"
```

## 🔌 API接口

### 商品相关
- `GET /api/v1/products` - 获取商品列表
- `GET /api/v1/products/:id` - 获取商品详情
- `POST /api/v1/products` - 创建商品
- `PUT /api/v1/products/:id` - 更新商品
- `PATCH /api/v1/products/:id/status` - 更新商品状态
- `DELETE /api/v1/products/:id` - 删除商品

### 上传相关
- `POST /api/v1/upload/products` - 上传商品图片

## 🎯 使用示例

### 用户端使用流程
1. 访问 http://localhost:3000/products 查看商品列表
2. 使用顶部筛选器搜索和过滤商品
3. 点击商品卡片查看详情
4. 使用分页导航浏览更多商品

### 管理端使用流程
1. 访问 http://localhost:3000/admin/products 进入管理后台
2. 查看商品统计信息
3. 点击"新增商品"添加新商品
4. 使用操作列按钮进行上下架、编辑、删除
5. 上传图片支持拖拽或点击选择

## 📦 构建生产版本

```bash
# 构建前端
cd frontend
npm run build

# 后端部署
cd ../backend
npx prisma generate
npx prisma db push
NODE_ENV=production node dist/server.js
```

## 🧪 测试数据

项目包含13个测试商品，涵盖：
- 不同价格区间（¥9.90 - ¥9,999.00）
- 多种商品类别（电子产品、生活用品、数字产品等）
- 上架/下架状态
- 多图片/单图片商品

## 📄 设计文档

详细的设计文档位于 `specs/` 目录：
- 01-navbar.md - 导航栏设计
- 02-product-list.md - 商品列表
- 03-product-filter.md - 商品筛选
- ...
- 21-admin-panel.md - 管理面板设计

## 🤝 开发规范

- 遵循 TypeScript 严格模式
- 使用 CSS Modules 进行样式隔离
- RESTful API 设计规范
- 统一的错误处理机制
- 请求/响应拦截器

## 📄 许可证

MIT License

---

**最后更新**: 2026-05-30
