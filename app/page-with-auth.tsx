'use client'

import { useSupabase } from '@/components/providers/SupabaseProvider'
import { LoginPage } from '@/components/auth/LoginPage'
import { StorePage } from '@/components/store/StorePage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { user, profile, loading } = useSupabase()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <LoginPage />
  }

  if (!profile?.invited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Your account is not yet approved. Please contact your administrator to request access.
          </p>
          <button
            onClick={() => window.location.href = '/api/auth/signout'}
            className="btn-primary"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return <StorePage />
}
