/**
 * Currency Selector Component
 * Dropdown for switching between supported currencies
 */

import { useCurrency, CURRENCY_FLAGS, CURRENCY_NAMES, type Currency } from '../context/CurrencyContext'
import styles from './CurrencySelector.module.css'

const SUPPORTED_CURRENCIES: Currency[] = ['CNY', 'USD', 'EUR', 'HKD']

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Currency
    setCurrency(newCurrency)
  }

  return (
    <div className={styles.currencySelector}>
      <select
        value={currency}
        onChange={handleChange}
        className={styles.select}
        aria-label="Select Currency"
      >
        {SUPPORTED_CURRENCIES.map((curr) => (
          <option key={curr} value={curr}>
            {CURRENCY_FLAGS[curr]} {curr}
          </option>
        ))}
      </select>
    </div>
  )
}
