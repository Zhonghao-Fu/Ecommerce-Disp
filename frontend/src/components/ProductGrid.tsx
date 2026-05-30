import { ProductListItem } from '../types'
import ProductCard from './ProductCard'
import styles from './ProductGrid.module.css'

interface ProductGridProps {
  products: ProductListItem[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage = '暂无商品' }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
