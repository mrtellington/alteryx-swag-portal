'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { LoginPage } from '@/components/auth/LoginPage'
import { StorePage } from '@/components/store/StorePage'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { getUserProfile, isUserInvited } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    if (!supabase) {
      console.log('Supabase client not available yet')
      return
    }

    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing loading to false')
      setLoading(false)
    }, 10000)

    const handleHashAuth = async () => {
      const hash = window.location.hash.substring(1)
      console.log('Current URL:', window.location.href)
      console.log('Hash fragment:', hash)

      if (hash) {
        console.log('Found hash fragment, processing authentication...')
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        console.log('Parsed params:', {
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          type: type
        })

        if (accessToken && refreshToken) {
          console.log('Both tokens found, creating simple user object...')
          console.log('DEPLOYMENT TEST - NEW CODE VERSION 1.0')
          
          try {
            // Decode the JWT token to get user info
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
            console.log('Token payload:', tokenPayload)
            
            // Create a simple user object from the token
            const simpleUser = {
              id: tokenPayload.sub,
              email: tokenPayload.email,
              email_verified: tokenPayload.user_metadata?.email_verified || false,
              created_at: tokenPayload.iat,
              updated_at: tokenPayload.iat
            }
            
            console.log('Created simple user object:', simpleUser)
            setUser(simpleUser)
            
            // Clear the hash from URL
            window.history.replaceState({}, document.title, window.location.pathname)
            
            // For now, just authorize the user without profile check
            console.log('Authorizing user without profile check...')
            setAuthorized(true)
            setLoading(false)
            return
            
          } catch (error) {
            console.error('Error processing token:', error)
            setLoading(false)
          }
        } else {
          console.log('Missing required tokens in hash fragment')
          setLoading(false)
        }
      } else {
        console.log('No hash fragment found in URL')
        setLoading(false)
      }
    }

    // Process hash authentication first
    handleHashAuth()

    // Get initial session (simplified)
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          console.log('Found existing session')
          setUser(session.user)
          setAuthorized(true)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes (simplified)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('Auth state change:', event, session ? 'has user' : 'no user')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          setAuthorized(true)
        } else {
          setAuthorized(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alteryx-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a few seconds</p>
          <p className="mt-1 text-xs text-gray-400">If this takes too long, please refresh the page</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show login page
  if (!user) {
    return <LoginPage />
  }

  // If user is authenticated but not authorized, show login page
  if (authorized === false) {
    return <LoginPage />
  }

  // If user is authenticated and authorized, show store page
  return <StorePage user={user} profile={profile} />
}
