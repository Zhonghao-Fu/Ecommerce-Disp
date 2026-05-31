/**
 * Product Table Component
 * Displays products in a table with actions
 */

import { useState } from 'react'
import type { ProductListItem } from '../../types'
import styles from './ProductTable.module.css'

interface ProductTableProps {
  products: ProductListItem[]
  onStatusChange: (id: string, status: 'on_sale' | 'off_sale') => void
  onEdit: (product: ProductListItem) => void
  onDelete: (id: string) => void
}

export default function ProductTable({ 
  products, 
  onStatusChange, 
  onEdit, 
  onDelete 
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (product: ProductListItem) => {
    if (window.confirm(`确定要删除商品 "${product.name}" 吗？此操作不可恢复！`)) {
      setDeletingId(product.id)
      onDelete(product.id)
    }
  }

  const handleStatusToggle = (product: ProductListItem) => {
    const newStatus = product.status === 'on_sale' ? 'off_sale' : 'on_sale'
    const action = newStatus === 'on_sale' ? '上架' : '下架'
    
    if (window.confirm(`确定要${action}商品 "${product.name}" 吗？`)) {
      onStatusChange(product.id, newStatus)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`
  }

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📦</div>
        <div className={styles.emptyText}>暂无商品</div>
      </div>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>商品</th>
            <th>ID</th>
            <th>价格</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={styles.row}>
              <td>
                <div className={styles.productInfo}>
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className={styles.thumbnail}
                    />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>🖼️</div>
                  )}
                  <span className={styles.productName}>{product.name}</span>
                </div>
              </td>
              <td className={styles.idCell}>{product.id.slice(0, 8)}...</td>
              <td className={styles.priceCell}>{formatPrice(product.price)}</td>
              <td>
                <span className={`${styles.status} ${styles[product.status]}`}>
                  {product.status === 'on_sale' ? '✅ 在售' : '⏸️ 下架'}
                </span>
              </td>
              <td className={styles.dateCell}>{formatDate(product.createdAt)}</td>
              <td className={styles.dateCell}>-</td>
              <td>
                <div className={styles.actions}>
                  <button
                    onClick={() => handleStatusToggle(product)}
                    className={`${styles.actionBtn} ${styles[product.status === 'on_sale' ? 'offSale' : 'onSale']}`}
                    title={product.status === 'on_sale' ? '下架' : '上架'}
                  >
                    {product.status === 'on_sale' ? '下架' : '上架'}
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className={`${styles.actionBtn} ${styles.edit}`}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className={`${styles.actionBtn} ${styles.delete}`}
                    title="删除"
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
