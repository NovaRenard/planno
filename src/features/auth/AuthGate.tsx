import {
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import { LoadingState } from '../../components/states/LoadingState'
import { useAuth } from './AuthProvider'
import {
  login,
  register,
  sendPasswordResetEmail,
  updatePassword,
} from './authService'

type AuthGateProps = {
  children: ReactNode
}

type AuthMode = 'login' | 'register' | 'forgot'

export function AuthGate({
  children,
}: AuthGateProps) {
  const {
    user,
    loading,
    isPasswordRecovery,
    completePasswordRecovery,
  } = useAuth()

  const [mode, setMode] =
    useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')
  const [fullName, setFullName] =
    useState('')
  const [message, setMessage] =
    useState<string | null>(null)
  const [error, setError] =
    useState<string | null>(null)
  const [submitting, setSubmitting] =
    useState(false)

  if (loading) {
    return (
      <div className="auth-shell">
        <LoadingState message="Loading Planno..." />
      </div>
    )
  }

  if (user && !isPasswordRecovery) {
    return <>{children}</>
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    try {
      if (isPasswordRecovery) {
        const { error: updateError } =
          await updatePassword(password)

        if (updateError) {
          throw updateError
        }

        completePasswordRecovery()
        setPassword('')
        setMessage('Password updated.')
        return
      }

      if (mode === 'forgot') {
        const { error: resetError } =
          await sendPasswordResetEmail(email)

        if (resetError) {
          throw resetError
        }

        setMessage(
          'Check your email for the password reset link.',
        )
        return
      }

      if (mode === 'register') {
        const { error: registerError } =
          await register({
            email,
            password,
            fullName,
          })

        if (registerError) {
          throw registerError
        }

        setMessage(
          'Account created. Check your email if confirmation is required.',
        )
        return
      }

      const { error: loginError } =
        await login({
          email,
          password,
        })

      if (loginError) {
        throw loginError
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Authentication failed.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const title = isPasswordRecovery
    ? 'Set a new password'
    : mode === 'register'
      ? 'Create your account'
      : mode === 'forgot'
        ? 'Reset your password'
        : 'Welcome back'

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">P</span>
          <div>
            <strong>Planno</strong>
            <span>Workspace planning</span>
          </div>
        </div>

        <div className="auth-heading">
          <p className="page-eyebrow">Account</p>
          <h1>{title}</h1>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {!isPasswordRecovery &&
          mode === 'register' ? (
            <label>
              <span>Full name</span>
              <input
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                autoComplete="name"
                required
              />
            </label>
          ) : null}

          {!isPasswordRecovery ? (
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </label>
          ) : null}

          {mode !== 'forgot' ||
          isPasswordRecovery ? (
            <label>
              <span>
                {isPasswordRecovery
                  ? 'New password'
                  : 'Password'}
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete={
                  isPasswordRecovery ||
                  mode === 'register'
                    ? 'new-password'
                    : 'current-password'
                }
                minLength={6}
                required
              />
            </label>
          ) : null}

          {error ? (
            <p
              className="auth-message auth-message-error"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="auth-message">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            className="primary-action auth-submit"
            disabled={submitting}
          >
            {submitting
              ? 'Please wait...'
              : isPasswordRecovery
                ? 'Update password'
                : mode === 'register'
                  ? 'Create account'
                  : mode === 'forgot'
                    ? 'Send reset link'
                    : 'Sign in'}
          </button>
        </form>

        {!isPasswordRecovery ? (
          <div className="auth-switcher">
            {mode === 'login' ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setMode('register')
                  }
                >
                  Create account
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMode('forgot')
                  }
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setMode('login')
                }
              >
                Back to sign in
              </button>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
