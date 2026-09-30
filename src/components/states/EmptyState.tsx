type EmptyStateProps = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="state-card">
      <div
        className="state-icon state-icon-empty"
        aria-hidden="true"
      >
        +
      </div>

      <h3>{title}</h3>

      {description ? <p>{description}</p> : null}

      {actionLabel ? (
        <button
          type="button"
          className="state-action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
