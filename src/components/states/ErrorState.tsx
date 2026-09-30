type ErrorStateProps = {
  title?: string
  message?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
}: ErrorStateProps) {
  return (
    <div
      className="state-card state-card-error"
      role="alert"
    >
      <div
        className="state-icon state-icon-error"
        aria-hidden="true"
      >
        !
      </div>

      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}
