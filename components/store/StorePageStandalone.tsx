'use client'

import React, { useState } from 'react'
import Image from 'next/image'
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

export function StorePageStandalone() {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Product Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative w-full h-96">
                    <Image
                      src="/images/New Hire Bundle.jpg"
                      alt="New Hire Bundle - Alteryx branded merchandise including tote bag, water bottle, t-shirt, cap, and welcome card"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="flex flex-col justify-center">
              <div className="max-w-md">
                <h1 className="text-4xl font-semibold text-gray-900 mb-4">New Hire Bundle</h1>
                <p className="text-gray-600 mb-4">This Bundle Includes:</p>
                <ul className="text-gray-600 text-lg space-y-2 mb-8">
                  <li>• Tote</li>
                  <li>• Hat</li>
                  <li>• Sticker</li>
                  <li>• Water Bottle</li>
                  <li>• Alteryx Tee</li>
                </ul>
                
                {/* Size Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-3 text-sm font-medium rounded border transition-colors duration-200 ${
                          selectedSize === size
                            ? 'bg-alteryx-blue text-white border-alteryx-blue'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-alteryx-blue'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-alteryx-blue">FREE</span>
                    <p className="text-sm text-gray-500">No payment required</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!selectedSize) {
                        toast.error('Please select a size')
                        return
                      }
                      handleAddToCart(selectedSize)
                    }}
                    disabled={!selectedSize}
                    className={`w-full flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                      !selectedSize
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-alteryx-blue hover:bg-alteryx-dark-blue text-white'
                    }`}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    Add to cart
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Limit: 1 per employee
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
