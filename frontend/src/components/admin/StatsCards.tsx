/**
 * Statistics Cards Component
 * Displays summary statistics for admin dashboard
 */

import styles from './StatsCards.module.css'

interface StatsCardsProps {
  total: number
  onSale: number
  offSale: number
  todayUpdated: number
}

export default function StatsCards({ total, onSale, offSale, todayUpdated }: StatsCardsProps) {
  const stats = [
    {
      label: '商品总数',
      value: total,
      color: '#1890ff',
      icon: '📦'
    },
    {
      label: '在售商品',
      value: onSale,
      color: '#52c41a',
      icon: '✅'
    },
    {
      label: '下架商品',
      value: offSale,
      color: '#faad14',
      icon: '⏸️'
    },
    {
      label: '今日更新',
      value: todayUpdated,
      color: '#f5222d',
      icon: '🔥'
    }
  ]

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statIcon}>{stat.icon}</div>
          <div className={styles.statContent}>
            <div className={styles.statValue} style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
