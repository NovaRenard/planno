import { useState } from 'react'

import { useAuth } from '../features/auth/AuthProvider'
import { logout } from '../features/auth/authService'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

export function ProfilePage() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const [loggingOut, setLoggingOut] =
    useState(false)

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email ||
    'User'

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="simple-page">
      <p className="simple-page-eyebrow">
        Account
      </p>

      <h2>Profile</h2>

      <p className="simple-page-description">
        View your account and current workspace.
      </p>

      <div className="simple-page-card">
        <h3>{fullName}</h3>

        <div className="account-detail-grid">
          <div className="account-detail-row">
            <strong>Email</strong>
            <span>{user?.email ?? '—'}</span>
          </div>

          <div className="account-detail-row">
            <strong>Workspace</strong>
            <span>
              {currentWorkspace?.name ?? '—'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="secondary-action"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
