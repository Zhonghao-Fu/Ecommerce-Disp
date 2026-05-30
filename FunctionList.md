# 个人电商商品展示系统 - 功能清单

## 项目概述
一个前后端完全分离的商品展示网页系统，采用 RESTful API 设计，AI 友好架构，便于后续维护。

---

## 一、前端功能 (Frontend)

### 1. 商品列表页面
- [ ] 1.1 商品卡片网格展示（图片、名称、价格、状态）
- [ ] 1.2 分页功能（页码导航、每页数量选择）
- [ ] 1.3 商品筛选功能
  - [ ] 按上架状态筛选（已上架/已下架）
  - [ ] 按价格区间筛选
  - [ ] 按商品名称搜索
- [ ] 1.4 排序功能（按价格、按上架时间）
- [ ] 1.5 响应式布局（支持PC、平板、手机）
- [ ] 1.6 加载状态提示（Loading 动画）
- [ ] 1.7 空状态提示（无商品时的友好提示）

### 2. 商品详情页面
- [ ] 2.1 商品大图展示（支持图片放大查看）
- [ ] 2.2 商品基本信息展示
  - 商品名称
  - 商品价格
  - 商品描述
  - 上架状态
  - 上架时间
- [ ] 2.3 返回商品列表按钮
- [ ] 2.4 商品不存在/已下架提示

### 3. 页脚模块
- [ ] 3.1 联系方式展示
  - 电话/微信
  - 邮箱
  - 社交媒体链接（可选）
- [ ] 3.2 版权信息
- [ ] 3.3 固定底部或随页面滚动

### 4. 全局功能
- [ ] 4.1 导航栏（网站标题/Logo）
- [ ] 4.2 路由管理（列表页、详情页）
- [ ] 4.3 全局错误处理（404、网络错误）
- [ ] 4.4 响应式设计适配

---

## 二、后端功能 (Backend)

### 1. 商品管理 API（RESTful）

#### 1.1 商品查询接口
- [ ] `GET /api/products` - 获取商品列表
  - 查询参数：page, pageSize, status, minPrice, maxPrice, keyword, sortBy
  - 响应：商品列表 + 分页信息
  
- [ ] `GET /api/products/:id` - 获取单个商品详情
  - 响应：商品完整信息

#### 1.2 商品管理接口
- [ ] `POST /api/products` - 创建商品（上下架管理用）
  - 请求体：name, price, description, images, status
  
- [ ] `PUT /api/products/:id` - 更新商品信息
  - 请求体：可更新的商品字段
  
- [ ] `PATCH /api/products/:id/status` - 更新商品上下架状态
  - 请求体：{ status: 'on_sale' | 'off_sale' }
  
- [ ] `DELETE /api/products/:id` - 删除商品

### 2. 数据模型设计
- [ ] 2.1 商品表（Products）
  - id (主键，自增/UUID)
  - name (商品名称)
  - price (价格，Decimal)
  - description (商品描述)
  - images (图片URL数组)
  - status (状态：on_sale/off_sale)
  - created_at (创建时间)
  - updated_at (更新时间)

### 3. API 规范
- [ ] 3.1 统一响应格式
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {}
  }
  ```
- [ ] 3.2 统一错误处理
  ```json
  {
    "code": 400,
    "message": "错误信息",
    "error": "详细错误"
  }
  ```
- [ ] 3.3 CORS 跨域配置
- [ ] 3.4 API 文档（Swagger/OpenAPI）

---

## 三、技术栈建议

### 前端
- **框架**: React 18+ / Vue 3
- **路由**: React Router / Vue Router
- **HTTP 客户端**: Axios
- **UI 组件库**: Ant Design / Element Plus
- **构建工具**: Vite
- **样式方案**: CSS Modules / Tailwind CSS

### 后端
- **运行时**: Node.js
- **框架**: Express / Koa / Fastify
- **数据库**: SQLite (轻量) / PostgreSQL / MySQL
- **ORM**: Prisma / Sequelize
- **API 文档**: Swagger / OpenAPI

### AI 友好特性
- [ ] 清晰的代码注释
- [ ] 完善的 API 文档
- [ ] 标准化的项目结构
- [ ] 类型定义（TypeScript）
- [ ] 环境变量配置说明
- [ ] 部署文档

---

## 四、项目结构建议

```
project/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 调用
│   │   ├── types/           # TypeScript 类型
│   │   └── utils/           # 工具函数
│   └── package.json
│
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── services/        # 业务逻辑
│   │   └── middleware/      # 中间件
│   └── package.json
│
└── README.md                # 项目说明
```

---

## 五、后续扩展（二期功能）

- [ ] 购物车功能
- [ ] 用户登录/注册
- [ ] 订单管理
- [ ] 商品分类管理
- [ ] 图片上传功能
- [ ] 数据统计（访问量、热门商品）
- [ ] 管理后台

---

## 六、开发优先级

### Phase 1（当前阶段 - MVP）
1. ✅ 后端基础 API（商品 CRUD）
2. ✅ 商品列表页面
3. ✅ 商品详情页面
4. ✅ 上下架功能
5. ✅ 页脚联系方式

### Phase 2（后续优化）
- 搜索和筛选功能优化
- 图片懒加载
- 性能优化
- SEO 优化

### Phase 3（功能扩展）
- 购物车
- 用户系统
- 订单管理

---

## 备注
- 采用前后端完全分离架构
- RESTful API 设计原则
- 所有接口需要 AI 友好（清晰的命名、注释、文档）
- 便于后续通过 AI 工具进行维护扩展
