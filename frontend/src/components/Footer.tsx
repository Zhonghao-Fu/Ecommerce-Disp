import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

interface FooterLink {
  path: string
  label: string
}

const footerLinks: FooterLink[] = [
  { path: '/products', label: '商品列表' },
  { path: '/about', label: '关于我们' },
  { path: '/contact', label: '联系我们' }
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Company Info */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>
              <span className={styles.footerLogoIcon}>🛍️</span>
              商品管理系统
            </h3>
            <p className={styles.footerDescription}>
              专业的商品管理平台，提供商品展示、管理和销售服务
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>快速链接</h4>
            <ul className={styles.footerLinks}>
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>联系方式</h4>
            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>📧 contact@example.com</p>
              <p className={styles.contactItem}>📱 +86 123-4567-8900</p>
              <p className={styles.contactItem}>📍 北京市朝阳区</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>© {currentYear} 商品管理系统. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}
