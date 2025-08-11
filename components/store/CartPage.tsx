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
              componentRestrictions?: { country?: string }
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
    initGoogleMaps: () => void
    initGoogleMapsDebug: () => void
  }
}

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  zipCode: z.string().min(1, 'Postal code is required'),
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
    setValue,
    trigger,
    watch,
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
      country: profile?.country || '',
      phoneNumber: profile?.phone_number || '',
      confirmOrder: false,
    },
  })

  // Initialize Google Places Autocomplete
  useEffect(() => {
    console.log('CartPage useEffect - checking environment variables...')
    console.log('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY exists:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
    console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const initAutocomplete = () => {
      console.log('Initializing Google Maps Autocomplete...')
      if (typeof window !== 'undefined' && window.google && addressInputRef.current) {
        console.log('Google Maps loaded, creating autocomplete...')
        console.log('Available Google Maps APIs:', Object.keys(window.google.maps))
        console.log('Places API available:', !!window.google.maps.places)
        
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          fields: ['place_id', 'formatted_address', 'address_components']
          // No componentRestrictions means worldwide search
        })

        autocomplete.addListener('place_changed', () => {
          console.log('Place changed event fired')
          const place = autocomplete.getPlace()
          console.log('Selected place:', place)
          console.log('Place ID:', place.place_id)
          console.log('Formatted address:', place.formatted_address)
          if (place.place_id) {
            getPlaceDetails(place.place_id)
          } else {
            console.warn('No place_id found in selected place')
          }
        })

        // Add listener for when user starts typing
        autocomplete.addListener('place_changed', () => {
          console.log('Autocomplete suggestions should be visible now')
        })

        autocompleteRef.current = autocomplete
        console.log('Autocomplete initialized successfully')
      } else {
        console.log('Google Maps not available or address input not found')
        if (typeof window !== 'undefined') {
          console.log('window.google exists:', !!window.google)
          console.log('addressInputRef.current exists:', !!addressInputRef.current)
        }
      }
    }

    // Load Google Maps script if not already loaded
    if (typeof window !== 'undefined' && !window.google) {
      console.log('Loading Google Maps script...')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyA_hkb41owh55NAXg-PEqeiEC1aTRGfKPg'
      console.log('API Key length:', apiKey ? apiKey.length : 0)
      console.log('API Key being used:', apiKey ? 'Present' : 'Missing')
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
      script.async = true
      script.defer = true
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error)
        console.error('API Key being used:', apiKey ? 'Present' : 'Missing')
        console.error('This might be due to:')
        console.error('1. Invalid API key')
        console.error('2. Places API not enabled in Google Cloud Console')
        console.error('3. Billing not enabled for the project')
        console.error('4. API key restrictions (domain, IP, etc.)')
      }
      
      // Define the callback function globally
      window.initGoogleMaps = () => {
        console.log('Google Maps script loaded successfully')
        console.log('window.google exists:', !!window.google)
        console.log('window.google.maps exists:', !!(window.google && window.google.maps))
        console.log('window.google.maps.places exists:', !!(window.google && window.google.maps && window.google.maps.places))
        console.log('window.google.maps.places.Autocomplete exists:', !!(window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete))
        
        if (window.google && window.google.maps && window.google.maps.places) {
          initAutocomplete()
        } else {
          console.error('Google Maps Places API not available')
        }
      }
      
      document.head.appendChild(script)
    } else if (typeof window !== 'undefined' && window.google) {
      console.log('Google Maps already loaded, checking availability...')
      console.log('window.google.maps.places exists:', !!(window.google && window.google.maps && window.google.maps.places))
      if (window.google.maps && window.google.maps.places) {
        initAutocomplete()
      } else {
        console.error('Google Maps Places API not available')
      }
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  // Watch form values to update address validation status
  const watchedValues = watch(['address1', 'city', 'state', 'zipCode', 'country'])
  
  useEffect(() => {
    // If all address fields are filled and we have a validated address, keep the validation status
    const allFieldsFilled = watchedValues.every(value => value && value.trim() !== '')
    if (allFieldsFilled && addressValidation?.isValid) {
      setIsAddressValid(true)
    }
  }, [watchedValues, addressValidation])

  // Test function to check if autocomplete is working
  const testAutocomplete = () => {
    console.log('=== AUTCOMPLETE DEBUG INFO ===')
    console.log('Environment variables:')
    console.log('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing')
    console.log('Google Maps loaded:', typeof window !== 'undefined' && !!window.google)
    console.log('Places API available:', typeof window !== 'undefined' && !!(window.google && window.google.maps && window.google.maps.places))
    
    if (autocompleteRef.current) {
      console.log('Autocomplete instance exists:', !!autocompleteRef.current)
      console.log('Autocomplete configuration:', autocompleteRef.current)
    } else {
      console.log('No autocomplete instance found')
    }
    
    // Test API directly
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyA_hkb41owh55NAXg-PEqeiEC1aTRGfKPg'
    console.log('Testing API with key:', apiKey.substring(0, 10) + '...')
    
    fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=London&types=address&key=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        console.log('API Test Result:', data)
        if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
          console.log('✅ API is working - found', data.predictions.length, 'suggestions')
          data.predictions.forEach((pred: any, index: number) => {
            console.log(`  ${index + 1}. ${pred.description}`)
          })
        } else {
          console.log('❌ API returned error:', data.status, data.error_message)
        }
      })
      .catch(error => {
        console.error('❌ API test failed:', error)
      })
  }

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
        // Populate form fields with validated address using React Hook Form
        const { address1, city, state, zipCode, country } = result.validatedAddress
        
        // Update form values using React Hook Form's setValue
        setValue('address1', address1)
        setValue('city', city)
        setValue('state', state)
        setValue('zipCode', zipCode)
        setValue('country', country)
        
        // Trigger validation to clear any existing errors
        trigger(['address1', 'city', 'state', 'zipCode', 'country'])

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

    // Trigger validation for all fields
    const isValid = await trigger()
    if (!isValid) {
      toast.error('Please fill in all required fields')
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
                  placeholder="Start typing your address (supports international addresses)..."
                  className={`form-input ${errors.address1 ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                  style={{ position: 'relative', zIndex: 1000 }}
                  onFocus={() => {
                    console.log('Address input focused - autocomplete should be active')
                    console.log('Autocomplete instance:', !!autocompleteRef.current)
                  }}
                  onChange={(e) => {
                    console.log('Address input changed:', e.target.value)
                    if (e.target.value.length > 3) {
                      console.log('Should show autocomplete suggestions for:', e.target.value)
                    }
                  }}
                />
                {errors.address1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Start typing to see address suggestions (supports international addresses)
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  Try typing addresses from different countries (e.g., "123 Main St, London" or "456 Rue de la Paix, Paris")
                </p>
                <button
                  type="button"
                  onClick={testAutocomplete}
                  className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Test Autocomplete (check console)
                </button>
                
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <p className="font-medium">Quick Test:</p>
                  <p>1. Type "123 Main St, London" in the address field above</p>
                  <p>2. You should see suggestions appear</p>
                  <p>3. Click on a suggestion to auto-fill the form</p>
                </div>
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
                    State/Province
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
                    Postal Code
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
              
              {/* Form Status Indicator */}
              {isAddressValid && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Address validated and form ready for submission</span>
                  </div>
                </div>
              )}
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
                  <p>Your order will ship via USPS Ground Advantage (domestic) or USPS International (international) and take up to 3 business days for domestic orders.</p>
                  <p className="mt-1 text-xs">International orders may take 2-3 weeks for delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
