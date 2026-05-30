import styles from './Loading.module.css'

interface LoadingProps {
  /** Loading message to display */
  message?: string
  /** Size of the spinner: 'small' | 'medium' | 'large' */
  size?: 'small' | 'medium' | 'large'
  /** Whether to show full-screen overlay */
  fullscreen?: boolean
}

export default function Loading({
  message = '加载中...',
  size = 'medium',
  fullscreen = false
}: LoadingProps) {
  if (fullscreen) {
    return (
      <div className={styles.fullscreenOverlay}>
        <div className={styles.fullscreenContent}>
          <div className={`${styles.spinner} ${styles[size]}`} />
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      <p className={styles.message}>{message}</p>
    </div>
  )
}
