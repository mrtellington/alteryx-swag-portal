'use client'

import { useSupabase } from '@/components/providers/SupabaseProvider'
import { signOut } from '@/lib/auth'
import { LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

export function Header() {
  const { user, profile } = useSupabase()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      // Force a page reload to clear any cached state
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-alteryx-blue">
                Alteryx Swag Portal
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                <span>{profile?.full_name || user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
