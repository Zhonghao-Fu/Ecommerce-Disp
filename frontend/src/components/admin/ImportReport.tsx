import type { ImportResult } from '../../types'
import styles from './ImportReport.module.css'

interface ImportReportProps {
  report: ImportResult
  onClose: () => void
  onReimport: () => void
}

export default function ImportReport({ report, onClose, onReimport }: ImportReportProps) {
  const hasErrors = report.errors.length > 0
  const successRate = ((report.success / report.total) * 100).toFixed(1)

  return (
    <div className={styles.report}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.icon}>
          {hasErrors ? '⚠️' : '✅'}
        </div>
        <h2 className={styles.title}>
          {hasErrors ? '导入完成（部分失败）' : '导入成功！'}
        </h2>
      </div>

      {/* Statistics */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>总行数</div>
          <div className={styles.statValue}>{report.total}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>成功</div>
          <div className={`${styles.statValue} ${styles.success}`}>{report.success}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>失败</div>
          <div className={`${styles.statValue} ${styles.failed}`}>{report.failed}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>跳过</div>
          <div className={`${styles.statValue} ${styles.skipped}`}>{report.skipped}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>成功率</div>
          <div className={styles.statValue}>{successRate}%</div>
        </div>
      </div>

      {/* Error Details */}
      {hasErrors && (
        <div className={styles.errors}>
          <h3 className={styles.errorsTitle}>❌ 错误详情</h3>
          <div className={styles.errorList}>
            {report.errors.map((error, index) => (
              <div key={index} className={styles.errorItem}>
                <div className={styles.errorRow}>
                  <span className={styles.rowLabel}>第{error.row}行</span>
                  <span className={styles.errorName}>
                    {error.name ? `商品: ${error.name}` : '商品: (空)'}
                  </span>
                </div>
                <div className={styles.errorMessage}>{error.error}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.footer}>
        <button className={styles.reimportBtn} onClick={onReimport}>
          重新导入
        </button>
        <button className={styles.closeBtn} onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  )
}
