# 商品管理后台模块规格说明书

## 模块概述

本模块负责实现商品管理后台页面，为管理员提供完整的商品 CRUD（创建、读取、更新、删除）操作界面。包括商品列表管理、上下架状态切换、商品信息编辑、新增商品以及图片上传功能。

**设计原则**：
- 操作直观：清晰的表格布局和明确的操作按钮
- 状态可见：实时显示商品统计数据
- 交互友好：二次确认防止误操作，即时反馈操作结果
- 图片管理：支持本地图片上传和 URL 输入两种方式
- 高效操作：批量操作支持，快速状态切换

**访问方式**：
- 路由路径：`/admin/products`
- 访问控制：隐藏路由（无导航入口），无密码保护（后续可扩展）
- 目标用户：网站管理员（单人使用）

---

## 功能需求

### 核心功能

#### 1. **商品列表管理**
   - 以表格形式展示所有商品（不分在售/下架）
   - 显示商品缩略图、名称、ID、价格、状态、创建/更新时间
   - **完整筛选功能**（与用户端一致）：
     - 关键词搜索（商品名称、描述）
     - 价格区间筛选
     - 状态筛选（全部/在售/下架，默认：全部）
     - 排序方式（按创建时间/价格/名称）
     - 排序顺序（升序/降序）
     - 筛选条件重置
     - 筛选器展开/收起
   - 分页显示（每页 10 条）

#### 2. **商品状态管理**
   - 一键切换商品上下架状态
   - 切换前需二次确认
   - 操作成功后即时更新状态显示
   - 状态切换按钮颜色区分：
     - 在售商品：显示红色"下架"按钮
     - 下架商品：显示绿色"上架"按钮

#### 3. **商品编辑**
   - 弹窗模态框编辑商品信息
   - 可编辑字段：
     - 商品名称（必填）
     - 商品价格（必填，单位：元）
     - 商品描述（可选）
     - 商品状态（下拉选择：在售/下架）
     - 商品图片（支持 URL 输入和本地上传）
   - 编辑前需加载完整商品数据
   - 保存前验证必填字段
   - 支持取消编辑（不保存更改）

#### 4. **新增商品**
   - 弹窗模态框新增商品
   - 字段与编辑相同，但均为空初始状态
   - 新增成功后自动刷新列表
   - 默认状态为"在售"

#### 5. **商品删除**
   - 删除前需二次确认（显示商品名称）
   - 确认后调用删除 API
   - 删除成功后从列表中移除并刷新
   - 删除操作不可恢复（需提醒）

#### 6. **图片上传功能**
   - **上传方式**：
     - 方式一：本地文件上传（拖拽或点击选择）
     - 方式二：手动输入图片 URL
   - **支持格式**：
     - 图片格式：JPG, JPEG, PNG, GIF, WebP
     - 文件大小：单张 ≤ 5MB
     - 数量限制：最多 10 张图片
   - **上传流程**：
     1. 用户选择图片文件
     2. 前端验证格式和大小
     3. 调用上传 API 到后端
     4. 后端保存到 `/uploads/products/` 目录
     5. 返回图片 URL
     6. 前端显示预览图
   - **图片管理**：
     - 支持多张图片预览（缩略图网格）
     - 支持删除已上传图片
     - 支持拖拽排序
     - 第一张图作为商品主图（列表展示用）
   - **上传进度**：
     - 显示上传进度条
     - 上传中禁用提交按钮
     - 上传失败显示错误信息并重试

#### 7. **统计看板**
   - 商品总数
   - 在售商品数（绿色高亮）
   - 下架商品数（橙色高亮）
   - 今日更新数（红色高亮）

---

## 技术实现

### 前端组件结构

```
frontend/src/
├── pages/
│   ├── Admin/
│   │   ├── AdminLayout.tsx          # 管理后台布局
│   │   ├── AdminLayout.module.css
│   │   ├── ProductManagement.tsx    # 商品管理主页面
│   │   └── ProductManagement.module.css
├── components/
│   ├── admin/
│   │   ├── StatsCards.tsx           # 统计卡片组件
│   │   ├── StatsCards.module.css
│   │   ├── ProductTable.tsx         # 商品表格组件
│   │   ├── ProductTable.module.css
│   │   ├── ProductFormModal.tsx     # 新增/编辑模态框
│   │   ├── ProductFormModal.module.css
│   │   ├── ImageUploader.tsx        # 图片上传组件
│   │   └── ImageUploader.module.css
```

### 后端 API 扩展

```
backend/src/
├── routes/
│   ├── product.routes.ts            # 扩展图片上传路由
├── controllers/
│   ├── product.controller.ts        # 扩展上传控制器
├── middleware/
│   └── upload.ts                    # Multer 文件上传中间件
├── uploads/
│   └── products/                    # 图片存储目录（自动创建）
```

---

## API 接口说明

### 现有 API（复用）

| 方法 | 路径 | 说明 | 已实现 |
|------|------|------|--------|
| GET | `/api/v1/products` | 获取商品列表 | ✅ |
| GET | `/api/v1/products/:id` | 获取单个商品详情 | ✅ |
| POST | `/api/v1/products` | 创建商品 | ✅ |
| PUT | `/api/v1/products/:id` | 更新商品 | ✅ |
| PATCH | `/api/v1/products/:id/status` | 更新商品状态 | ✅ |
| DELETE | `/api/v1/products/:id` | 删除商品 | ✅ |

### 新增 API

#### 1. 上传图片

**接口**: `POST /api/v1/upload/products`

**请求**:
- Content-Type: `multipart/form-data`
- Body: `FormData` 包含字段 `image`（File 类型）

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/products/1234567890-image.jpg",
    "filename": "1234567890-image.jpg",
    "size": 102400
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "只支持 JPG, PNG, GIF, WebP 格式"
  }
}
```

**限制**:
- 文件大小：5MB
- 文件类型：`image/jpeg`, `image/png`, `image/gif`, `image/webp`
- 单次上传：1 个文件（多张图需多次调用）

---

## 数据结构

### 前端类型定义

```typescript
// 商品表单数据
export interface ProductFormData {
  name: string
  description?: string
  price: number  // 单位：元（前端显示）
  status: 'on_sale' | 'off_sale'
  images: string[]  // 图片 URL 数组
}

// 上传响应
export interface UploadResponse {
  success: boolean
  data: {
    url: string
    filename: string
    size: number
  }
  error?: {
    code: string
    message: string
  }
}

// 统计信息
export interface AdminStats {
  total: number
  onSale: number
  offSale: number
  todayUpdated: number
}
```

### 后端数据库 Schema

无需修改现有数据库 schema，复用 `Product` 模型。

---

## UI/UX 设计

### 页面布局

```
┌─────────────────────────────────────────────────────┐
│  深色导航栏 (ADMIN 标识)                              │
├─────────────────────────────────────────────────────┤
│  统计卡片区域（4 个卡片横向排列）                      │
├─────────────────────────────────────────────────────┤
│  操作栏                                              │
│  [🔍 搜索框] [状态筛选▼] [排序▼]      [➕ 新增商品]   │
├─────────────────────────────────────────────────────┤
│  商品表格                                            │
│  ┌───┬─────────┬──────┬──────┬──────────┬────────┐  │
│  │图 │ 商品信息 │ 价格 │ 状态 │ 更新时间 │ 操作   │  │
│  ├───┼─────────┼──────┼──────┼──────────┼────────┤  │
│  │🖼️ │ iPhone  │ ¥999 │ ✅   │ 2026-... │ 🟢🔴✏️🗑️│  │
│  │   │ 15 Pro  │      │ 在售 │          │        │  │
│  ├───┼─────────┼──────┼──────┼──────────┼────────┤  │
│  │...│  ...    │  ... │  ... │   ...    │  ...   │  │
│  └───┴─────────┴──────┴──────┴──────────┴────────┘  │
├─────────────────────────────────────────────────────┤
│  分页组件                                            │
└─────────────────────────────────────────────────────┘
```

### 模态框布局（新增/编辑）

```
┌──────────────────────────────────────────┐
│  新增商品 / 编辑商品           [× 关闭]   │
├──────────────────────────────────────────┤
│  商品名称 *                               │
│  ┌────────────────────────────────────┐  │
│  │ iPhone 15 Pro Max                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  商品价格（元）*                          │
│  ┌────────────────────────────────────┐  │
│  │ 9999                               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  商品描述                                 │
│  ┌────────────────────────────────────┐  │
│  │ Apple 最新旗舰手机...              │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  商品状态                                 │
│  ┌────────────────────────────────────┐  │
│  │ ✅ 在售                            ▼│  │
│  └────────────────────────────────────┘  │
│                                          │
│  商品图片                                 │
│  ┌────────────────────────────────────┐  │
│  │  [📤 点击上传] 或拖拽图片到这里      │  │
│  │  支持 JPG, PNG, GIF, WebP ≤ 5MB   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  已上传图片（0/10）                       │
│  ┌────┐ ┌────┐ ┌────┐                   │  │
│  │🖼️  │ │🖼️  │ │➕  │                   │  │
│  │ ✖️ │ │ ✖️ │ │ 添加│                   │  │
│  └────┘ └────┘ └────┘                   │  │
│                                          │
│  或输入图片 URL（每行一个）                │
│  ┌────────────────────────────────────┐  │
│  │ https://...                        │  │
│  │ https://...                        │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│            [取消]  [保存]                 │
└──────────────────────────────────────────┘
```

### 图片上传组件设计

```
┌─────────────────────────────────────────┐
│  📤 点击上传图片 或拖拽图片到这里          │
│  支持 JPG, PNG, GIF, WebP 格式           │
│  单张图片不超过 5MB，最多 10 张           │
└─────────────────────────────────────────┘

上传中：
┌─────────────────────────────────────────┐
│  image.jpg                    75%       │
│  ████████████████░░░░░░░                │
└─────────────────────────────────────────┘

上传成功（缩略图网格）：
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ 🖼️   │ │ 🖼️   │ │ 🖼️   │ │ ➕   │
│  ✖️  │ │  ✖️  │ │  ✖️  │ │ 添加 │
└──────┘ └──────┘ └──────┘ └──────┘
主图标记：第一张图左上角显示"主"字标记
```

### 响应式设计

| 断点 | 布局调整 |
|------|---------|
| ≥ 1200px | 完整表格布局，统计卡片 4 列 |
| 992px - 1199px | 统计卡片 2 行 2 列，表格横向滚动 |
| 768px - 991px | 统计卡片 1 行 4 列（缩小），表格卡片式布局 |
| ≤ 767px | 统计卡片 1 列，表格改为纵向卡片，模态框全屏 |

---

## 图片上传实现细节

### 前端实现

```typescript
// ImageUploader.tsx 核心逻辑
import { useState, useCallback } from 'react'
import { uploadApi } from '../services/upload'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number  // 默认 10
  maxSize?: number    // 默认 5MB
}

export default function ImageUploader({ images, onChange, maxImages = 10, maxSize = 5 * 1024 * 1024 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  // 验证文件
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('只支持 JPG, PNG, GIF, WebP 格式')
      return false
    }
    if (file.size > maxSize) {
      alert(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`)
      return false
    }
    if (images.length >= maxImages) {
      alert(`最多只能上传 ${maxImages} 张图片`)
      return false
    }
    return true
  }

  // 上传文件
  const handleUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) return

    setUploading(true)
    setProgress(0)

    try {
      const result = await uploadApi.uploadProductImage(file, (percent) => {
        setProgress(percent)
      })

      onChange([...images, result.url])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [images, onChange])

  // 拖拽处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(handleUpload)
  }, [handleUpload])

  // 删除图片
  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  // 设置主图
  const handleSetMain = (index: number) => {
    if (index === 0) return
    const newImages = [images[index], ...images.filter((_, i) => i !== index)]
    onChange(newImages)
  }

  return (
    <div className={styles.container}>
      {/* 拖拽上传区域 */}
      <div
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInput.click()}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={(e) => handleUpload(e.target.files![0])}
          style={{ display: 'none' }}
        />
        <div className={styles.dropzoneContent}>
          <span>📤 点击上传</span>
          <span>或拖拽图片到这里</span>
        </div>
      </div>

      {/* 上传进度 */}
      {uploading && (
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* 图片预览网格 */}
      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((url, index) => (
            <div key={index} className={styles.previewItem}>
              <img src={url} alt={`Preview ${index + 1}`} />
              {index === 0 && <span className={styles.mainBadge}>主</span>}
              <button onClick={() => handleRemove(index)} className={styles.removeBtn}>✖️</button>
              {index > 0 && (
                <button onClick={() => handleSetMain(index)} className={styles.setMainBtn}>设为主图</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 后端实现

```typescript
// middleware/upload.ts
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/products')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

// 文件过滤
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    cb(null, true)
  } else {
    cb(new Error('只支持 JPG, PNG, GIF, WebP 格式'))
  }
}

// Multer 配置
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
})

// routes/product.routes.ts 扩展
import { upload } from '../middleware/upload'

router.post('/upload/products', 
  upload.single('image'),
  handleUploadProductImage
)

// controllers/product.controller.ts 扩展
export const handleUploadProductImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: '请选择要上传的图片' }
      })
    }

    const imageUrl = `/uploads/products/${req.file.filename}`

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: '图片上传失败' }
    })
  }
}

// server.ts 配置静态文件服务
import path from 'path'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
```

---

## 路由配置

```typescript
// router/index.tsx 扩展
import { lazy } from 'react'

const ProductManagement = lazy(() => import('../pages/Admin/ProductManagement'))

// 路由定义
<Route path="/admin/products" element={<ProductManagement />} />
```

**注意**：
- 不在 Navbar 中显示入口链接
- 用户需手动输入 URL 访问
- 后续可添加简单密码保护（如环境变量配置）

---

## 前端 API 服务扩展

```typescript
// services/upload.ts
import apiClient from './http'
import { API_ENDPOINTS } from '../config/api'

export interface UploadResponse {
  success: boolean
  data: {
    url: string
    filename: string
    size: number
  }
  error?: {
    code: string
    message: string
  }
}

export const uploadApi = {
  /**
   * 上传商品图片
   */
  async uploadProductImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse['data']> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post<UploadResponse>(
      API_ENDPOINTS.UPLOAD_PRODUCT,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            const percent = Math.round((event.loaded * 100) / event.total)
            onProgress(percent)
          }
        }
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || '上传失败')
    }

    return response.data.data
  }
}

// config/api.ts 扩展
export const API_ENDPOINTS = {
  // 现有...
  UPLOAD_PRODUCT: '/api/v1/upload/products'
}
```

---

## 测试要点

### 功能测试

| 测试项 | 测试步骤 | 预期结果 |
|--------|---------|---------|
| 商品列表加载 | 访问 /admin/products | 显示所有商品表格 |
| 统计卡片 | 查看顶部统计 | 数字正确，颜色区分 |
| 关键词搜索 | 输入"iPhone" | 只显示匹配商品 |
| 状态筛选 | 选择"在售" | 只显示在售商品 |
| 状态切换 | 点击"下架"按钮 | 二次确认 → 状态变为下架 |
| 新增商品 | 点击"新增商品" → 填写表单 → 保存 | 新商品出现在列表 |
| 编辑商品 | 点击"编辑" → 修改 → 保存 | 商品信息更新 |
| 删除商品 | 点击"删除" → 确认 | 商品从列表移除 |
| 图片上传 - 文件 | 选择本地图片文件 | 上传成功，显示预览 |
| 图片上传 - 拖拽 | 拖拽图片到上传区域 | 上传成功，显示预览 |
| 图片上传 - URL | 输入图片 URL | URL 添加到图片列表 |
| 图片验证 - 格式 | 上传 PDF 文件 | 提示"只支持图片格式" |
| 图片验证 - 大小 | 上传 10MB 图片 | 提示"文件超过 5MB" |
| 图片验证 - 数量 | 上传 11 张图片 | 提示"最多 10 张" |
| 设置主图 | 点击非第一张图的"设为主图" | 该图移到第一位 |
| 删除图片 | 点击图片的删除按钮 | 图片从列表移除 |
| 上传进度 | 上传大文件 | 显示进度条动画 |
| 表单验证 | 不填名称/价格直接保存 | 提示必填字段 |
| 响应式 | 在手机端访问 | 布局自适应，功能正常 |

### 边界测试

- 商品名称为空
- 价格为负数或 0
- 删除不存在的商品
- 上传同名图片
- 网络中断时上传
- 并发上传多张图片

### 性能测试

- 100 个商品加载速度
- 图片上传响应时间
- 快速连续点击状态切换
- 大量图片预览渲染

---

## 后续扩展规划

### 阶段 1（当前）
- ✅ 基础 CRUD 功能
- ✅ 图片上传（本地 + URL）
- ✅ 状态管理
- ✅ 隐藏路由访问

### 阶段 2（后续）
- 简单密码保护（环境变量配置密码）
- 批量操作（批量上下架、批量删除）
- 图片压缩（前端压缩后上传）
- 拖拽排序优化

### 阶段 3（未来）
- JWT 认证系统
- 角色权限管理（管理员/编辑/查看）
- 操作日志记录
- 数据导入/导出（CSV/Excel）
- 图片 CDN 集成
- 富文本编辑器（商品详情）

---

**文档版本**: v1.0  
**创建日期**: 2026-05-30  
**维护者**: Eric  
**状态**: 📝 待审核
