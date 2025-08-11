'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@supabase/supabase-js'
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Google Maps types
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: {
              types?: string[]
              componentRestrictions?: { country: string }
              fields?: string[]
            }
          ) => {
            addListener: (event: string, callback: () => void) => void
            getPlace: () => { place_id?: string; formatted_address?: string }
          }
        }
        event: {
          clearInstanceListeners: (autocomplete: any) => void
        }
      }
    }
  }
}

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  confirmOrder: z.boolean().refine(val => val === true, 'You must confirm your order'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CartPageProps {
  selectedSize: string
  onBack: () => void
  onComplete: () => void
  user: User | null
  profile: any
}

export function CartPage({ selectedSize, onBack, onComplete, user, profile }: CartPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    validatedAddress?: any
    missingComponents?: string[]
  } | null>(null)
  const [isAddressValid, setIsAddressValid] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: user?.email || '',
      address1: profile?.address1 || '',
      address2: profile?.address2 || '',
      city: profile?.city || '',
      state: profile?.state || '',
      zipCode: profile?.zip_code || '',
      country: profile?.country || 'United States',
      phoneNumber: profile?.phone_number || '',
      confirmOrder: false,
    },
  })

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = () => {
      if (typeof window !== 'undefined' && window.google && addressInputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['place_id', 'formatted_address']
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.place_id) {
            getPlaceDetails(place.place_id)
          }
        })

        autocompleteRef.current = autocomplete
      }
    }

    // Load Google Maps script if not already loaded
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else {
      initAutocomplete()
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const getPlaceDetails = async (placeId: string) => {
    setIsValidatingAddress(true)
    setAddressValidation(null)
    
    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId }),
      })

      if (!response.ok) {
        throw new Error('Failed to get place details')
      }

      const result = await response.json()
      setAddressValidation(result)

      if (result.isValid && result.validatedAddress) {
        // Populate form fields with validated address
        const { address1, city, state, zipCode, country } = result.validatedAddress
        
        // Update form values
        const form = document.querySelector('form') as HTMLFormElement
        if (form) {
          const address1Input = form.querySelector('#address1') as HTMLInputElement
          const cityInput = form.querySelector('#city') as HTMLInputElement
          const stateInput = form.querySelector('#state') as HTMLInputElement
          const zipCodeInput = form.querySelector('#zipCode') as HTMLInputElement
          const countryInput = form.querySelector('#country') as HTMLInputElement

          if (address1Input) address1Input.value = address1
          if (cityInput) cityInput.value = city
          if (stateInput) stateInput.value = state
          if (zipCodeInput) zipCodeInput.value = zipCode
          if (countryInput) countryInput.value = country
        }

        setIsAddressValid(true)
        toast.success('Address validated and populated!')
      } else {
        setIsAddressValid(false)
        toast.error('Please select a complete address from the suggestions')
      }

      return result.isValid
    } catch (error) {
      console.error('Place details error:', error)
      toast.error('Failed to get address details. Please try again.')
      setIsAddressValid(false)
      return false
    } finally {
      setIsValidatingAddress(false)
    }
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    // Check if address is valid
    if (!isAddressValid) {
      toast.error('Please select a valid address from the autocomplete suggestions')
      return
    }

    setIsSubmitting(true)
    try {
      // Submit order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          size: selectedSize,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phoneNumber: data.phoneNumber,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      setOrderComplete(true)
      toast.success('Order submitted successfully!')
      
      // Close cart after a delay
      setTimeout(() => {
        onComplete()
        setOrderComplete(false)
      }, 3000)
    } catch (error) {
      console.error('Order submission error:', error)
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Package className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Truck className="h-4 w-4 mr-1" />
            <span>Your swag will be shipped to your address</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-alteryx-blue hover:text-alteryx-dark-blue transition-colors duration-200 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Store
          </button>
          <h1 className="text-3xl font-semibold text-gray-900">Your Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    id="lastName"
                    className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="address1" className="form-label">
                  Address Line 1
                </label>
                <input
                  {...register('address1')}
                  ref={addressInputRef}
                  type="text"
                  id="address1"
                  placeholder="Start typing your address..."
                  className={`form-input ${errors.address1 ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.address1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Start typing to see address suggestions
                </p>
              </div>

              <div>
                <label htmlFor="address2" className="form-label">
                  Address Line 2 (Optional)
                </label>
                <input
                  {...register('address2')}
                  type="text"
                  id="address2"
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>

              {/* Address Validation Status */}
              {addressValidation && (
                <div className={`p-3 rounded-md border ${
                  addressValidation.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start">
                    {addressValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        addressValidation.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {addressValidation.isValid 
                          ? 'Address validated successfully!' 
                          : 'Please select a complete address from the suggestions'
                        }
                      </p>
                      {!addressValidation.isValid && addressValidation.missingComponents && (
                        <p className="text-sm text-red-700 mt-1">
                          Missing: {addressValidation.missingComponents.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    id="city"
                    className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <input
                    {...register('state')}
                    type="text"
                    id="state"
                    className={`form-input ${errors.state ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zipCode" className="form-label">
                    Zip Code
                  </label>
                  <input
                    {...register('zipCode')}
                    type="text"
                    id="zipCode"
                    className={`form-input ${errors.zipCode ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    id="country"
                    className={`form-input ${errors.country ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  id="phoneNumber"
                  className={`form-input ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start mb-4">
                  <input
                    {...register('confirmOrder')}
                    type="checkbox"
                    id="confirmOrder"
                    className="mt-1 h-4 w-4 text-alteryx-blue focus:ring-alteryx-blue border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="confirmOrder" className="ml-2 text-sm text-gray-700">
                    I confirm that I want to place this order and understand this is my one-time order limit.
                  </label>
                </div>
                {errors.confirmOrder && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmOrder.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isValidatingAddress || !isAddressValid}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Submitting...
                  </div>
                ) : isValidatingAddress ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating Address...
                  </div>
                ) : !isAddressValid ? (
                  'Please Select a Valid Address'
                ) : (
                  'Checkout'
                )}
              </button>
            </form>
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Summary</h2>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">New Hire Bundle</h3>
                  <p className="text-sm text-gray-500">Size: {selectedSize}</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>• Tote</p>
                    <p>• Hat</p>
                    <p>• Sticker</p>
                    <p>• Water Bottle</p>
                    <p>• Alteryx Tee</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-alteryx-blue">FREE</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-alteryx-blue">FREE</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">No payment required</p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-start">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Shipping Information</p>
                  <p>Your order will ship via USPS Ground Advantage and take up to 3 business days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
