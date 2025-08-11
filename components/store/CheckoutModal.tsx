'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@supabase/supabase-js'
import { X, Check, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  size: z.string().min(1, 'Size is required'),
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

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  user: User | null
  profile: any
}

export function CheckoutModal({ isOpen, onClose, onComplete, user, profile }: CheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: user?.email || '',
      size: '',
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

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      toast.error('User not authenticated')
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
          size: data.size,
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
      
      // Close modal after a delay
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

  if (!isOpen) return null

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Package className="h-4 w-4 mr-1" />
            <span>Your swag will be shipped to your address</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Your Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

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
              <label htmlFor="size" className="form-label">
                Size
              </label>
              <select
                {...register('size')}
                id="size"
                className={`form-input ${errors.size ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select a size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="2XL">2XL</option>
                <option value="3XL">3XL</option>
                <option value="4XL">4XL</option>
              </select>
              {errors.size && (
                <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address1" className="form-label">
                Address Line 1
              </label>
              <input
                {...register('address1')}
                type="text"
                id="address1"
                className={`form-input ${errors.address1 ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.address1 && (
                <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
              )}
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

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
