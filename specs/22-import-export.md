# 商品导入/导出模块

> 商品管理系统的数据导入/导出功能，支持CSV格式的批量操作

## 📋 模块概述

### 功能定位
为商品管理后台提供批量数据导入/导出能力，支持：
- 批量导出商品数据（CSV格式）
- 批量导入商品数据（CSV格式）
- 下载标准导入模板
- 智能混合模式（存在则更新，不存在则新增）

### 设计原则
- **字段可配置**：导出字段通过配置文件管理，易于扩展
- **用户友好**：提供可视化字段选择、导入预览、错误报告
- **数据安全**：导入前验证、事务处理、错误回滚
- **性能优化**：流式处理、分批导入、进度提示
- **向后兼容**：CSV格式通用，支持后续版本升级

---

## 🎯 功能需求

### 1. 导出功能

#### 1.1 导出范围
- ✅ 导出当前筛选结果（支持关键词、价格、状态筛选）
- ✅ 导出全部商品（忽略筛选条件）
- ✅ 数量限制提示（超过5000行时提示分页导出）

#### 1.2 字段配置

**配置文件结构**：
```typescript
export interface ExportFieldConfig {
  key: string           // 字段键名（对应数据库字段）
  label: string         // CSV表头显示名称
  required: boolean     // 是否为必填字段（导入时）
  exportByDefault: boolean  // 是否默认导出
  transform?: (value: any) => string  // 可选的值转换函数
}
```

**默认字段配置**：

| 字段 | 标签 | 必填 | 默认导出 | 说明 | 转换规则 |
|------|------|------|---------|------|---------|
| `id` | 商品ID | ❌ | ❌ | UUID标识 | 无 |
| `name` | 商品名称 | ✅ | ✅ | 商品名称 | 无 |
| `description` | 商品描述 | ❌ | ✅ | 商品描述 | 无 |
| `price` | 价格(元) | ✅ | ✅ | 显示价格（元） | 分转元：`price / 100` |
| `status` | 状态 | ✅ | ✅ | 商品状态 | 无 |
| `images` | 图片URL | ❌ | ❌ | 图片链接 | 数组转字符串：`url1;url2` |
| `createdAt` | 创建时间 | ❌ | ✅ | 创建时间戳 | 格式化：`YYYY-MM-DD HH:mm:ss` |
| `updatedAt` | 更新时间 | ❌ | ✅ | 更新时间戳 | 格式化：`YYYY-MM-DD HH:mm:ss` |

**扩展方式**：
新增字段只需在配置数组中添加一项，无需修改核心逻辑。

#### 1.3 导出流程

```
用户点击"导出" 
  → 弹出ExportDialog对话框
  → 选择导出字段（勾选/取消）
  → 选择导出范围（当前筛选/全部商品）
  → 确认导出
  → 后端生成CSV文件
  → 浏览器下载文件（UTF-8编码）
```

#### 1.4 UI设计

**导出对话框**：
```
┌─────────────────────────────────────────────┐
│  导出商品数据                              × │
├─────────────────────────────────────────────┤
│                                             │
│  选择导出字段：                              │
│  ☑ 商品名称 *                               │
│  ☑ 商品描述                                 │
│  ☑ 价格(元) *                               │
│  ☑ 状态 *                                   │
│  ☐ 商品ID                                   │
│  ☐ 图片URL                                  │
│  ☑ 创建时间                                 │
│  ☑ 更新时间                                 │
│                                             │
│  导出范围：                                  │
│  ○ 当前筛选结果 (123条)                      │
│  ○ 全部商品 (456条)                          │
│                                             │
├─────────────────────────────────────────────┤
│                    [取消]  [确认导出]         │
└─────────────────────────────────────────────┘
```

---

### 2. 导入功能

#### 2.1 导入模式

| 模式 | 说明 | 行为 |
|------|------|------|
| **混合模式**（推荐） | 智能处理 | 根据ID判断：存在则更新，不存在则新增 |
| **仅新增** | 只导入新商品 | ID已存在则跳过 |
| **仅更新** | 只更新已有商品 | ID不存在则跳过 |

#### 2.2 数据验证

**必填字段验证**：
- ✅ `name`（商品名称）- 不能为空
- ✅ `price`（价格）- 必须 > 0

**格式验证**：
- ✅ `status` - 必须是 `on_sale` 或 `off_sale`
- ✅ `images` - 多个URL用分号 `;` 分隔
- ✅ 日期格式 - `YYYY-MM-DD HH:mm:ss`

**限制**：
- ✅ 文件大小：最大 10MB
- ✅ 行数限制：最多 5000 行
- ✅ 文件编码：UTF-8

#### 2.3 导入流程

```
用户点击"导入"
  → 弹出ImportDialog对话框
  → 选择CSV文件（拖拽或点击上传）
  → 选择导入模式（混合/仅新增/仅更新）
  → 前端预验证（文件格式、行数）
  → 显示预览（前5行数据）
  → 确认导入
  → 上传到后端
  → 后端验证 + 分批处理
  → 显示导入报告（成功/失败/跳过）
  → 刷新商品列表
```

#### 2.4 导入报告

**报告格式**：
```json
{
  "total": 100,
  "success": 95,
  "failed": 3,
  "skipped": 2,
  "errors": [
    {
      "row": 15,
      "name": "商品A",
      "error": "价格必须大于0"
    },
    {
      "row": 28,
      "name": "",
      "error": "商品名称不能为空"
    }
  ]
}
```

**UI展示**：
```
┌─────────────────────────────────────────────┐
│  导入报告                                   × │
├─────────────────────────────────────────────┤
│                                             │
│  ✅ 导入完成！                               │
│                                             │
│  📊 统计信息：                               │
│  总行数：100                                 │
│  ✅ 成功：95                                 │
│  ❌ 失败：3                                  │
│  ⏭️ 跳过：2                                  │
│                                             │
│  ❌ 错误详情：                               │
│  ┌─────────────────────────────────────┐   │
│  │ 第15行 | 商品A | 价格必须大于0       │   │
│  │ 第28行 | (空)   | 商品名称不能为空   │   │
│  │ 第42行 | 商品B | 状态值无效         │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                    [关闭]  [重新导入]         │
└─────────────────────────────────────────────┘
```

---

### 3. 模板下载

#### 3.1 模板内容

**标准导入模板**（包含示例数据）：
```csv
商品名称*,商品描述,价格(元)*,状态,图片URL
iPhone 15 Pro Max,Apple最新旗舰手机,9999.00,on_sale,https://img1.jpg;https://img2.jpg
AirPods Pro 2,主动降噪耳机,1999.00,on_sale,
```

**说明**：
- `*` 表示必填字段（CSV注释，实际解析时忽略）
- 第二行为示例数据，帮助用户理解格式
- UTF-8编码，支持中文

#### 3.2 下载流程

```
用户点击"下载模板"
  → 后端生成标准CSV模板
  → 浏览器下载文件（import_template.csv）
```

---

## 🔌 API接口设计

### 1. 导出商品

**接口**：`POST /api/v1/products/export`

**请求体**：
```json
{
  "fields": ["name", "description", "price", "status", "createdAt", "updatedAt"],
  "scope": "filtered",
  "filters": {
    "keyword": "iPhone",
    "minPrice": 1000,
    "maxPrice": 10000,
    "status": "on_sale",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

**参数说明**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fields` | string[] | ✅ | 导出字段列表 |
| `scope` | string | ✅ | 导出范围：`filtered` / `all` |
| `filters` | object | ❌ | 筛选条件（scope=filtered时生效） |

**响应**：
```
Content-Type: text/csv
Content-Disposition: attachment; filename="products_export_20260530.csv"

商品名称,商品描述,价格(元),状态,创建时间,更新时间
iPhone 15 Pro Max,Apple最新旗舰手机,9999.00,on_sale,2026-05-30 10:30:00,2026-05-30 15:20:00
```

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "EXPORT_FAILED",
    "message": "导出失败，请重试"
  }
}
```

---

### 2. 导入商品

**接口**：`POST /api/v1/products/import`

**请求**：
```
Content-Type: multipart/form-data

file: <CSV文件>
mode: "hybrid"  // hybrid / insert-only / update-only
```

**参数说明**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | ✅ | CSV文件（UTF-8编码） |
| `mode` | string | ✅ | 导入模式：`hybrid` / `insert-only` / `update-only` |

**响应**：
```json
{
  "success": true,
  "data": {
    "total": 100,
    "success": 95,
    "failed": 3,
    "skipped": 2,
    "errors": [
      {
        "row": 15,
        "name": "商品A",
        "error": "价格必须大于0"
      }
    ]
  }
}
```

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "文件格式错误，请上传CSV文件"
  }
}
```

---

### 3. 下载模板

**接口**：`GET /api/v1/products/template`

**响应**：
```
Content-Type: text/csv
Content-Disposition: attachment; filename="import_template.csv"

商品名称*,商品描述,价格(元)*,状态,图片URL
iPhone 15 Pro Max,Apple最新旗舰手机,9999.00,on_sale,https://img1.jpg;https://img2.jpg
AirPods Pro 2,主动降噪耳机,1999.00,on_sale,
```

---

## 💻 技术实现

### 1. 后端实现

#### 1.1 依赖库

```json
{
  "dependencies": {
    "csv-stringify": "^6.4.0",
    "csv-parser": "^3.0.0"
  }
}
```

#### 1.2 核心逻辑

**导出服务** (`backend/src/services/export.service.ts`)：

```typescript
import { stringify } from 'csv-stringify/sync'
import { EXPORT_FIELDS } from '../config/export-fields'

export class ExportService {
  /**
   * 导出商品数据为CSV
   */
  async exportProducts(fields: string[], scope: string, filters: any) {
    // 1. 查询商品数据（复用getProducts逻辑）
    const products = await this.fetchProducts(scope, filters)
    
    // 2. 过滤字段
    const selectedFields = EXPORT_FIELDS.filter(f => fields.includes(f.key))
    
    // 3. 转换数据
    const csvData = products.map(product => {
      const row: any = {}
      selectedFields.forEach(field => {
        let value = product[field.key]
        // 应用转换函数
        if (field.transform) {
          value = field.transform(value)
        }
        row[field.label] = value
      })
      return row
    })
    
    // 4. 生成CSV
    const csv = stringify(csvData, {
      header: true,
      bom: true,  // UTF-8 BOM，Excel友好
      quoted: true
    })
    
    return csv
  }
}
```

**导入服务** (`backend/src/services/import.service.ts`)：

```typescript
import csvParser from 'csv-parser'
import { EXPORT_FIELDS } from '../config/export-fields'

export class ImportService {
  /**
   * 导入CSV文件
   */
  async importProducts(file: Express.Multer.File, mode: string) {
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }
    
    // 1. 解析CSV
    const rows = await this.parseCSV(file)
    results.total = rows.length
    
    // 2. 验证行数限制
    if (results.total > 5000) {
      throw new Error('单次导入最多支持5000行')
    }
    
    // 3. 分批处理（每批100条）
    const batchSize = 100
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      
      // 使用事务确保数据一致性
      await prisma.$transaction(async (tx) => {
        for (const row of batch) {
          try {
            await this.processRow(row, mode, tx, results)
          } catch (error) {
            results.failed++
            results.errors.push({
              row: i + batch.indexOf(row) + 2,  // +2 because header + 1-based
              name: row['商品名称'] || '',
              error: error.message
            })
          }
        }
      })
    }
    
    return results
  }
  
  /**
   * 处理单行数据
   */
  private async processRow(row: any, mode: string, tx: any, results: any) {
    // 1. 验证必填字段
    if (!row['商品名称']) {
      throw new Error('商品名称不能为空')
    }
    if (!row['价格(元)'] || parseFloat(row['价格(元)']) <= 0) {
      throw new Error('价格必须大于0')
    }
    
    // 2. 转换数据格式
    const productData = this.transformRowToProduct(row)
    
    // 3. 根据模式处理
    const existing = await tx.product.findUnique({
      where: { id: productData.id }
    })
    
    if (existing) {
      // 商品已存在
      if (mode === 'insert-only') {
        results.skipped++
        return
      }
      // 更新
      await tx.product.update({
        where: { id: productData.id },
        data: productData
      })
      results.success++
    } else {
      // 商品不存在
      if (mode === 'update-only') {
        results.skipped++
        return
      }
      // 新增
      await tx.product.create({
        data: productData
      })
      results.success++
    }
  }
}
```

#### 1.3 路由注册

```typescript
// backend/src/routes/product.routes.ts

import { ExportService } from '../services/export.service'
import { ImportService } from '../services/import.service'

const exportService = new ExportService()
const importService = new ImportService()

// 导出商品
router.post('/export', async (req, res) => {
  try {
    const { fields, scope, filters } = req.body
    
    const csv = await exportService.exportProducts(fields, scope, filters)
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="products_export_${Date.now()}.csv"`)
    res.send(csv)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_FAILED', message: '导出失败' }
    })
  }
})

// 导入商品
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: '请选择CSV文件' }
      })
    }
    
    const { mode } = req.body
    const result = await importService.importProducts(req.file, mode || 'hybrid')
    
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'IMPORT_FAILED', message: error.message }
    })
  }
})

// 下载模板
router.get('/template', (req, res) => {
  const template = `商品名称*,商品描述,价格(元)*,状态,图片URL
iPhone 15 Pro Max,Apple最新旗舰手机,9999.00,on_sale,https://img1.jpg;https://img2.jpg
AirPods Pro 2,主动降噪耳机,1999.00,on_sale,`

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="import_template.csv"')
  res.send(template)
})
```

---

### 2. 前端实现

#### 2.1 组件结构

```
frontend/src/components/admin/
├── ExportDialog.tsx          # 导出对话框
├── ExportDialog.module.css   # 导出对话框样式
├── ImportDialog.tsx          # 导入对话框
├── ImportDialog.module.css   # 导入对话框样式
└── ImportReport.tsx          # 导入报告展示
```

#### 2.2 字段配置

```typescript
// frontend/src/config/export-fields.ts

export interface ExportFieldConfig {
  key: string
  label: string
  required: boolean
  exportByDefault: boolean
  transform?: (value: any) => string
}

export const EXPORT_FIELDS: ExportFieldConfig[] = [
  { key: 'id', label: '商品ID', required: false, exportByDefault: false },
  { key: 'name', label: '商品名称', required: true, exportByDefault: true },
  { key: 'description', label: '商品描述', required: false, exportByDefault: true },
  { key: 'price', label: '价格(元)', required: true, exportByDefault: true },
  { key: 'status', label: '状态', required: true, exportByDefault: true },
  { key: 'images', label: '图片URL', required: false, exportByDefault: false },
  { key: 'createdAt', label: '创建时间', required: false, exportByDefault: true },
  { key: 'updatedAt', label: '更新时间', required: false, exportByDefault: true },
]
```

#### 2.3 ExportDialog组件

```typescript
// frontend/src/components/admin/ExportDialog.tsx

interface ExportDialogProps {
  visible: boolean
  totalProducts: number
  filteredCount: number
  onClose: () => void
  onExport: (fields: string[], scope: 'filtered' | 'all') => void
}

export default function ExportDialog({ 
  visible, 
  totalProducts, 
  filteredCount, 
  onClose, 
  onExport 
}: ExportDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter(f => f.exportByDefault).map(f => f.key)
  )
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered')
  
  const handleExport = () => {
    if (selectedFields.length === 0) {
      alert('请至少选择一个字段')
      return
    }
    onExport(selectedFields, scope)
  }
  
  return (
    <Modal visible={visible} onClose={onClose} title="导出商品数据">
      {/* 字段选择 */}
      <div className={styles.fieldList}>
        {EXPORT_FIELDS.map(field => (
          <label key={field.key} className={styles.fieldItem}>
            <input
              type="checkbox"
              checked={selectedFields.includes(field.key)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedFields([...selectedFields, field.key])
                } else {
                  setSelectedFields(selectedFields.filter(f => f !== field.key))
                }
              }}
            />
            {field.label} {field.required && <span className={styles.required}>*</span>}
          </label>
        ))}
      </div>
      
      {/* 导出范围 */}
      <div className={styles.scopeSelector}>
        <label>
          <input
            type="radio"
            checked={scope === 'filtered'}
            onChange={() => setScope('filtered')}
          />
          当前筛选结果 ({filteredCount}条)
        </label>
        <label>
          <input
            type="radio"
            checked={scope === 'all'}
            onChange={() => setScope('all')}
          />
          全部商品 ({totalProducts}条)
        </label>
      </div>
      
      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button onClick={onClose}>取消</button>
        <button onClick={handleExport} className={styles.primaryBtn}>
          确认导出
        </button>
      </div>
    </Modal>
  )
}
```

#### 2.4 ImportDialog组件

```typescript
// frontend/src/components/admin/ImportDialog.tsx

interface ImportDialogProps {
  visible: boolean
  onClose: () => void
  onImport: (file: File, mode: 'hybrid' | 'insert-only' | 'update-only') => Promise<void>
}

export default function ImportDialog({ visible, onClose, onImport }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'hybrid' | 'insert-only' | 'update-only'>('hybrid')
  const [uploading, setUploading] = useState(false)
  const [report, setReport] = useState<any>(null)
  
  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('请选择CSV文件')
      return
    }
    setFile(selectedFile)
  }
  
  const handleImport = async () => {
    if (!file) {
      alert('请选择文件')
      return
    }
    
    setUploading(true)
    try {
      const result = await onImport(file, mode)
      setReport(result)
    } catch (error) {
      alert('导入失败：' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <Modal visible={visible} onClose={onClose} title="导入商品数据">
      {!report ? (
        <>
          {/* 文件上传 */}
          <div 
            className={styles.dropZone}
            onDrop={(e) => {
              e.preventDefault()
              handleFileSelect(e.dataTransfer.files[0])
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e.target.files![0])}
            />
            <p>拖拽CSV文件到此处，或点击选择</p>
            {file && <p className={styles.fileName}>已选择: {file.name}</p>}
          </div>
          
          {/* 导入模式 */}
          <div className={styles.modeSelector}>
            <label>
              <input
                type="radio"
                checked={mode === 'hybrid'}
                onChange={() => setMode('hybrid')}
              />
              混合模式（推荐）
            </label>
            <label>
              <input
                type="radio"
                checked={mode === 'insert-only'}
                onChange={() => setMode('insert-only')}
              />
              仅新增
            </label>
            <label>
              <input
                type="radio"
                checked={mode === 'update-only'}
                onChange={() => setMode('update-only')}
              />
              仅更新
            </label>
          </div>
          
          {/* 操作按钮 */}
          <div className={styles.actions}>
            <button onClick={onClose}>取消</button>
            <button 
              onClick={handleImport} 
              disabled={!file || uploading}
              className={styles.primaryBtn}
            >
              {uploading ? '导入中...' : '开始导入'}
            </button>
          </div>
        </>
      ) : (
        /* 导入报告 */
        <ImportReport report={report} onClose={onClose} />
      )}
    </Modal>
  )
}
```

---

## 🧪 测试要点

### 1. 导出功能测试

| 测试场景 | 预期结果 |
|---------|---------|
| 导出当前筛选结果 | CSV包含筛选后的商品 |
| 导出全部商品 | CSV包含所有商品 |
| 选择部分字段导出 | CSV只包含选中的字段 |
| 导出包含中文的商品 | UTF-8编码，中文正常显示 |
| 导出超过5000行 | 提示分批导出 |
| 价格字段转换 | 数据库分 → CSV元（除以100） |
| 图片URL转换 | 数组 → 分号分隔字符串 |

### 2. 导入功能测试

| 测试场景 | 预期结果 |
|---------|---------|
| 导入标准CSV | 成功导入，显示报告 |
| 导入缺少必填字段 | 失败，显示错误详情 |
| 导入价格≤0的商品 | 失败，显示验证错误 |
| 导入状态值无效 | 失败，显示验证错误 |
| 混合模式（存在+不存在） | 存在则更新，不存在则新增 |
| 仅新增模式（ID已存在） | 跳过已存在的商品 |
| 仅更新模式（ID不存在） | 跳过不存在的商品 |
| 导入超过5000行 | 拒绝导入，提示限制 |
| 导入非CSV文件 | 拒绝导入，提示格式错误 |
| 导入包含中文的CSV | 正常解析，中文不乱码 |
| 大批量导入（1000行） | 分批处理，显示进度 |
| 导入中断（网络错误） | 事务回滚，数据不损坏 |

### 3. 模板下载测试

| 测试场景 | 预期结果 |
|---------|---------|
| 点击下载模板 | 下载import_template.csv |
| 打开模板文件 | 包含表头和示例数据 |
| 使用Excel打开 | 中文正常显示（BOM） |

---

## 📦 交付物清单

### 后端文件
- [ ] `backend/src/config/export-fields.ts` - 字段配置
- [ ] `backend/src/services/export.service.ts` - 导出服务
- [ ] `backend/src/services/import.service.ts` - 导入服务
- [ ] `backend/src/routes/product.routes.ts` - 新增3个路由
- [ ] `backend/package.json` - 新增依赖（csv-stringify, csv-parser）

### 前端文件
- [ ] `frontend/src/config/export-fields.ts` - 字段配置
- [ ] `frontend/src/services/importExport.ts` - 导入导出API服务
- [ ] `frontend/src/components/admin/ExportDialog.tsx` - 导出对话框
- [ ] `frontend/src/components/admin/ExportDialog.module.css` - 导出对话框样式
- [ ] `frontend/src/components/admin/ImportDialog.tsx` - 导入对话框
- [ ] `frontend/src/components/admin/ImportDialog.module.css` - 导入对话框样式
- [ ] `frontend/src/components/admin/ImportReport.tsx` - 导入报告
- [ ] `frontend/src/components/admin/ImportReport.module.css` - 导入报告样式
- [ ] `frontend/src/pages/Admin/ProductManagement.tsx` - 集成导入导出按钮

---

## 🔮 后续优化方向

1. **支持Excel格式** - 使用 `exceljs` 库支持 `.xlsx` 格式
2. **异步导出** - 大批量导出时生成任务，完成后通知用户下载
3. **导入预览增强** - 显示完整预览表格，支持编辑后再导入
4. **导出进度条** - 大批量导出时显示进度
5. **导入历史记录** - 记录每次导入的时间、数量、操作人
6. **字段映射** - 支持自定义CSV表头到数据库字段的映射
7. **数据校验规则扩展** - 支持自定义校验规则配置

---

**文档状态**: 🔨 开发中  
**创建时间**: 2026-05-30  
**最后更新**: 2026-05-30  
**维护者**: AI Assistant
