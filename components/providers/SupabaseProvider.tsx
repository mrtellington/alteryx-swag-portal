'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserProfile } from '@/lib/auth'

interface SupabaseContextType {
  user: User | null
  profile: any | null
  loading: boolean
  supabase: any
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  profile: null,
  loading: true,
  supabase: null,
})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        console.log('Session:', session ? 'exists' : 'none')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Getting user profile...')
          try {
            const userProfile = await getUserProfile(session.user.id)
            setProfile(userProfile)
          } catch (error) {
            console.error('Error getting user profile:', error)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Timeout reached, setting loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'has user' : 'no user')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const userProfile = await getUserProfile(session.user.id)
            setProfile(userProfile)
          } catch (error) {
            console.error('Error getting user profile:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Add a timeout for auth state changes too
    const authTimeoutId = setTimeout(() => {
      console.log('Auth timeout reached, setting loading to false')
      setLoading(false)
    }, 3000) // 3 second timeout for auth changes

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
      clearTimeout(authTimeoutId)
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ user, profile, loading, supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}
