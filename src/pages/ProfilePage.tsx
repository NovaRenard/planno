import {
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../features/auth/AuthProvider'
import {
  logout,
  updateFullName,
} from '../features/auth/authService'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

export function ProfilePage() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()

  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] =
    useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    setFullName(
      user?.user_metadata?.full_name ||
        '',
    )
  }, [user])

  async function handleSaveName() {
    const trimmedName = fullName.trim()

    setMessage('')
    setErrorMessage('')

    if (!trimmedName) {
      setErrorMessage('Name cannot be empty.')
      return
    }

    setSaving(true)

    try {
      const { error } =
        await updateFullName(trimmedName)

      if (error) {
        throw error
      }

      setFullName(trimmedName)
      setMessage('Name updated successfully.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not update name.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  const displayedName =
    user?.user_metadata?.full_name ||
    user?.email ||
    'User'

  return (
    <div className="simple-page">
      <p className="simple-page-eyebrow">
        Account
      </p>

      <h2>Profile</h2>

      <p className="simple-page-description">
        Manage your account and current workspace.
      </p>

      <div className="simple-page-card">
        <h3>{displayedName}</h3>

        <div className="account-detail-grid">
          <div className="account-detail-row">
            <strong>Name</strong>

            <div>
              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your name"
                disabled={saving}
              />

              <button
                type="button"
                className="primary-action"
                onClick={handleSaveName}
                disabled={
                  saving ||
                  !fullName.trim()
                }
              >
                {saving
                  ? 'Saving...'
                  : 'Save name'}
              </button>

              {message && (
                <p>{message}</p>
              )}

              {errorMessage && (
                <p>{errorMessage}</p>
              )}
            </div>
          </div>

          <div className="account-detail-row">
            <strong>Email</strong>
            <span>
              {user?.email ?? '—'}
            </span>
          </div>

          <div className="account-detail-row">
            <strong>Workspace</strong>
            <span>
              {currentWorkspace?.name ??
                '—'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="secondary-action"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut
            ? 'Signing out...'
            : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
