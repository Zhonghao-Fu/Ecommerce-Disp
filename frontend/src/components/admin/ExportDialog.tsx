import { useState } from 'react'
import { EXPORT_FIELDS } from '../../config/export-fields'
import styles from './ExportDialog.module.css'

interface ExportDialogProps {
  visible: boolean
  totalProducts: number
  filteredCount: number
  onClose: () => void
  onExport: (fields: string[], scope: 'filtered' | 'all') => Promise<void>
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
  const [exporting, setExporting] = useState(false)

  const handleFieldToggle = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, key])
    } else {
      setSelectedFields(selectedFields.filter(f => f !== key))
    }
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      alert('请至少选择一个字段')
      return
    }

    setExporting(true)
    try {
      await onExport(selectedFields, scope)
      onClose()
    } catch (error: any) {
      alert(error.message || '导出失败')
    } finally {
      setExporting(false)
    }
  }

  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>导出商品数据</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* Field Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>选择导出字段</h3>
            <div className={styles.fieldList}>
              {EXPORT_FIELDS.map(field => (
                <label key={field.key} className={styles.fieldItem}>
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={(e) => handleFieldToggle(field.key, e.target.checked)}
                  />
                  <span className={styles.fieldLabel}>
                    {field.label}
                    {field.required && <span className={styles.required}>*</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Scope Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>导出范围</h3>
            <div className={styles.scopeSelector}>
              <label className={styles.scopeOption}>
                <input
                  type="radio"
                  checked={scope === 'filtered'}
                  onChange={() => setScope('filtered')}
                />
                <span>当前筛选结果 ({filteredCount}条)</span>
              </label>
              <label className={styles.scopeOption}>
                <input
                  type="radio"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                />
                <span>全部商品 ({totalProducts}条)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={exporting}>
            取消
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? '导出中...' : '确认导出'}
          </button>
        </div>
      </div>
    </div>
  )
}
