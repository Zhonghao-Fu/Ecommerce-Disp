/**
 * Product Form Modal Component
 * Used for both creating and editing products
 */

import { useState, useEffect } from 'react'
import type { ProductListItem } from '../../types'
import ImageUploader from './ImageUploader'
import styles from './ProductFormModal.module.css'

interface ProductFormModalProps {
  visible: boolean
  product: ProductListItem | null  // null means create mode
  onClose: () => void
  onSave: (data: ProductFormData) => void
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  status: 'on_sale' | 'off_sale'
  images: string[]
}

export default function ProductFormModal({ 
  visible, 
  product, 
  onClose, 
  onSave 
}: ProductFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState<'on_sale' | 'off_sale'>('on_sale')
  const [images, setImages] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription('')  // ProductListItem doesn't have description
      setPrice(product.price.toString())
      setStatus(product.status)
      setImages(product.images || [])
    } else {
      // Reset for create mode
      setName('')
      setDescription('')
      setPrice('')
      setStatus('on_sale')
      setImages([])
    }
    setErrors({})
  }, [product, visible])

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '商品名称不能为空'
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = '请输入有效的价格（必须大于0）'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = () => {
    if (!validate()) return

    const formData: ProductFormData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      status,
      images
    }

    onSave(formData)
  }

  if (!visible) return null

  const isEditMode = !!product

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditMode ? '编辑商品' : '新增商品'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Product Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              商品名称 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} ${errors.name ? styles.error : ''}`}
              placeholder="请输入商品名称"
            />
            {errors.name && <div className={styles.errorText}>{errors.name}</div>}
          </div>

          {/* Price */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              商品价格（元） <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`${styles.input} ${errors.price ? styles.error : ''}`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.price && <div className={styles.errorText}>{errors.price}</div>}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>商品描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="请输入商品描述（可选）"
              rows={3}
            />
          </div>

          {/* Status */}
          <div className={styles.formGroup}>
            <label className={styles.label}>商品状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'on_sale' | 'off_sale')}
              className={styles.select}
            >
              <option value="on_sale">✅ 在售</option>
              <option value="off_sale">⏸️ 下架</option>
            </select>
          </div>

          {/* Images */}
          <div className={styles.formGroup}>
            <label className={styles.label}>商品图片</label>
            <ImageUploader
              images={images}
              onChange={setImages}
              maxImages={10}
              maxSize={5 * 1024 * 1024}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            取消
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            {isEditMode ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}
