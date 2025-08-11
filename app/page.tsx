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
        } else {
          setProfile(null)
          setAuthorized(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alteryx-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
