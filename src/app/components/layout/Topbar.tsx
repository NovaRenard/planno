import { Link, useLocation } from 'react-router-dom'

const pageTitles: Record<
  string,
  {
    eyebrow: string
    title: string
  }
> = {
  '/': {
    eyebrow: 'Workspace overview',
    title: 'Good evening, Zhazira',
  },
  '/kanban': {
    eyebrow: 'Task management',
    title: 'Kanban board',
  },
  '/tasks': {
    eyebrow: 'Task management',
    title: 'All tasks',
  },
  '/calendar': {
    eyebrow: 'Planning',
    title: 'Calendar',
  },
  '/templates': {
    eyebrow: 'Productivity',
    title: 'Templates',
  },
  '/archive': {
    eyebrow: 'Task history',
    title: 'Archive',
  },
  '/settings': {
    eyebrow: 'Preferences',
    title: 'Settings',
  },
  '/profile': {
    eyebrow: 'Account',
    title: 'Your profile',
  },
}

export function Topbar() {
  const location = useLocation()

  const currentPage =
    pageTitles[location.pathname] ?? {
      eyebrow: 'Planno',
      title: 'Workspace',
    }

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <p className="topbar-label">
          {currentPage.eyebrow}
        </p>

        <h1 className="topbar-title">
          {currentPage.title}
        </h1>
      </div>

      <div className="topbar-actions">
        <span className="topbar-status">
          <span
            className="topbar-status-dot"
            aria-hidden="true"
          />
          In focus
        </span>

        <Link
          to="/tasks"
          className="topbar-search"
          aria-label="Open tasks search"
        >
          <span
            className="topbar-search-icon"
            aria-hidden="true"
          >
            ⌕
          </span>
          <span className="topbar-search-text">
            Search
          </span>
        </Link>

        <Link
          to="/profile"
          className="topbar-profile"
          aria-label="Open profile"
        >
          <span className="topbar-profile-avatar">
            ZH
          </span>

          <span className="topbar-profile-name">
            Zhazira
          </span>

          <span
            className="topbar-profile-caret"
            aria-hidden="true"
          >
            ▾
          </span>
        </Link>
      </div>
    </header>
  )
}
