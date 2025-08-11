'use client'

import { useState, useEffect, useRef } from 'react'
import { CartPage } from '@/components/store/CartPage'

// Mock user and profile for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@alteryx.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z'
}

const mockProfile = {
  id: 'test-profile-id',
  email: 'test@alteryx.com',
  invited: true,
  first_name: 'Test',
  last_name: 'User',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip_code: '',
  country: '',
  phone_number: '',
  order_submitted: false
}

export default function TestAutocompletePage() {
  const [showCart, setShowCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState('M')

  const handleAddToCart = (size: string) => {
    setSelectedSize(size)
    setShowCart(true)
  }

  const handleOrderComplete = () => {
    setShowCart(false)
    alert('Order completed! (This is just a test)')
  }

  const handleBackToStore = () => {
    setShowCart(false)
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-4">
            <button
              onClick={handleBackToStore}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Test
            </button>
          </div>
          <CartPage
            selectedSize={selectedSize}
            onBack={handleBackToStore}
            onComplete={handleOrderComplete}
            user={mockUser}
            profile={mockProfile}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">International Address Autocomplete Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Instructions</h2>
          <div className="space-y-4">
            <p>This page tests the international address autocomplete functionality without requiring authentication.</p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What to Test:</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Click "Test Address Autocomplete" below</li>
                <li>In the address field, type: <code className="bg-blue-100 px-1 rounded">123 Main St, London</code></li>
                <li>Look for autocomplete suggestions to appear</li>
                <li>Try other international addresses like: <code className="bg-blue-100 px-1 rounded">456 Rue de la Paix, Paris</code></li>
              </ul>
            </div>
            
            <button
              onClick={() => handleAddToCart('M')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Address Autocomplete
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">Expected Results</h2>
          <div className="space-y-3 text-yellow-800">
            <p><strong>✅ Success:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Autocomplete suggestions appear when typing</li>
              <li>International addresses are included in suggestions</li>
              <li>Form fields auto-populate when selecting a suggestion</li>
              <li>No JavaScript errors in browser console</li>
            </ul>
            
            <p className="mt-4"><strong>❌ If Not Working:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check browser console for errors</li>
              <li>Try different browsers (Chrome, Firefox, Safari)</li>
              <li>Check if suggestions are hidden behind other elements</li>
              <li>Verify Google Maps API key is working</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
