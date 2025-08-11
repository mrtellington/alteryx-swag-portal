'use client'

import { LoginPage } from '@/components/auth/LoginPage'
import { StorePage } from '@/components/store/StorePage'

interface Profile {
  invited?: boolean
}

export default function HomePageDebug() {
  // Temporarily bypass authentication for debugging
  const loading = false
  const user = null
  const profile: Profile | null = null

  console.log('Debug page - loading:', loading, 'user:', user, 'profile:', profile)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('Showing login page')
    return <LoginPage />
  }

  if (!profile || !(profile as Profile).invited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Your account is not yet approved. Please contact your administrator to request access.
          </p>
        </div>
      </div>
    )
  }

  return <StorePage />
}
