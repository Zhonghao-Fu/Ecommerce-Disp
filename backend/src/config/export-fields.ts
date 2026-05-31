/**
 * Export/Import Field Configuration
 * 
 * This file defines the fields available for product export/import operations.
 * Adding new fields only requires adding a new entry to this array.
 */

export interface ExportFieldConfig {
  key: string              // Database field name
  label: string            // CSV header display name
  required: boolean        // Required for import validation
  exportByDefault: boolean // Included in export by default
  transform?: (value: any) => string  // Optional value transformation function
}

/**
 * Field configuration array
 * Order determines the column order in CSV
 */
export const EXPORT_FIELDS: ExportFieldConfig[] = [
  {
    key: 'id',
    label: '商品ID',
    required: false,
    exportByDefault: false,
    // No transform needed - UUID string
  },
  {
    key: 'name',
    label: '商品名称',
    required: true,
    exportByDefault: true,
  },
  {
    key: 'description',
    label: '商品描述',
    required: false,
    exportByDefault: true,
  },
  {
    key: 'price',
    label: '价格(元)',
    required: true,
    exportByDefault: true,
    // Transform: cents (DB) -> yuan (CSV)
    transform: (value: number) => (value / 100).toFixed(2),
  },
  {
    key: 'status',
    label: '状态',
    required: true,
    exportByDefault: true,
  },
  {
    key: 'images',
    label: '图片URL',
    required: false,
    exportByDefault: false,
    // Transform: array -> semicolon-separated string
    transform: (value: string[]) => {
      if (Array.isArray(value)) {
        return value.join(';')
      }
      return value || ''
    },
  },
  {
    key: 'createdAt',
    label: '创建时间',
    required: false,
    exportByDefault: true,
    // Transform: Date -> formatted string
    transform: (value: Date) => {
      if (!value) return ''
      const date = new Date(value)
      return date.toISOString().replace('T', ' ').substring(0, 19)
    },
  },
  {
    key: 'updatedAt',
    label: '更新时间',
    required: false,
    exportByDefault: true,
    // Transform: Date -> formatted string
    transform: (value: Date) => {
      if (!value) return ''
      const date = new Date(value)
      return date.toISOString().replace('T', ' ').substring(0, 19)
    },
  },
]

/**
 * Get field configuration by key
 */
export function getFieldByKey(key: string): ExportFieldConfig | undefined {
  return EXPORT_FIELDS.find(field => field.key === key)
}

/**
 * Get all field keys
 */
export function getFieldKeys(): string[] {
  return EXPORT_FIELDS.map(field => field.key)
}

/**
 * Get default export fields
 */
export function getDefaultExportFields(): string[] {
  return EXPORT_FIELDS
    .filter(field => field.exportByDefault)
    .map(field => field.key)
}
