import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useIntl } from 'react-intl'
import LanguageSelector from './LanguageSelector'
import CurrencySelector from './CurrencySelector'
import styles from './Navbar.module.css'

export default function Navbar() {
  const intl = useIntl()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  const navItems = [
    { path: '/products', label: intl.formatMessage({ id: 'nav.products' }) },
    { path: '/about', label: intl.formatMessage({ id: 'nav.about' }) },
    { path: '/contact', label: intl.formatMessage({ id: 'nav.contact' }) }
  ]

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.container} ${styles.navContainer}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoIcon}>🛍️</span>
          <span className={styles.logoText}>{intl.formatMessage({ id: 'nav.logo' })}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navRight}>
          <ul className={styles.navLinks}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`${styles.navLink} ${
                    location.pathname === item.path ? styles.active : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Language & Currency Selectors */}
          <div className={styles.selectors}>
            <LanguageSelector />
            <CurrencySelector />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label={menuOpen ? intl.formatMessage({ id: 'common.close' }) : intl.formatMessage({ id: 'nav.language' })}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileNavLinks}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`${styles.mobileNavLink} ${
                    location.pathname === item.path ? styles.active : ''
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Language & Currency Selectors in Mobile */}
          <div className={styles.mobileSelectors}>
            <LanguageSelector />
            <CurrencySelector />
          </div>
        </div>
      )}
    </nav>
  )
}
