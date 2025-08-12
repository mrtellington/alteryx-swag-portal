'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { User } from '@supabase/supabase-js'
import { CartPage } from './CartPage'
import { HeaderSimple } from '../layout/HeaderSimple'
import { Footer } from '../layout/Footer'
import { Banner } from '../layout/Banner'
import { useSupabase } from '../providers/SupabaseProvider'
import { signOut } from '@/lib/auth'
import toast from 'react-hot-toast'

interface StorePageProps {
  user: User
  profile: any
}

export function StorePage({ user, profile }: StorePageProps) {
  const [showCart, setShowCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [inventory, setInventory] = useState<{ quantity_available: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()

  useEffect(() => {
    const checkInventory = async () => {
      console.log('StorePage: Starting inventory check...')
      
      // Add a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.log('StorePage: Inventory query timeout reached')
        setInventory(null)
        setLoading(false)
        toast.error('Failed to load inventory - timeout')
      }, 5000) // 5 second timeout
      
      try {
        console.log('StorePage: Querying inventory table...')
        const { data, error } = await supabase
          .from('inventory')
          .select('quantity_available, name, sku')
          .single()

        // Clear the timeout since we got a response
        clearTimeout(timeoutId)

        if (error) {
          console.error('StorePage: Error fetching inventory:', error)
          toast.error('Failed to load inventory')
          // Set inventory to null but still set loading to false
          setInventory(null)
        } else {
          console.log('StorePage: Inventory loaded successfully:', data)
          setInventory(data)
        }
      } catch (error) {
        // Clear the timeout since we got an exception
        clearTimeout(timeoutId)
        console.error('StorePage: Exception checking inventory:', error)
        toast.error('Failed to load inventory')
        // Set inventory to null but still set loading to false
        setInventory(null)
      } finally {
        console.log('StorePage: Setting loading to false')
        setLoading(false)
      }
    }

    if (supabase) {
      checkInventory()
    } else {
      console.log('StorePage: Supabase client not available, setting loading to false')
      setLoading(false)
    }
  }, [supabase])

  const handleAddToCart = (size: string) => {
    if (profile?.order_submitted) {
      toast.error('You have already redeemed your New Hire Bundle')
      return
    }
    
    if (!inventory || inventory.quantity_available <= 0) {
      toast.error('Product is currently out of stock')
      return
    }
    
    setSelectedSize(size)
    setShowCart(true)
  }

  const handleOrderComplete = async () => {
    setShowCart(false)
    setSelectedSize('')
    
    // Update inventory
    if (inventory) {
      setInventory({
        ...inventory,
        quantity_available: inventory.quantity_available - 1
      })
    }
    
    toast.success('Order placed successfully!')
  }

  const handleBackToStore = () => {
    setShowCart(false)
    setSelectedSize('')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderSimple />
        <CartPage
          selectedSize={selectedSize}
          onBack={handleBackToStore}
          onComplete={handleOrderComplete}
          user={user}
          profile={profile}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSimple />
      <Banner />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile?.order_submitted ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bundle Already Redeemed!</h2>
            <p className="text-gray-600 mb-4">
              You have already redeemed your New Hire Bundle. Thank you for being part of the Alteryx family!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can only redeem one bundle per lifetime.
            </p>
            <button
              onClick={handleSignOut}
              className="btn-secondary"
            >
              Sign Out
            </button>
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
                {/* User Welcome */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-1">
                    Welcome, {profile?.first_name} {profile?.last_name}!
                  </h3>
                  <p className="text-sm text-blue-700">
                    You're eligible to redeem your New Hire Bundle.
                  </p>
                </div>

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
                    disabled={!selectedSize || loading || (inventory?.quantity_available || 0) <= 0}
                    className={`w-full flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                      !selectedSize || loading || (inventory?.quantity_available || 0) <= 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-alteryx-blue hover:bg-alteryx-dark-blue text-white'
                    }`}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    {loading ? 'Loading...' : (inventory?.quantity_available || 0) <= 0 ? 'Out of Stock' : 'Add to cart'}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Limit: 1 per employee
                  </p>
                  
                  {inventory && (
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {inventory.quantity_available} bundles remaining
                    </p>
                  )}
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
