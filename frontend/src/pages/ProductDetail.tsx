import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProductDetail } from '../hooks'
import { formatDate, formatPrice, getImageCount } from '../utils'
import { Loading, Empty } from '../components'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, loading, error, fetchProduct } = useProductDetail()
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (id) {
      fetchProduct(id)
    }
  }, [id, fetchProduct])

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="加载商品详情..." size="large" fullscreen />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <Empty
          icon="🔍"
          title="商品不存在"
          description={error?.message || '无法找到该商品信息'}
          actionText="返回商品列表"
          onAction={() => navigate('/products')}
        />
      </div>
    )
  }

  const hasImages = product.images && product.images.length > 0

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>首页</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to="/products" className={styles.breadcrumbLink}>商品列表</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* Back Button */}
      <button className={styles.backButton} onClick={handleBack}>
        ← 返回
      </button>

      {/* Product Content */}
      <div className={styles.productContent}>
        {/* Image Gallery */}
        <div className={styles.imageSection}>
          {hasImages ? (
            <>
              {/* Main Image */}
              <div className={styles.mainImageWrapper}>
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={styles.mainImage}
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className={styles.thumbnailGallery}>
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`${styles.thumbnail} ${
                        index === selectedImage ? styles.active : ''
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={image} alt={`${product.name} - 图片 ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>📦</span>
              <p>暂无图片</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.infoSection}>
          {/* Status Badge */}
          <div className={`${styles.statusBadge} ${styles[product.status]}`}>
            {product.status === 'on_sale' ? '在售' : '已下架'}
          </div>

          {/* Product Name */}
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Price */}
          <div className={styles.priceSection}>
            <span className={styles.priceLabel}>价格</span>
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </div>

          {/* Description */}
          {product.description && (
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>商品描述</h3>
              <p className={styles.description}>{product.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>上架时间</span>
              <span className={styles.metadataValue}>
                {formatDate(product.createdAt, 'datetime')}
              </span>
            </div>
            {product.updatedAt && product.updatedAt !== product.createdAt && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>更新时间</span>
                <span className={styles.metadataValue}>
                  {formatDate(product.updatedAt, 'datetime')}
                </span>
              </div>
            )}
            {hasImages && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>图片数量</span>
                <span className={styles.metadataValue}>
                  {getImageCount(product.images)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            {product.status === 'on_sale' ? (
              <button className={styles.primaryButton}>
                立即购买
              </button>
            ) : (
              <button className={styles.disabledButton} disabled>
                暂时缺货
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
