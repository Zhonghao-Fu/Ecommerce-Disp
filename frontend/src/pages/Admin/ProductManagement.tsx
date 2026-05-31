/**
 * Product Management Page
 * Main admin page for managing products
 */

import { useState, useEffect, useCallback } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { productApi } from '../../services/product'
import { exportProducts, importProducts, downloadTemplate } from '../../services/importExport'
import { ProductFilter, Pagination } from '../../components'
import StatsCards from '../../components/admin/StatsCards'
import ProductTable from '../../components/admin/ProductTable'
import ProductFormModal, { type ProductFormData } from '../../components/admin/ProductFormModal'
import ExportDialog from '../../components/admin/ExportDialog'
import ImportDialog from '../../components/admin/ImportDialog'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import styles from './ProductManagement.module.css'
import type { ProductListItem, ProductStatus, ImportResult } from '../../types'

export default function ProductManagement() {
  const { 
    data: products, 
    pagination,
    loading, 
    error, 
    fetchProducts,
    filters,
    setFilters,
    resetFilters
  } = useProducts({
    autoFetch: true,
    initialFilters: {
      pageSize: 10,  // 10 items per page for pagination
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  })

  const [modalVisible, setModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null)
  const [stats, setStats] = useState({ total: 0, onSale: 0, offSale: 0, todayUpdated: 0 })
  const [showFilters, setShowFilters] = useState(false)
  
  // Import/Export state
  const [exportDialogVisible, setExportDialogVisible] = useState(false)
  const [importDialogVisible, setImportDialogVisible] = useState(false)

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [setFilters])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setFilters({ page })
  }, [setFilters])

  // Fetch stats independently (不受筛选影响)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all products (no filter) to calculate stats
        const [allResponse, onSaleResponse, offSaleResponse] = await Promise.all([
          productApi.getProducts({ page: 1, pageSize: 1, status: 'all' }),
          productApi.getProducts({ page: 1, pageSize: 1, status: 'on_sale' }),
          productApi.getProducts({ page: 1, pageSize: 1, status: 'off_sale' })
        ])

        const today = new Date().toDateString()
        const todayResponse = await productApi.getProducts({ page: 1, pageSize: 1000 })
        const todayUpdated = todayResponse.data.filter(p => {
          const date = new Date(p.createdAt)
          return date.toDateString() === today
        }).length

        setStats({
          total: allResponse.pagination.total,
          onSale: onSaleResponse.pagination.total,
          offSale: offSaleResponse.pagination.total,
          todayUpdated
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, []) // Only fetch once on mount

  // Refresh stats after status change or import
  const refreshStats = useCallback(async () => {
    try {
      const [allResponse, onSaleResponse, offSaleResponse] = await Promise.all([
        productApi.getProducts({ page: 1, pageSize: 1, status: 'all' }),
        productApi.getProducts({ page: 1, pageSize: 1, status: 'on_sale' }),
        productApi.getProducts({ page: 1, pageSize: 1, status: 'off_sale' })
      ])

      setStats({
        total: allResponse.pagination.total,
        onSale: onSaleResponse.pagination.total,
        offSale: offSaleResponse.pagination.total,
        todayUpdated: stats.todayUpdated // Keep existing value
      })
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    }
  }, [stats.todayUpdated])

  // Handle status change
  const handleStatusChange = useCallback(async (id: string, status: ProductStatus) => {
    try {
      await productApi.updateProductStatus(id, status)
      // Refresh list and stats
      fetchProducts()
      refreshStats()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('状态更新失败，请重试')
    }
  }, [fetchProducts, refreshStats])

  // Handle edit
  const handleEdit = useCallback((product: ProductListItem) => {
    setEditingProduct(product)
    setModalVisible(true)
  }, [])

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    try {
      await productApi.deleteProduct(id)
      // Refresh list and stats
      fetchProducts()
      refreshStats()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('删除失败，请重试')
    }
  }, [fetchProducts, refreshStats])

  // Handle create
  const handleCreate = useCallback(() => {
    setEditingProduct(null)
    setModalVisible(true)
  }, [])

  // Handle save (create or update)
  const handleSave = useCallback(async (formData: ProductFormData) => {
    try {
      if (editingProduct) {
        // Update existing product
        await productApi.updateProduct(editingProduct.id, {
          name: formData.name,
          price: formData.price,
          status: formData.status,
          images: formData.images
        })
      } else {
        // Create new product
        await productApi.createProduct({
          name: formData.name,
          price: formData.price,
          status: formData.status,
          images: formData.images
        })
      }

      // Close modal and refresh
      setModalVisible(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('保存失败，请重试')
    }
  }, [editingProduct, fetchProducts])

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalVisible(false)
    setEditingProduct(null)
  }, [])

  // Handle export
  const handleExport = useCallback(async (fields: string[], scope: 'filtered' | 'all') => {
    await exportProducts(
      fields,
      scope,
      scope === 'filtered' ? filters : undefined
    )
  }, [filters])

  // Handle import
  const handleImport = useCallback(async (file: File, mode: 'hybrid' | 'insert-only' | 'update-only'): Promise<ImportResult> => {
    const result = await importProducts(file, mode)
    // Refresh list and stats after import
    fetchProducts()
    refreshStats()
    return result
  }, [fetchProducts, refreshStats])

  // Handle download template
  const handleDownloadTemplate = useCallback(async () => {
    await downloadTemplate()
  }, [])

  if (loading) {
    return <Loading fullscreen />
  }

  if (error) {
    return (
      <Empty
        title="加载失败"
        description={error.message}
        actionText="重试"
        onAction={fetchProducts}
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Stats Cards */}
      <StatsCards
        total={stats.total}
        onSale={stats.onSale}
        offSale={stats.offSale}
        todayUpdated={stats.todayUpdated}
      />

      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.pageTitle}>商品管理</h1>
            <span className={styles.currencyNote}>（所有价格以人民币显示）</span>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.exportBtn}
              onClick={() => setExportDialogVisible(true)}
            >
              📤 导出
            </button>
            <button
              className={styles.importBtn}
              onClick={() => setImportDialogVisible(true)}
            >
              📥 导入
            </button>
            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '隐藏筛选' : '显示筛选'}
            </button>
            {(filters.keyword || filters.minPrice || filters.maxPrice || filters.status !== 'all') && (
              <button
                className={styles.resetButton}
                onClick={() => {
                  resetFilters()
                  setShowFilters(false)
                }}
              >
                重置筛选
              </button>
            )}
            <button className={styles.createBtn} onClick={handleCreate}>
              ➕ 新增商品
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className={styles.filterSection}>
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span>
          共 <strong>{products.length}</strong> 件商品
          {filters.keyword && `，搜索关键词："${filters.keyword}"`}
        </span>
      </div>

      {/* Product Table */}
      {products.length === 0 && !loading ? (
        <Empty
          title="暂无商品"
          description="点击「新增商品」添加第一个商品"
          actionText="新增商品"
          onAction={handleCreate}
        />
      ) : (
        <>
          <ProductTable
            products={products}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={filters.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <ProductFormModal
        visible={modalVisible}
        product={editingProduct}
        onClose={handleModalClose}
        onSave={handleSave}
      />

      {/* Export Dialog */}
      <ExportDialog
        visible={exportDialogVisible}
        totalProducts={stats.total}
        filteredCount={products.length}
        onClose={() => setExportDialogVisible(false)}
        onExport={handleExport}
      />

      {/* Import Dialog */}
      <ImportDialog
        visible={importDialogVisible}
        onClose={() => setImportDialogVisible(false)}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  )
}
