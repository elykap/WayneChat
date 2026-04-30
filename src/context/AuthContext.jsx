import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session ?? null)
        setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      if (!userId) {
        setProfile(null)
        setProfileLoading(false)
        return
      }

      setProfileLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', userId)
        .maybeSingle()

      if (!cancelled) {
        if (error) {
          console.error('Profile load error:', error)
          setProfile(null)
        } else {
          setProfile(data ?? null)
        }
        setProfileLoading(false)
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [userId])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      profile,
      profileLoading,
      signOut: () => supabase.auth.signOut(),
    }),
    [session, loading, profile, profileLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
