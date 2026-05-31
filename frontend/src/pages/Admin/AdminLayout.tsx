/**
 * Admin Layout Component
 * Provides consistent layout for admin pages with dark navbar
 */

import { Link, Outlet, useLocation } from 'react-router-dom'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className={styles.adminContainer}>
      {/* Admin Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              🛍️ 商品管理系统
            </Link>
            <span className={styles.adminBadge}>ADMIN</span>
          </div>
          <div className={styles.navLinks}>
            <Link 
              to="/products" 
              className={styles.navLink}
            >
              查看前台
            </Link>
            <Link 
              to="/admin/products" 
              className={`${styles.navLink} ${location.pathname === '/admin/products' ? styles.active : ''}`}
            >
              商品管理
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}
