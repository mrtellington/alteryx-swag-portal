'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Package } from 'lucide-react'

interface Product {
  product_id: string
  sku: string
  name: string
  quantity_available: number
}

interface ProductCardProps {
  product: Product
  onAddToCart: (size: string) => void
  disabled?: boolean
}

export function ProductCard({ product, onAddToCart, disabled = false }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [showSizeError, setShowSizeError] = useState(false)

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true)
      return
    }
    setShowSizeError(false)
    onAddToCart(selectedSize)
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-w-1 aspect-h-1 w-full">
        <div className="w-full h-64 relative overflow-hidden">
          <Image
            src="/images/New Hire Bundle.jpg"
            alt="New Hire Bundle - Alteryx branded merchandise including tote bag, water bottle, t-shirt, cap, and welcome card"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">This Bundle Includes:</p>
          <ul className="text-gray-600 text-sm space-y-1 mb-4">
            <li>• Tote</li>
            <li>• Hat</li>
            <li>• Sticker</li>
            <li>• Water Bottle</li>
            <li>• Alteryx Tee</li>
          </ul>
        </div>

        {/* Size Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size)
                  setShowSizeError(false)
                }}
                className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors duration-200 ${
                  selectedSize === size
                    ? 'bg-alteryx-blue text-white border-alteryx-blue'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-alteryx-blue hover:text-alteryx-blue'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {showSizeError && (
            <p className="mt-1 text-sm text-red-600">Please select a size</p>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-alteryx-blue">FREE</span>
            <p className="text-sm text-gray-500">No payment required</p>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={disabled}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-alteryx-blue hover:bg-alteryx-dark-blue text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Limit: 1 per employee
          </p>
        </div>
      </div>
    </div>
  )
}
