'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function AuthCallback() {
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        console.log('Supabase client not available')
        return
      }

      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const expiresIn = params.get('expires_in')
        const tokenType = params.get('token_type')

        if (accessToken && refreshToken) {
          console.log('Processing magic link authentication...')
          
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('Error setting session:', error)
            router.push('/auth/login?error=auth_failed')
            return
          }

          if (data.session) {
            console.log('Authentication successful, redirecting to home...')
            router.push('/')
            return
          }
        }

        // If no tokens found, redirect to login
        console.log('No authentication tokens found')
        router.push('/auth/login')
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/auth/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alteryx-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
