# 环境变量配置模块规格说明书

## 模块概述

本模块负责管理项目的环境变量配置，实现开发、测试、生产等多环境的配置隔离。通过环境变量管理敏感信息（如数据库连接、API 密钥）和环境特定配置（如端口号、API 地址），确保应用在不同环境下正常运行，同时保障敏感信息安全。

**设计原则**：
- 环境隔离：不同环境使用独立配置文件
- 类型安全：TypeScript 类型约束，避免拼写错误
- 安全优先：敏感信息不提交到代码仓库
- 统一管理：集中管理所有环境变量

---

## 功能需求

### 核心需求

1. **多环境支持**
   - 开发环境（development）
   - 测试环境（test）
   - 生产环境（production）
   - 支持自定义环境

2. **配置分离**
   - 前端环境变量（VITE_ 前缀）
   - 后端环境变量
   - 公共配置（如应用名称）
   - 敏感配置（如数据库密码）

3. **类型安全**
   - TypeScript 类型定义
   - 编译时检查
   - IDE 智能提示

4. **默认值支持**
   - 关键配置项设置合理默认值
   - 缺少必填项时友好提示

5. **配置文件管理**
   - .env 文件模板
   - .gitignore 排除敏感文件
   - 提供 .env.example 作为参考

---

## 技术实现

### 技术选型

**前端**（Vite）：
- 内置环境变量支持
- 必须以 `VITE_` 前缀才能被客户端访问
- 通过 `import.meta.env` 访问

**后端**（Node.js）：
- dotenv 库加载 .env 文件
- 自定义配置验证逻辑
- 通过 `process.env` 访问

### 文件结构

```
frontend/
├── .env                    # 所有环境共享（提交到仓库）
├── .env.development        # 开发环境（提交到仓库）
├── .env.test              # 测试环境（提交到仓库）
├── .env.production        # 生产环境（提交到仓库）
├── .env.local             # 本地覆盖（不提交）
└── .env.example           # 配置模板（提交到仓库）

backend/
├── .env                    # 所有环境共享
├── .env.development        # 开发环境
├── .env.test              # 测试环境
├── .env.production        # 生产环境
├── .env.local             # 本地覆盖（不提交）
├── .env.example           # 配置模板
└── src/config/env.ts      # 环境变量类型定义和验证
```

### 加载优先级

```
.env.local > .env.{环境} > .env > 默认值
```

---

## 配置项说明

### 前端环境变量

#### .env.development（开发环境）

```env
# 应用配置
VITE_APP_NAME=我的小店
VITE_APP_DESCRIPTION=个人电商商品展示平台

# API 配置
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOGS=true

# 分页配置
VITE_DEFAULT_PAGE_SIZE=12

# 图片配置
VITE_IMAGE_PLACEHOLDER=https://via.placeholder.com/400x400
```

#### .env.production（生产环境）

```env
# 应用配置
VITE_APP_NAME=我的小店
VITE_APP_DESCRIPTION=个人电商商品展示平台

# API 配置
VITE_API_BASE_URL=https://api.myshop.com/api
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOGS=false

# 分页配置
VITE_DEFAULT_PAGE_SIZE=12

# 图片配置
VITE_IMAGE_PLACEHOLDER=/images/placeholder.png
```

#### .env.example（配置模板）

```env
# 应用配置
VITE_APP_NAME=应用名称
VITE_APP_DESCRIPTION=应用描述

# API 配置
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOGS=true

# 分页配置
VITE_DEFAULT_PAGE_SIZE=12

# 图片配置
VITE_IMAGE_PLACEHOLDER=占位图URL
```

### 后端环境变量

#### .env.development（开发环境）

```env
# 服务器配置
PORT=4000
NODE_ENV=development

# 数据库配置
DATABASE_URL=file:./dev.db
DATABASE_LOGGING=true

# CORS 配置
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,POST,PUT,PATCH,DELETE

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=dev

# JWT 配置（如果后续需要）
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# 文件上传配置
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

#### .env.production（生产环境）

```env
# 服务器配置
PORT=4000
NODE_ENV=production

# 数据库配置
DATABASE_URL=file:./prod.db
DATABASE_LOGGING=false

# CORS 配置
CORS_ORIGIN=https://myshop.com
CORS_METHODS=GET,POST,PUT,PATCH,DELETE

# 日志配置
LOG_LEVEL=warn
LOG_FORMAT=combined

# JWT 配置（如果后续需要）
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# 文件上传配置
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

#### .env.example（配置模板）

```env
# 服务器配置
PORT=4000
NODE_ENV=development

# 数据库配置
DATABASE_URL=file:./dev.db
DATABASE_LOGGING=true

# CORS 配置
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,POST,PUT,PATCH,DELETE

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=dev

# JWT 配置
JWT_SECRET=change-this-to-a-secure-random-string
JWT_EXPIRES_IN=7d

# 文件上传配置
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### TypeScript 类型定义

#### frontend/src/types/env.d.ts

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ENABLE_LOGS: string
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_IMAGE_PLACEHOLDER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

#### backend/src/config/env.ts

```typescript
import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
})

// 环境变量类型定义
export interface EnvConfig {
  port: number
  nodeEnv: 'development' | 'test' | 'production'
  databaseUrl: string
  databaseLogging: boolean
  corsOrigin: string
  corsMethods: string
  logLevel: string
  logFormat: string
  jwtSecret: string
  jwtExpiresIn: string
  maxFileSize: number
  uploadDir: string
}

// 环境变量验证和提取
export const env: EnvConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  databaseLogging: process.env.DATABASE_LOGGING === 'true',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  corsMethods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE',
  logLevel: process.env.LOG_LEVEL || 'debug',
  logFormat: process.env.LOG_FORMAT || 'dev',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
}

// 生产环境必填项检查
if (env.nodeEnv === 'production') {
  const requiredVars = ['JWT_SECRET', 'DATABASE_URL', 'CORS_ORIGIN']
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for production: ${missingVars.join(', ')}`
    )
  }
  
  // JWT Secret 安全性检查
  if (env.jwtSecret === 'dev-secret' || env.jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long in production'
    )
  }
}
```

---

## 安全要求

### 1. .gitignore 配置

**必须**在 `.gitignore` 中排除以下文件：

```gitignore
# 环境变量文件
.env.local
.env.*.local

# 生产环境敏感配置（如果使用 CI/CD 注入）
# .env.production

# 上传目录
uploads/
```

### 2. 敏感信息保护

❌ **禁止**：
- 将真实的生产数据库密码提交到仓库
- 将真实的 API 密钥提交到仓库
- 在前端环境变量中存储敏感信息
- 使用弱密钥（如 `secret`、`password`）

✅ **建议**：
- 使用 CI/CD 平台的环境变量功能注入生产配置
- 使用密钥管理服务（如 AWS Secrets Manager、Vault）
- 定期轮换密钥
- 使用强随机字符串作为 JWT Secret

### 3. 前端环境变量安全

⚠️ **重要**：
- 所有 `VITE_` 前缀的环境变量会被打包到前端代码中
- 前端代码对用户的浏览器完全可见
- **不要**在前端环境变量中存储任何敏感信息

✅ **可以存储**：
- API 地址
- 功能开关
- 应用配置
- 第三方服务公开 ID（如 Google Analytics ID）

❌ **不能存储**：
- API 密钥
- 数据库密码
- JWT Secret
- 任何后端私密信息

### 4. 环境变量验证

- 应用启动时验证必填环境变量
- 生产环境进行更严格的安全检查
- 提供清晰的错误提示信息
- 记录加载的环境变量（开发环境）

---

## 测试要点

### 1. 配置文件测试

- [ ] .env.example 包含所有必要的配置项
- [ ] .env.development 配置正确且可运行
- [ ] .env.production 包含所有生产必需的配置
- [ ] .gitignore 正确排除敏感文件
- [ ] 实际提交中不包含 .env.local 文件

### 2. 类型安全测试

- [ ] TypeScript 类型定义完整
- [ ] IDE 提供环境变量智能提示
- [ ] 拼写错误能在编译时发现
- [ ] 类型转换正确（如 string 转 number）

### 3. 环境变量加载测试

- [ ] 开发环境正确加载 .env.development
- [ ] 生产环境正确加载 .env.production
- [ ] .env.local 可以覆盖其他配置
- [ ] 缺失环境变量时使用默认值
- [ ] 前端可以通过 import.meta.env 访问 VITE_ 变量

### 4. 安全测试

- [ ] .env.local 未提交到 Git
- [ ] 前端环境变量不包含敏感信息
- [ ] 生产环境 JWT_SECRET 长度 >= 32
- [ ] 缺失必填环境变量时应用拒绝启动
- [ ] 错误提示不包含敏感信息

### 5. 多环境测试

- [ ] 切换 NODE_ENV 后配置正确切换
- [ ] 开发环境 CORS 指向 localhost
- [ ] 生产环境 CORS 指向正式域名
- [ ] 不同环境使用不同数据库文件
- [ ] 日志级别根据环境正确设置

### 6. 错误处理测试

- [ ] 缺少必填环境变量时抛出清晰错误
- [ ] 环境变量格式错误时友好提示
- [ ] 生产环境使用默认密钥时拒绝启动
- [ ] 数据库连接字符串错误时正确报错

---

## 附录

### 生成安全的 JWT Secret

```bash
# 使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 使用 OpenSSL 生成
openssl rand -hex 64
```

### 环境变量最佳实践

1. **命名规范**
   - 使用大写字母和下划线：`DATABASE_URL`
   - 前端变量必须 `VITE_` 前缀
   - 相关配置使用相同前缀分组

2. **文档化**
   - .env.example 包含详细说明
   - 每个配置项添加注释
   - 说明配置项的作用和取值范围

3. **默认值**
   - 开发环境提供合理默认值
   - 生产环境要求显式配置
   - 关键配置不使用默认值

4. **验证时机**
   - 应用启动时验证
   - 生产环境更严格验证
   - 提供清晰的错误信息

### 常用命令

```bash
# 开发环境启动
npm run dev

# 指定环境启动
NODE_ENV=test npm run dev

# 查看当前环境变量（后端调试）
node -e "console.log(process.env)"
```

---

**相关模块**：
- 模块 20 - 项目结构与构建配置
- 模块 19 - TypeScript 类型定义
- 模块 13 - 跨域配置

**下一步建议**：模块 19 - TypeScript 类型定义

