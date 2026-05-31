# 模块规格说明书 24 - 货币转换模块

> 实时货币转换功能，支持商品价格在不同货币之间转换显示

## 📋 模块概述

### 功能描述
为国际化购物体验提供实时货币转换功能。所有商品以人民币(CNY)为基准价格存储，根据用户选择的货币显示转换后的价格。

### 核心特性
- ✅ 4种货币支持（CNY, USD, EUR, HKD）
- ✅ 实时汇率获取（ExchangeRate-API）
- ✅ 4小时缓存策略
- ✅ 降级备用汇率
- ✅ 货币偏好持久化
- ✅ 浏览器语言自动映射
- ✅ 全局货币选择器

### 技术栈
- **后端**: node-fetch, Express, Memory Cache
- **前端**: React Context, axios, localStorage
- **API**: ExchangeRate-API (免费版: 1500次/月)

---

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────┐
│           User Browser                      │
│  ┌────────────────────────────────────┐    │
│  │  CurrencySelector Component        │    │
│  │  - Dropdown: CNY/USD/EUR/HKD       │    │
│  └────────────┬───────────────────────┘    │
│               │                             │
│  ┌────────────▼───────────────────────┐    │
│  │  CurrencyContext                   │    │
│  │  - State: currency, rates          │    │
│  │  - Methods: convert, formatPrice   │    │
│  │  - localStorage persistence        │    │
│  └────────────┬───────────────────────┘    │
│               │                             │
│               │ GET /api/v1/currency/rates  │
└───────────────┼─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│           Backend Server                    │
│  ┌────────────────────────────────────┐    │
│  │  Currency Routes                   │    │
│  │  - GET /currency/rates             │    │
│  │  - POST /currency/convert          │    │
│  └────────────┬───────────────────────┘    │
│               │                             │
│  ┌────────────▼───────────────────────┐    │
│  │  ExchangeRateService               │    │
│  │  - 4-hour memory cache             │    │
│  │  - API fetch (ExchangeRate-API)    │    │
│  │  - Fallback rates (hardcoded)      │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                │
                │ HTTPS
┌───────────────▼─────────────────────────────┐
│        ExchangeRate-API (External)          │
│  - Free tier: 1500 req/month                │
│  - Updates: Hourly                          │
│  - Currencies: 160+                         │
└─────────────────────────────────────────────┘
```

---

## 💰 货币配置

### 支持的货币

| 货币代码 | 货币名称 | 符号 | 国旗 | 默认语言映射 |
|---------|---------|------|------|------------|
| CNY | Chinese Yuan | ¥ | 🇨🇳 | zh (中文) |
| USD | US Dollar | $ | 🇺🇸 | en (English) |
| EUR | Euro | € | 🇪🇺 | fr (Français) |
| HKD | Hong Kong Dollar | HK$ | 🇭🇰 | en-HK, zh-HK |

### 语言到货币映射

```typescript
function mapLanguageToCurrency(language: string): Currency {
  const lang = language.toLowerCase()
  
  if (lang.startsWith('zh')) return 'CNY'
  if (lang.startsWith('fr')) return 'EUR'
  if (lang.includes('hk')) return 'HKD'
  if (lang.startsWith('en')) return 'USD'
  
  return 'CNY' // Default
}
```

---

## 🔧 后端实现

### 1. ExchangeRateService

**文件**: `backend/src/services/exchange-rate.service.ts`

#### 核心功能

```typescript
class ExchangeRateService {
  private cache: Map<string, CacheEntry> = new Map()
  private CACHE_TTL = 4 * 60 * 60 * 1000 // 4 hours
  
  // Fallback rates (CNY base)
  private FALLBACK_RATES = {
    CNY: { CNY: 1, USD: 0.138, EUR: 0.127, HKD: 1.079 },
    USD: { CNY: 7.25, USD: 1, EUR: 0.92, HKD: 7.82 },
    EUR: { CNY: 7.88, USD: 1.09, EUR: 1, HKD: 8.50 },
    HKD: { CNY: 0.927, USD: 0.128, EUR: 0.118, HKD: 1 }
  }
  
  async getRates(base: Currency) {
    // 1. Check cache
    const cached = this.cache.get(`rates_${base}`)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { rates: cached.rates, source: 'cache' }
    }
    
    // 2. Fetch from API
    try {
      const rates = await this.fetchFromApi(base)
      this.cache.set(`rates_${base}`, { rates, timestamp: Date.now() })
      return { rates, source: 'api' }
    } catch (error) {
      // 3. Use fallback
      return { rates: this.FALLBACK_RATES[base], source: 'fallback' }
    }
  }
  
  convert(amount, from, to, rates) {
    if (from === to) return amount
    return Math.round(amount * rates[to] * 100) / 100
  }
}
```

#### 缓存策略

- **缓存时间**: 4小时
- **缓存键**: `rates_{CURRENCY}`
- **缓存位置**: 内存（Map）
- **缓存失效**: 超时自动失效，重启清空

#### API集成

```typescript
private async fetchFromApi(base: Currency) {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`
    : `https://api.exchangerate-api.com/v4/latest/${base}`
  
  const response = await fetch(url, { timeout: 5000 })
  const data = await response.json()
  
  // Filter to supported currencies only
  return {
    CNY: data.conversion_rates.CNY,
    USD: data.conversion_rates.USD,
    EUR: data.conversion_rates.EUR,
    HKD: data.conversion_rates.HKD
  }
}
```

### 2. API路由

**文件**: `backend/src/routes/currency.routes.ts`

#### GET /api/v1/currency/rates

获取当前汇率

**请求参数**:
- `base` (query, optional): 基准货币，默认 'CNY'

**响应示例**:
```json
{
  "success": true,
  "data": {
    "base": "CNY",
    "rates": {
      "CNY": 1,
      "USD": 0.138,
      "EUR": 0.127,
      "HKD": 1.079
    },
    "updatedAt": "2026-05-30T10:00:00.000Z",
    "source": "api"
  }
}
```

#### POST /api/v1/currency/convert

转换金额

**请求体**:
```json
{
  "amount": 100,
  "from": "CNY",
  "to": "USD"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "amount": 100,
    "from": "CNY",
    "to": "USD",
    "convertedAmount": 13.80,
    "rate": 0.138,
    "updatedAt": "2026-05-30T10:00:00.000Z",
    "source": "api"
  }
}
```

---

## 🎨 前端实现

### 1. CurrencyContext

**文件**: `frontend/src/context/CurrencyContext.tsx`

#### 核心功能

```typescript
interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  rates: Record<string, number> | null
  loading: boolean
  convert: (amount: number) => number
  formatPrice: (amount: number) => string
  formatPriceRange: (min: number | null, max: number | null) => string
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('currency')
    return saved || detectCurrency()
  })
  
  const [rates, setRates] = useState(null)
  
  // Fetch rates on mount
  useEffect(() => {
    fetch('/api/v1/currency/rates?base=CNY')
      .then(res => res.json())
      .then(data => setRates(data.data.rates))
  }, [])
  
  const convert = useCallback((amount) => {
    if (!rates || currency === 'CNY') return amount
    return amount * rates[currency]
  }, [rates, currency])
  
  const formatPrice = useCallback((amount) => {
    const converted = convert(amount)
    const symbol = CURRENCY_SYMBOLS[currency]
    return `${symbol}${converted.toFixed(2)}`
  }, [convert, currency])
  
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}
```

#### 数据流

```
用户选择货币
    ↓
setCurrency(newCurrency)
    ↓
localStorage.setItem('currency', newCurrency)
    ↓
formatPrice(amount) 使用新货币
    ↓
convert(amount) → amount * rates[newCurrency]
    ↓
返回格式化价格 "$13.80"
```

### 2. CurrencySelector组件

**文件**: `frontend/src/components/CurrencySelector.tsx`

```typescript
export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  
  return (
    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
      <option value="CNY">🇨🇳 CNY</option>
      <option value="USD">🇺🇸 USD</option>
      <option value="EUR">🇪🇺 EUR</option>
      <option value="HKD">🇭🇰 HKD</option>
    </select>
  )
}
```

### 3. 组件集成

#### ProductCard

```typescript
export default function ProductCard({ product }) {
  const { formatPrice } = useCurrency()
  
  return (
    <div className={styles.price}>
      {formatPrice(product.price)}
    </div>
  )
}
```

#### ProductList

```typescript
export default function ProductList() {
  const { currency } = useCurrency()
  
  return (
    <div className={styles.resultsInfo}>
      <span>共 {total} 件商品</span>
      <span> (价格单位: {currency})</span>
    </div>
  )
}
```

#### Admin页面（固定CNY）

```typescript
export default function ProductManagement() {
  return (
    <div>
      <h1>商品管理</h1>
      <span className={styles.currencyNote}>（所有价格以人民币显示）</span>
    </div>
  )
}
```

---

## 📁 文件结构

```
backend/src/
├── config/
│   └── currency.ts              # 货币配置和映射
├── services/
│   └── exchange-rate.service.ts # 汇率服务和缓存
└── routes/
    └── currency.routes.ts       # 货币API路由

frontend/src/
├── context/
│   └── CurrencyContext.tsx      # 货币状态管理
├── components/
│   ├── CurrencySelector.tsx     # 货币选择器
│   └── CurrencySelector.module.css
└── config/
    └── api.ts                   # API端点配置（新增）
```

---

## 🔄 工作流程

### 首次加载流程

```
1. 用户打开应用
    ↓
2. CurrencyProvider初始化
    ↓
3. 从localStorage读取货币偏好
   - 如果没有，检测浏览器语言
   - zh → CNY, en → USD, fr → EUR
    ↓
4. 调用 GET /api/v1/currency/rates?base=CNY
    ↓
5. 后端ExchangeRateService处理
   - 检查缓存（4小时内有效）
   - 缓存未命中 → 调用ExchangeRate-API
   - API失败 → 使用备用汇率
    ↓
6. 前端保存汇率到state
    ↓
7. 所有价格组件使用formatPrice显示
```

### 货币切换流程

```
1. 用户选择新货币（如USD）
    ↓
2. CurrencySelector调用setCurrency('USD')
    ↓
3. CurrencyContext更新state
   - currency = 'USD'
   - localStorage.setItem('currency', 'USD')
    ↓
4. 所有使用useCurrency()的组件重新渲染
    ↓
5. ProductCard调用formatPrice(9999)
   - convert(9999) → 9999 * 0.138 = 1379.86
   - 返回 "$1379.86"
    ↓
6. UI即时更新，无需刷新页面
```

---

## 🛡️ 降级方案

### API失败处理

```typescript
try {
  const rates = await fetchFromApi(base)
  cache.set({ rates, timestamp: Date.now() })
} catch (error) {
  console.error('API failed, using fallback rates')
  return FALLBACK_RATES[base]
}
```

### 备用汇率表

| 基准货币 | CNY | USD | EUR | HKD |
|---------|-----|-----|-----|-----|
| **CNY** | 1 | 0.138 | 0.127 | 1.079 |
| **USD** | 7.25 | 1 | 0.92 | 7.82 |
| **EUR** | 7.88 | 1.09 | 1 | 8.50 |
| **HKD** | 0.927 | 0.128 | 0.118 | 1 |

**注意**: 备用汇率需要手动更新以保持准确性

---

## 🧪 测试场景

### 功能测试

1. **货币选择**
   - 选择USD → 所有价格显示为$
   - 选择EUR → 所有价格显示为€
   - 选择CNY → 所有价格显示为¥

2. **持久化**
   - 选择USD → 刷新页面 → 仍然是USD
   - 清除localStorage → 使用浏览器语言映射

3. **汇率获取**
   - 首次加载 → 从API获取
   - 4小时内刷新 → 使用缓存
   - API失败 → 使用备用汇率

4. **价格转换**
   - ¥9999 → $1379.86 (rate: 0.138)
   - ¥9999 → €1269.87 (rate: 0.127)
   - ¥9999 → HK$10789.22 (rate: 1.079)

### 边界测试

1. **无效货币代码** → 返回400错误
2. **负数金额** → 正常转换（允许退款场景）
3. **超大金额** → 正常转换（测试精度）
4. **网络断开** → 使用备用汇率
5. **API限流** → 使用缓存或备用汇率

---

## 📊 性能优化

### 1. 缓存策略

- **4小时TTL**: 平衡实时性和API调用次数
- **内存缓存**: 快速访问，无需数据库
- **按货币分离**: 每种货币独立缓存

### 2. API调用优化

- **启动时调用一次**: 获取所有支持的货币
- **不实时转换**: 前端本地计算，不调用后端
- **按需加载**: 只在需要时获取汇率

### 3. 前端优化

- **useCallback**: 避免不必要的重渲染
- **localStorage**: 避免重复检测语言
- **条件渲染**: 汇率未加载时显示加载状态

---

## 🔒 安全考虑

### 1. API密钥管理

```typescript
// .env文件
EXCHANGE_RATE_API_KEY=your_api_key_here

// 代码中使用
const apiKey = process.env.EXCHANGE_RATE_API_KEY
```

**注意**: API密钥仅用于付费版本，免费版无需密钥

### 2. 输入验证

- 验证货币代码是否在支持列表中
- 验证金额为有效数字
- 防止SQL注入（无数据库操作）

### 3. 错误处理

- API失败不暴露内部错误信息
- 使用通用错误消息
- 记录详细日志用于调试

---

## 📝 维护说明

### 更新备用汇率

当备用汇率需要更新时：

1. 从可靠来源获取最新汇率
2. 更新 `FALLBACK_RATES` 对象
3. 提交代码变更
4. 重启后端服务

### 监控API使用量

- ExchangeRate-API免费版: 1500次/月
- 4小时缓存 ≈ 180次调用/月/实例
- 可支持约8个后端实例

### 添加新货币

1. 在 `SUPPORTED_CURRENCIES` 中添加
2. 在 `CURRENCY_SYMBOLS` 中添加符号
3. 在 `FALLBACK_RATES` 中添加汇率
4. 更新前端 `CurrencyContext`
5. 更新翻译文件

---

## 🚀 部署检查清单

- [ ] 设置 `EXCHANGE_RATE_API_KEY` 环境变量（可选）
- [ ] 验证后端能访问ExchangeRate-API
- [ ] 测试4种货币的切换
- [ ] 验证localStorage持久化
- [ ] 测试API失败降级
- [ ] 确认管理页面固定显示CNY
- [ ] 检查移动端响应式布局
- [ ] 验证所有翻译键存在

---

## 📚 相关文档

- [ExchangeRate-API文档](https://www.exchangerate-api.com/docs)
- [react-intl文档](https://formatjs.io/docs/react-intl/)
- [模块23 - 多语言国际化](./23-i18n.md)
- [模块10 - 商品API](./10-product-api.md)

---

**版本**: 1.0.0  
**创建日期**: 2026-05-30  
**最后更新**: 2026-05-30  
**状态**: ✅ 已完成
