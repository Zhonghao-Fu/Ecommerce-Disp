import styles from './Empty.module.css'

interface EmptyProps {
  /** Icon to display (emoji or text) */
  icon?: string
  /** Title to display */
  title: string
  /** Description text */
  description?: string
  /** Action button text */
  actionText?: string
  /** Action button click handler */
  onAction?: () => void
}

export default function Empty({
  icon = '📦',
  title,
  description,
  actionText,
  onAction
}: EmptyProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionText && onAction && (
        <button className={styles.actionButton} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  )
}
