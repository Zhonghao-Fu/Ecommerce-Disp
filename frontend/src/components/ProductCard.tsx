import { Link } from 'react-router-dom'
import { ProductListItem } from '../types'
import { formatPrice, getFirstImage, formatDate } from '../utils'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: ProductListItem
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstImage = getFirstImage(product.images, '')
  const formattedPrice = formatPrice(product.price)
  const formattedDate = formatDate(product.createdAt)

  return (
    <div className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.cardLink}>
        {/* Product Image */}
        <div className={styles.imageWrapper}>
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>📦</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className={`${styles.badge} ${styles[product.status]}`}>
            {product.status === 'on_sale' ? '在售' : '下架'}
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          
          <div className={styles.price}>{formattedPrice}</div>
          
          <div className={styles.meta}>
            <span className={styles.date}>{formattedDate}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
