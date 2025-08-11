'use client'

import { LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

export function HeaderSimple() {
  const handleSignOut = async () => {
    try {
      // Simple sign out - just redirect to home
      toast.success('Signed out successfully')
      // Force a page reload to clear any cached state
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
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
              <div className="flex items-center">
                <span className="text-2xl font-bold text-alteryx-blue">alteryx</span>
                <span className="text-2xl font-bold text-gray-900 ml-2">Swag Store</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-alteryx-blue transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-700 hover:text-alteryx-blue transition-colors duration-200">
              <User className="h-5 w-5" />
            </button>
            <button className="text-gray-700 hover:text-alteryx-blue transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
