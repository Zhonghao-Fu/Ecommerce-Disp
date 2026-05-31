import { useState, useCallback, useRef } from 'react'
import type { ImportResult } from '../../types'
import ImportReport from './ImportReport'
import styles from './ImportDialog.module.css'

interface ImportDialogProps {
  visible: boolean
  onClose: () => void
  onImport: (file: File, mode: 'hybrid' | 'insert-only' | 'update-only') => Promise<ImportResult>
  onDownloadTemplate: () => Promise<void>
}

export default function ImportDialog({
  visible,
  onClose,
  onImport,
  onDownloadTemplate
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<File | null>(null)  // Keep file reference stable
  const [mode, setMode] = useState<'hybrid' | 'insert-only' | 'update-only'>('hybrid')
  const [importing, setImporting] = useState(false)
  const [report, setReport] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      alert('请选择CSV文件')
      return
    }
    setFile(selectedFile)
    fileRef.current = selectedFile  // Keep stable reference
    setReport(null)  // Clear previous report
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleImport = async () => {
    const currentFile = fileRef.current
    if (!currentFile) {
      alert('请选择文件')
      return
    }

    setImporting(true)
    try {
      const result = await onImport(currentFile, mode)
      setReport(result)
    } catch (error: any) {
      alert(error.message || '导入失败')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    fileRef.current = null
    setReport(null)
    setMode('hybrid')
    onClose()
  }

  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>导入商品数据</h2>
          <button className={styles.closeBtn} onClick={handleClose}>×</button>
        </div>

        {!report ? (
          <>
            <div className={styles.content}>
              {/* Template Download */}
              <div className={styles.section}>
                <button
                  className={styles.templateBtn}
                  onClick={onDownloadTemplate}
                >
                  ⬇️ 下载导入模板
                </button>
              </div>

              {/* File Upload */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>选择CSV文件</h3>
                <div
                  className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0]
                      if (selectedFile) {
                        handleFileSelect(selectedFile)
                      }
                    }}
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className={styles.dropZoneContent}>
                    <div className={styles.uploadIcon}>📄</div>
                    <p>拖拽CSV文件到此处，或点击选择</p>
                    <p className={styles.hint}>支持 .csv 格式，最大 10MB</p>
                  </label>
                  {file && (
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>✅ {file.name}</span>
                      <span className={styles.fileSize}>
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Import Mode */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>导入模式</h3>
                <div className={styles.modeSelector}>
                  <label className={styles.modeOption}>
                    <input
                      type="radio"
                      checked={mode === 'hybrid'}
                      onChange={() => setMode('hybrid')}
                    />
                    <div>
                      <div className={styles.modeTitle}>混合模式（推荐）</div>
                      <div className={styles.modeDesc}>存在则更新，不存在则新增</div>
                    </div>
                  </label>
                  <label className={styles.modeOption}>
                    <input
                      type="radio"
                      checked={mode === 'insert-only'}
                      onChange={() => setMode('insert-only')}
                    />
                    <div>
                      <div className={styles.modeTitle}>仅新增</div>
                      <div className={styles.modeDesc}>只导入新商品，跳过已存在的</div>
                    </div>
                  </label>
                  <label className={styles.modeOption}>
                    <input
                      type="radio"
                      checked={mode === 'update-only'}
                      onChange={() => setMode('update-only')}
                    />
                    <div>
                      <div className={styles.modeTitle}>仅更新</div>
                      <div className={styles.modeDesc}>只更新已有商品，跳过不存在的</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.footer}>
              <button className={styles.cancelBtn} onClick={handleClose} disabled={importing}>
                取消
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleImport}
                disabled={!file || importing}
              >
                {importing ? '导入中...' : '开始导入'}
              </button>
            </div>
          </>
        ) : (
          /* Import Report */
          <ImportReport report={report} onClose={handleClose} onReimport={() => setReport(null)} />
        )}
      </div>
    </div>
  )
}
