import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { ProductListItem } from '../types'
import { getFirstImage, formatDate } from '../utils'
import { useCurrency } from '../context/CurrencyContext'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: ProductListItem
}

export default function ProductCard({ product }: ProductCardProps) {
  const intl = useIntl()
  const { formatPrice } = useCurrency()
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
            {product.status === 'on_sale' 
              ? intl.formatMessage({ id: 'status.on_sale' })
              : intl.formatMessage({ id: 'status.off_sale' })}
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
