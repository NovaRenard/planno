type LoadingStateProps = {
  message?: string
}

export function LoadingState({
  message = 'Loading...',
}: LoadingStateProps) {
  return (
    <div
      className="state-card state-card-loading"
      role="status"
      aria-live="polite"
    >
      <div
        className="state-spinner"
        aria-hidden="true"
      />

      <p>{message}</p>

      <div
        className="state-skeleton-list"
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
