'use client'

import { useState } from 'react'
import { ProductCard } from './ProductCard'
import { CartPage } from './CartPage'
import { HeaderSimple } from '../layout/HeaderSimple'
import { Footer } from '../layout/Footer'
import { Banner } from '../layout/Banner'
import toast from 'react-hot-toast'

interface Inventory {
  product_id: string
  sku: string
  name: string
  quantity_available: number
}

// Mock inventory data
const mockInventory: Inventory = {
  product_id: 'alteryx-new-hire-bundle-001',
  sku: 'AX-NEW-HIRE-001',
  name: 'New Hire Bundle',
  quantity_available: 100
}

// Mock user data
const mockUser = {
  id: 'test-user-id',
  email: 'tod.ellington@whitestonebranding.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z'
}

const mockProfile = {
  id: 'cf021620-69b1-4ea5-9d92-ae6d37511afc',
  email: 'tod.ellington@whitestonebranding.com',
  invited: true,
  first_name: 'Tod',
  last_name: 'Ellington',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'United States',
  phone_number: '',
  order_submitted: false
}

export function StorePageSimple() {
  const [userHasOrdered, setUserHasOrdered] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [inventory, setInventory] = useState<Inventory>(mockInventory)

  const handleAddToCart = (size: string) => {
    if (userHasOrdered) {
      toast.error('You have already placed an order')
      return
    }
    setSelectedSize(size)
    setShowCart(true)
  }

  const handleOrderComplete = () => {
    setUserHasOrdered(true)
    setShowCart(false)
    setSelectedSize('')
    // Update inventory
    setInventory({
      ...inventory,
      quantity_available: inventory.quantity_available - 1
    })
    toast.success('Order placed successfully!')
  }

  const handleBackToStore = () => {
    setShowCart(false)
    setSelectedSize('')
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderSimple />
        <CartPage
          selectedSize={selectedSize}
          onBack={handleBackToStore}
          onComplete={handleOrderComplete}
          user={mockUser}
          profile={mockProfile}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSimple />
      <Banner />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome to Alteryx Swag
          </h1>
          <p className="text-gray-600">
            Hello, {mockProfile.first_name} {mockProfile.last_name}! Order your exclusive Alteryx swag.
          </p>
        </div>

        {userHasOrdered ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500">
              Note: You can only order one item per lifetime.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard
              product={inventory}
              onAddToCart={handleAddToCart}
              disabled={inventory.quantity_available <= 0}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
