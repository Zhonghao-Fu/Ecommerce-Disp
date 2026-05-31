/**
 * Export/Import Field Configuration (Frontend)
 * 
 * Must match backend configuration in backend/src/config/export-fields.ts
 */

export interface ExportFieldConfig {
  key: string              // Database field name
  label: string            // CSV header display name
  required: boolean        // Required for import validation
  exportByDefault: boolean // Included in export by default
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
  },
  {
    key: 'createdAt',
    label: '创建时间',
    required: false,
    exportByDefault: true,
  },
  {
    key: 'updatedAt',
    label: '更新时间',
    required: false,
    exportByDefault: true,
  },
]

/**
 * Get default export fields
 */
export function getDefaultExportFields(): string[] {
  return EXPORT_FIELDS
    .filter(field => field.exportByDefault)
    .map(field => field.key)
}
