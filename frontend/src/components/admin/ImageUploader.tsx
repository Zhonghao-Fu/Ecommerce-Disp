/**
 * Image Uploader Component
 * Supports drag-and-drop and click-to-upload with preview
 */

import { useState, useRef, useCallback } from 'react'
import { uploadApi } from '../../services/upload'
import styles from './ImageUploader.module.css'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number  // Default 10
  maxSize?: number    // Default 5MB in bytes
}

export default function ImageUploader({ 
  images, 
  onChange, 
  maxImages = 10, 
  maxSize = 5 * 1024 * 1024 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return '只支持 JPG, PNG, GIF, WebP 格式'
    }
    if (file.size > maxSize) {
      return `文件大小不能超过 ${maxSize / 1024 / 1024}MB`
    }
    if (images.length >= maxImages) {
      return `最多只能上传 ${maxImages} 张图片`
    }
    return null
  }

  // Upload file
  const handleUpload = useCallback(async (file: File) => {
    const error = validateFile(file)
    if (error) {
      alert(error)
      return
    }

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
  }, [images, onChange, maxSize, maxImages])

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
      // Reset input value to allow re-uploading same file
      e.target.value = ''
    }
  }

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleUpload(files[0])
    }
  }, [handleUpload])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  // Remove image
  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  // Set as main image (move to first position)
  const handleSetMain = (index: number) => {
    if (index === 0) return
    const newImages = [
      images[index],
      ...images.filter((_, i) => i !== index)
    ]
    onChange(newImages)
  }

  return (
    <div className={styles.container}>
      {/* Dropzone */}
      <div
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <div className={styles.dropzoneContent}>
          <div className={styles.icon}>📤</div>
          <div className={styles.text}>
            {uploading ? '上传中...' : '点击上传'}
          </div>
          <div className={styles.subtext}>
            或拖拽图片到这里
          </div>
          <div className={styles.hint}>
            支持 JPG, PNG, GIF, WebP 格式，单张 ≤ 5MB
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span>上传进度</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <span>已上传图片 ({images.length}/{maxImages})</span>
          </div>
          <div className={styles.previewGrid}>
            {images.map((url, index) => (
              <div key={index} className={styles.previewItem}>
                <img src={url} alt={`Preview ${index + 1}`} />
                {index === 0 && <span className={styles.mainBadge}>主</span>}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemove(index) }}
                  className={styles.removeBtn}
                  title="删除图片"
                >
                  ✕
                </button>
                {index > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetMain(index) }}
                    className={styles.setMainBtn}
                    title="设为主图"
                  >
                    设为主图
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
