import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../../features/auth/AuthProvider'
import { useWorkspace } from '../../../features/workspaces/WorkspaceProvider'

const pageTitles: Record<
  string,
  {
    eyebrow: string
    title: string
  }
> = {
  '/': {
    eyebrow: 'Workspace overview',
    title: 'Dashboard',
  },
  '/kanban': {
    eyebrow: 'Task management',
    title: 'Kanban board',
  },
  '/tasks': {
    eyebrow: 'Task management',
    title: 'All tasks',
  },
  '/projects': {
    eyebrow: 'Workspace planning',
    title: 'Projects',
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

function initials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'U'

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Topbar() {
  const location = useLocation()
  const { user } = useAuth()
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
  } = useWorkspace()

  const currentPage =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith('/projects/')
      ? { eyebrow: 'Workspace planning', title: 'Project' }
      : { eyebrow: 'Planno', title: 'Workspace' })

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email ||
    'User'

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
        {workspaces.length > 0 ? (
          <select
            className="topbar-workspace-selector"
            aria-label="Current workspace"
            value={currentWorkspace?.id ?? ''}
            onChange={(event) => {
              const workspace = workspaces.find(
                (item) =>
                  item.id === event.target.value,
              )

              if (workspace) {
                setCurrentWorkspace(workspace)
              }
            }}
          >
            {workspaces.map((workspace) => (
              <option
                key={workspace.id}
                value={workspace.id}
              >
                {workspace.name}
              </option>
            ))}
          </select>
        ) : null}

        <span className="topbar-status">
          <span
            className="topbar-status-dot"
            aria-hidden="true"
          />
          {currentWorkspace?.name ?? 'No workspace'}
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
            {initials(fullName)}
          </span>

          <span className="topbar-profile-name">
            {fullName}
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
