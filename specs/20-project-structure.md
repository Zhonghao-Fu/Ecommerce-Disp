# 项目结构与构建配置模块规格说明书

## 模块概述

本模块定义整个项目的基础架构，包括前后端分离的目录结构、构建工具配置、开发环境搭建和代码规范。作为项目的基础骨架，本模块的配置将直接影响后续所有模块的开发效率和代码质量。

**设计原则**：
- 前后端完全分离
- AI 友好（清晰的命名、结构化的目录、完善的注释）
- 模块化设计，便于维护和扩展
- 开箱即用的开发体验

---

## 功能需求

### 核心需求

1. **项目结构**
   - 清晰的前后端分离目录结构
   - 模块化组织代码，每个功能独立目录
   - 配置文件集中管理

2. **构建工具**
   - 前端：Vite 构建工具（快速热更新、开箱即用）
   - 后端：Node.js + TypeScript 编译配置
   - 支持开发模式和生产模式

3. **开发体验**
   - 前端热模块替换（HMR）
   - 后端自动重启（nodemon）
   - 统一的代码格式化（Prettier）
   - 代码质量检查（ESLint）

4. **TypeScript 支持**
   - 严格的类型检查
   - 路径别名配置
   - 生成声明文件

5. **环境管理**
   - 支持 development / production 多环境
   - 环境变量类型安全

---

## 技术实现

### 技术栈选择

**前端**：
- 构建工具：Vite 5.x
- 语言：TypeScript 5.x
- 框架：React 18.x 或 Vue 3.x（待定）
- 包管理：pnpm 或 npm

**后端**：
- 运行时：Node.js 18+ / 20+
- 框架：Express.js 4.x
- 语言：TypeScript 5.x
- 编译：ts-node（开发）+ tsc（生产）

### 关键配置文件

| 文件 | 用途 | 位置 |
|------|------|------|
| `package.json` | 项目依赖和脚本 | 根目录、frontend/、backend/ |
| `tsconfig.json` | TypeScript 编译配置 | frontend/、backend/ |
| `vite.config.ts` | Vite 构建配置 | frontend/ |
| `.env` | 环境变量 | frontend/、backend/ |
| `.eslintrc.js` | ESLint 配置 | 根目录 |
| `.prettierrc` | Prettier 配置 | 根目录 |

---

## 目录结构

### 完整项目结构

```
web-project/
├── frontend/                      # 前端项目
│   ├── public/                    # 静态资源（不经过构建）
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                # 静态资源（经过构建）
│   │   │   ├── images/            # 图片资源
│   │   │   └── styles/            # 全局样式
│   │   ├── components/            # 可复用组件
│   │   │   ├── Navbar/            # 导航栏
│   │   │   ├── Footer/            # 页脚
│   │   │   ├── ProductCard/       # 商品卡片
│   │   │   ├── Pagination/        # 分页组件
│   │   │   ├── Loading/           # 加载状态
│   │   │   └── EmptyState/        # 空状态
│   │   ├── pages/                 # 页面组件
│   │   │   ├── Home/              # 首页（商品列表）
│   │   │   └── ProductDetail/     # 商品详情页
│   │   ├── services/              # API 服务层
│   │   │   ├── api.ts             # Axios 实例配置
│   │   │   └── product.ts         # 商品相关 API
│   │   ├── types/                 # TypeScript 类型定义
│   │   │   ├── product.ts         # 商品类型
│   │   │   └── api.ts             # API 响应类型
│   │   ├── utils/                 # 工具函数
│   │   │   ├── format.ts          # 格式化函数
│   │   │   └── constants.ts       # 常量定义
│   │   ├── hooks/                 # 自定义 Hooks（React）
│   │   ├── router/                # 路由配置
│   │   │   └── index.tsx
│   │   ├── App.tsx                # 根组件
│   │   ├── main.tsx               # 入口文件
│   │   └── vite-env.d.ts          # Vite 类型声明
│   ├── index.html                 # HTML 模板
│   ├── package.json               # 前端依赖
│   ├── tsconfig.json              # TypeScript 配置
│   ├── vite.config.ts             # Vite 配置
│   └── .env                       # 环境变量
│
├── backend/                       # 后端项目
│   ├── src/
│   │   ├── controllers/           # 控制器（处理请求）
│   │   │   └── productController.ts
│   │   ├── models/                # 数据模型
│   │   │   └── Product.ts
│   │   ├── routes/                # 路由定义
│   │   │   └── productRoutes.ts
│   │   ├── services/              # 业务逻辑层
│   │   │   └── productService.ts
│   │   ├── middleware/            # 中间件
│   │   │   ├── errorHandler.ts    # 错误处理
│   │   │   └── cors.ts            # 跨域配置
│   │   ├── types/                 # TypeScript 类型
│   │   │   └── product.ts
│   │   ├── utils/                 # 工具函数
│   │   │   └── helpers.ts
│   │   ├── config/                # 配置文件
│   │   │   └── database.ts        # 数据库配置
│   │   ├── app.ts                 # Express 应用
│   │   └── server.ts              # 服务器入口
│   ├── package.json               # 后端依赖
│   ├── tsconfig.json              # TypeScript 配置
│   └── .env                       # 环境变量
│
├── specs/                         # 规格说明书目录
│   ├── MODULE-LIST.md             # 模块清单
│   └── 01-20-*.md                 # 各模块规格说明
│
├── docs/                          # 项目文档
│   └── README.md                  # 项目说明
│
├── .eslintrc.js                   # ESLint 配置（可选，分项目配置）
├── .prettierrc                    # Prettier 配置
├── .gitignore                     # Git 忽略配置
└── README.md                      # 项目总说明
```

---

## 构建配置

### 1. 前端 Vite 配置 (frontend/vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // 或 @vitejs/plugin-vue
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],  // 或 'vue'
        }
      }
    }
  }
})
```

### 2. 前端 TypeScript 配置 (frontend/tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. 后端 TypeScript 配置 (backend/tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@controllers/*": ["src/controllers/*"],
      "@models/*": ["src/models/*"],
      "@routes/*": ["src/routes/*"],
      "@services/*": ["src/services/*"],
      "@middleware/*": ["src/middleware/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. 前端 package.json 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  }
}
```

### 5. 后端 package.json 脚本

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint . --ext .ts --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### 6. 环境变量配置

**前端 .env.development**
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=我的小店
```

**后端 .env.development**
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=file:./dev.db
CORS_ORIGIN=http://localhost:3000
```

---

## 开发规范

### 1. 命名规范

**文件命名**：
- 组件文件：PascalCase（如 `ProductCard.tsx`）
- 工具文件：camelCase（如 `formatDate.ts`）
- 配置文件：kebab-case（如 `vite.config.ts`）

**变量/函数命名**：
- 常量：UPPER_SNAKE_CASE（如 `MAX_PRICE`）
- 变量/函数：camelCase（如 `getProductList`）
- 类/接口：PascalCase（如 `Product`、`ProductResponse`）

### 2. 代码组织规范

- 每个文件单一职责
- 组件文件不超过 200 行
- 按功能模块组织目录
- 导出使用 index.ts 统一管理

### 3. Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链相关
```

### 4. 注释规范

```typescript
/**
 * 获取商品列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.pageSize - 每页数量
 * @returns 商品列表和分页信息
 */
async function getProducts(params: QueryParams): Promise<ProductResponse>
```

### 5. AI 友好规范

- ✅ 清晰的模块边界
- ✅ 详细的 JSDoc 注释
- ✅ 完整的类型定义
- ✅ 结构化的错误处理
- ✅ 语义化的命名
- ✅ 统一的代码风格

---

## 测试要点

### 1. 构建测试

- [ ] 前端开发服务器正常启动
- [ ] 后端开发服务器正常启动
- [ ] 前端 HMR（热模块替换）正常工作
- [ ] 后端代码修改自动重启
- [ ] 前端生产构建成功
- [ ] 后端 TypeScript 编译成功

### 2. 配置测试

- [ ] 路径别名正确解析
- [ ] 环境变量正确加载
- [ ] API 代理配置正常工作
- [ ] CORS 配置生效

### 3. 代码质量测试

- [ ] ESLint 检查通过
- [ ] Prettier 格式化正常
- [ ] TypeScript 类型检查通过
- [ ] 无未使用的变量和导入

### 4. 开发体验测试

- [ ] 代码自动补全正常
- [ ] 类型提示准确
- [ ] 错误提示清晰
- [ ] 开发服务器启动速度合理（< 3s）

### 5. 目录结构验证

- [ ] 所有模块目录已创建
- [ ] 配置文件位置正确
- [ ] 入口文件配置正确
- [ ] 类型定义文件完整

---

## 附录

### 推荐开发工具

- **编辑器**: VS Code
- **VS Code 插件**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Auto Rename Tag
  - Path Intellisense

### 下一步

完成本模块后，建议按以下顺序继续：
1. 模块 18 - 环境变量配置
2. 模块 19 - TypeScript 类型定义
3. 模块 11 - 数据模型（后端）

