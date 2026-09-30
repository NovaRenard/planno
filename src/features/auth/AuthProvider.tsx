import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type {
  Session,
  User,
} from '@supabase/supabase-js'

import {
  getSession,
  onAuthStateChange,
} from './authService'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  isPasswordRecovery: boolean
  completePasswordRecovery: () => void
}

const AuthContext =
  createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null)

  const [loading, setLoading] = useState(true)

  const [
    isPasswordRecovery,
    setIsPasswordRecovery,
  ] = useState(false)

  useEffect(() => {
    async function loadSession() {
      const { data, error } = await getSession()

      if (error) {
        console.error(
          'Failed to load session:',
          error,
        )
      }

      setSession(data.session)

      if (
        data.session &&
        window.location.pathname ===
          '/reset-password'
      ) {
        setIsPasswordRecovery(true)
      }

      setLoading(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setLoading(false)

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }

      if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  function completePasswordRecovery() {
    setIsPasswordRecovery(false)
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    isPasswordRecovery,
    completePasswordRecovery,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}