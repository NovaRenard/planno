import type {
  AuthChangeEvent,
  Session,
} from '@supabase/supabase-js'

import { supabase } from '../../lib/supabase/client'

type RegisterInput = {
  email: string
  password: string
  fullName: string
}

type LoginInput = {
  email: string
  password: string
}

export async function register({
  email,
  password,
  fullName,
}: RegisterInput) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/`,
    },
  })
}

export async function login({
  email,
  password,
}: LoginInput) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function logout() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(
  callback: (
    event: AuthChangeEvent,
    session: Session | null,
  ) => void | Promise<void>,
) {
  return supabase.auth.onAuthStateChange(
    async (event, session) => {
      await callback(event, session)
    },
  )
}

export async function resendConfirmationEmail(
  email: string,
) {
  return supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  })
}

export async function sendPasswordResetEmail(
  email: string,
) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export async function updatePassword(
  newPassword: string,
) {
  return supabase.auth.updateUser({
    password: newPassword,
  })
}