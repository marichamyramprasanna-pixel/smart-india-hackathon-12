import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authService } from '../services/authService'
import { profileService, AnalystProfile } from '../services/profileService'
import { isSupabaseReady } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: AnalystProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isSupabaseConnected: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, callsign: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AnalystProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isSupabaseConnected = isSupabaseReady()

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const { data } = await profileService.getProfile(user.id)
    if (data) setProfile(data)
  }, [user])

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { session: currentSession } = await authService.getSession()
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          if (currentSession?.user) {
            const { data: prof } = await profileService.getProfile(currentSession.user.id)
            if (mounted && prof) setProfile(prof)
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('Auth initialization error', err)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initAuth()

    const { unsubscribe } = authService.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        const { data: prof } = await profileService.getProfile(newSession.user.id)
        if (mounted && prof) setProfile(prof)
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const res = await authService.signInWithPassword(email, password)
    if (res.error) return { error: res.error }
    setUser(res.user)
    setSession(res.session)
    if (res.user) {
      const { data: prof } = await profileService.getProfile(res.user.id)
      if (prof) setProfile(prof)
    }
    return { error: null }
  }

  const signUp = async (email: string, password: string, fullName: string, callsign: string) => {
    const res = await authService.signUp(email, password, { full_name: fullName, callsign })
    if (res.error) return { error: res.error }
    return { error: null }
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthenticated: !!user,
        isSupabaseConnected,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
