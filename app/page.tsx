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

    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing loading to false')
      setLoading(false)
    }, 10000) // 10 second timeout

    // Check for hash fragment authentication first
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
          console.log('Both tokens found, attempting to set session...')
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) {
              console.error('Error setting session from hash:', error)
              toast.error('Authentication failed')
              setLoading(false)
              return
            }

            if (data.session) {
              console.log('Authentication successful from hash')
              setUser(data.session.user)
              
              // Clear the hash from URL
              window.history.replaceState({}, document.title, window.location.pathname)
              
              // Get user profile and check authorization
              try {
                const userProfile = await getUserProfile(data.session.user.id)
                setProfile(userProfile)
                
                if (userProfile) {
                  const isInvited = userProfile.invited
                  const hasOrdered = userProfile.order_submitted
                  
                  if (hasOrdered) {
                    toast.error('You have already redeemed your New Hire Bundle. Thank you!')
                    await supabase.auth.signOut()
                    setAuthorized(false)
                  } else if (!isInvited) {
                    toast.error('You are not authorized to access the New Hire Bundle. Please contact your administrator.')
                    await supabase.auth.signOut()
                    setAuthorized(false)
                  } else {
                    setAuthorized(true)
                  }
                } else {
                  toast.error('User profile not found. Please contact your administrator.')
                  await supabase.auth.signOut()
                  setAuthorized(false)
                }
              } catch (profileError) {
                console.error('Error getting user profile:', profileError)
                toast.error('Error loading user profile')
                setAuthorized(false)
              }
              
              setLoading(false)
              return
            } else {
              console.log('No session data returned from setSession')
              setLoading(false)
            }
          } catch (error) {
            console.error('Error processing hash authentication:', error)
            toast.error('Authentication failed')
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

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const userProfile = await getUserProfile(session.user.id)
          setProfile(userProfile)
          
          // Check if user is authorized
          if (userProfile) {
            const isInvited = userProfile.invited
            const hasOrdered = userProfile.order_submitted
            
            if (hasOrdered) {
              toast.error('You have already redeemed your New Hire Bundle. Thank you!')
              await supabase.auth.signOut()
              setAuthorized(false)
            } else if (!isInvited) {
              toast.error('You are not authorized to access the New Hire Bundle. Please contact your administrator.')
              await supabase.auth.signOut()
              setAuthorized(false)
            } else {
              setAuthorized(true)
            }
          } else {
            toast.error('User profile not found. Please contact your administrator.')
            await supabase.auth.signOut()
            setAuthorized(false)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('Auth state change:', event, session ? 'has user' : 'no user')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const userProfile = await getUserProfile(session.user.id)
            setProfile(userProfile)
            
            // Check if user is authorized
            if (userProfile) {
              const isInvited = userProfile.invited
              const hasOrdered = userProfile.order_submitted
              
              if (hasOrdered) {
                toast.error('You have already redeemed your New Hire Bundle. Thank you!')
                await supabase.auth.signOut()
                setAuthorized(false)
              } else if (!isInvited) {
                toast.error('You are not authorized to access the New Hire Bundle. Please contact your administrator.')
                await supabase.auth.signOut()
                setAuthorized(false)
              } else {
                setAuthorized(true)
              }
            } else {
              toast.error('User profile not found. Please contact your administrator.')
              await supabase.auth.signOut()
              setAuthorized(false)
            }
          } catch (error) {
            console.error('Error getting user profile in auth change:', error)
            setAuthorized(false)
          }
        } else {
          setProfile(null)
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
