import { NavLink } from 'react-router-dom'

import { useAuth } from '../../../features/auth/AuthProvider'
import { useWorkspace } from '../../../features/workspaces/WorkspaceProvider'

const mainNavigation = [
  { label: 'Overview', icon: '⌂', to: '/' },
  { label: 'Kanban', icon: '▦', to: '/kanban' },
  { label: 'Tasks', icon: '✓', to: '/tasks' },
  { label: 'Calendar', icon: '◷', to: '/calendar' },
  { label: 'Templates', icon: '◇', to: '/templates' },
  { label: 'Archive', icon: '□', to: '/archive' },
]

const accountNavigation = [
  { label: 'Settings', icon: '⚙', to: '/settings' },
  { label: 'Profile', icon: '◉', to: '/profile' },
]

function initials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return 'U'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Sidebar() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email ||
    'User'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">P</div>

        <div>
          <p className="sidebar-brand-name">
            Planno
          </p>
          <p className="sidebar-brand-caption">
            {currentWorkspace?.name ??
              'Personal workspace'}
          </p>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">
          Workspace
        </p>

        <nav aria-label="Main navigation">
          <ul className="sidebar-list">
            {mainNavigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    isActive
                      ? 'sidebar-link sidebar-link-active'
                      : 'sidebar-link'
                  }
                >
                  <span className="sidebar-link-icon">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <p className="sidebar-section-title">
          Account
        </p>

        <nav aria-label="Account navigation">
          <ul className="sidebar-list">
            {accountNavigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? 'sidebar-link sidebar-link-active'
                      : 'sidebar-link'
                  }
                >
                  <span className="sidebar-link-icon">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {initials(fullName)}
          </div>

          <div className="sidebar-user-text">
            <strong>{fullName}</strong>
            <span>
              {currentWorkspace?.name ??
                'No workspace'}
            </span>
          </div>

          <span
            className="sidebar-user-status"
            aria-label="Online"
          />
        </div>
      </div>
    </aside>
  )
}
