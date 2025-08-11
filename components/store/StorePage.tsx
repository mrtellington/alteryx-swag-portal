'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { ProductCard } from './ProductCard'
import { CartPage } from './CartPage'
import { Header } from '../layout/Header'
import { Banner } from '../layout/Banner'
import { supabase } from '@/lib/supabase'
import { hasUserOrdered } from '@/lib/auth'
import toast from 'react-hot-toast'

interface Inventory {
  product_id: string
  sku: string
  name: string
  quantity_available: number
}

export function StorePage() {
  const { user, profile } = useSupabase()
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [userHasOrdered, setUserHasOrdered] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .single()

        if (inventoryError) throw inventoryError
        setInventory(inventoryData)

        // Check if user has already ordered
        if (user) {
          const hasOrdered = await hasUserOrdered(user.id)
          setUserHasOrdered(hasOrdered)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load store data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

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
    // Refresh inventory
    if (inventory) {
      setInventory({
        ...inventory,
        quantity_available: inventory.quantity_available - 1
      })
    }
  }

  const handleBackToStore = () => {
    setShowCart(false)
    setSelectedSize('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
      </div>
    )
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />
      <Banner />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome to Alteryx Swag
          </h1>
          <p className="text-gray-600">
            Hello, {profile?.full_name}! Order your exclusive Alteryx swag.
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
            {inventory && (
              <ProductCard
                product={inventory}
                onAddToCart={handleAddToCart}
                disabled={inventory.quantity_available <= 0}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
