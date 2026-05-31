import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import styles from './Footer.module.css'

interface FooterLink {
  path: string
  labelId: string
}

const footerLinks: FooterLink[] = [
  { path: '/products', labelId: 'nav.products' },
  { path: '/about', labelId: 'nav.about' },
  { path: '/contact', labelId: 'nav.contact' }
]

export default function Footer() {
  const intl = useIntl()
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Company Info */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>
              <span className={styles.footerLogoIcon}>🛍️</span>
              {intl.formatMessage({ id: 'nav.logo' })}
            </h3>
            <p className={styles.footerDescription}>
              {intl.formatMessage({ id: 'footer.description' })}
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>{intl.formatMessage({ id: 'footer.quickLinks' })}</h4>
            <ul className={styles.footerLinks}>
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={styles.footerLink}>
                    {intl.formatMessage({ id: link.labelId })}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>{intl.formatMessage({ id: 'footer.contact' })}</h4>
            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>📧 contact@example.com</p>
              <p className={styles.contactItem}>📱 +86 123-4567-8900</p>
              <p className={styles.contactItem}>📍 {intl.formatMessage({ id: 'footer.location' })}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>© {currentYear} {intl.formatMessage({ id: 'nav.logo' })}. {intl.formatMessage({ id: 'footer.rights' })}.</p>
        </div>
      </div>
    </footer>
  )
}
