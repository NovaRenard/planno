import {
  useState,
  type FormEvent,
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

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email ||
    'User'

  const [name, setName] = useState(fullName)
  const [savingName, setSavingName] =
    useState(false)
  const [loggingOut, setLoggingOut] =
    useState(false)

  const [nameError, setNameError] =
    useState<string | null>(null)

  const [nameSuccess, setNameSuccess] =
    useState<string | null>(null)

  async function handleNameSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setNameError(null)
    setNameSuccess(null)

    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      setNameError(
        'Name must contain at least 2 characters.',
      )

      return
    }

    if (trimmedName.length > 80) {
      setNameError(
        'Name must contain 80 characters or fewer.',
      )

      return
    }

    setSavingName(true)

    try {
      const { error } =
        await updateFullName(trimmedName)

      if (error) {
        throw error
      }

      setName(trimmedName)
      setNameSuccess(
        'Your name has been updated.',
      )
    } catch (error) {
      setNameError(
        error instanceof Error
          ? error.message
          : 'Unable to update your name.',
      )
    } finally {
      setSavingName(false)
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

  return (
    <div className="simple-page">
      <p className="simple-page-eyebrow">
        Account
      </p>

      <h2>Profile</h2>

      <p className="simple-page-description">
        View and update your account information.
      </p>

      <div className="simple-page-card">
        <h3>{fullName}</h3>

        <div className="account-detail-grid">
          <div className="account-detail-row">
            <strong>Email</strong>

            <span>
              {user?.email ?? '—'}
            </span>
          </div>

          <div className="account-detail-row">
            <strong>Workspace</strong>

            <span>
              {currentWorkspace?.name ?? '—'}
            </span>
          </div>
        </div>

        <form
          className="auth-form"
          onSubmit={handleNameSubmit}
          noValidate
        >
          <label htmlFor="profile-full-name">
            <span>Display name</span>

            <input
              id="profile-full-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              autoComplete="name"
              maxLength={80}
              disabled={savingName}
            />
          </label>

          {nameError && (
            <p
              className="auth-message auth-message-error"
              role="alert"
            >
              {nameError}
            </p>
          )}

          {nameSuccess && (
            <p
              className="auth-message"
              role="status"
            >
              {nameSuccess}
            </p>
          )}

          <button
            type="submit"
            className="primary-action"
            disabled={savingName}
          >
            {savingName
              ? 'Saving...'
              : 'Save name'}
          </button>
        </form>

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