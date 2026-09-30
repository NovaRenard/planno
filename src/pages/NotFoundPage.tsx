import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="not-found-page">
      <p className="not-found-code">404</p>

      <h2>Page not found</h2>

      <p className="not-found-description">
        The page you are looking for does not exist.
      </p>

      <Link to="/" className="not-found-link">
        Go to Dashboard
      </Link>
    </section>
  )
}