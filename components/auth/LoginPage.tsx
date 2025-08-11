'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInWithEmail, isAlteryxEmail, isUserInvited, getUserProfileByEmail } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Mail, Lock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [userStatus, setUserStatus] = useState<{
    isInvited: boolean
    hasOrdered: boolean
    userProfile: any
  } | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const email = watch('email')
  const isValidEmail = email && isAlteryxEmail(email)

  const checkUserStatus = async (email: string) => {
    try {
      const [isInvited, userProfile] = await Promise.all([
        isUserInvited(email),
        getUserProfileByEmail(email)
      ])
      
      setUserStatus({
        isInvited,
        hasOrdered: userProfile?.order_submitted || false,
        userProfile
      })
    } catch (error) {
      console.error('Error checking user status:', error)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    if (!isAlteryxEmail(data.email)) {
      toast.error('Only @alteryx.com and @whitestonebranding.com email addresses are allowed')
      return
    }

    setIsLoading(true)
    try {
      // Check user status first
      await checkUserStatus(data.email)

      // If user has already ordered, show message and don't proceed
      if (userStatus?.hasOrdered) {
        toast.error('You have already redeemed your New Hire Bundle. Thank you!')
        return
      }

      // If user is not invited, show message and don't proceed
      if (!userStatus?.isInvited) {
        toast.error('You are not authorized to access the New Hire Bundle. Please contact your administrator.')
        return
      }

      await signInWithEmail(data.email)
      setEmailSent(true)
      toast.success('Check your email for the login link!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send login email')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a secure login link to your email address. Click the link to access the Alteryx Swag Portal.
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="btn-secondary"
          >
            Try a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-alteryx-blue mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Alteryx Swag</h1>
          <p className="text-gray-600 mt-2">Redeem your New Hire Bundle</p>
        </div>

        {/* User Status Display */}
        {userStatus && (
          <div className="mb-6 p-4 rounded-lg border">
            {userStatus.hasOrdered ? (
              <div className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Bundle Already Redeemed</span>
              </div>
            ) : !userStatus.isInvited ? (
              <div className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Not Authorized</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Ready to Redeem</span>
              </div>
            )}
            
            {userStatus.userProfile && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Welcome, {userStatus.userProfile.first_name} {userStatus.userProfile.last_name}!</p>
                <p>Email: {userStatus.userProfile.email}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`form-input pr-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your.name@alteryx.com"
                disabled={isLoading}
                onBlur={(e) => {
                  if (e.target.value && isAlteryxEmail(e.target.value)) {
                    checkUserStatus(e.target.value)
                  }
                }}
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
            {email && !isValidEmail && (
              <p className="mt-1 text-sm text-red-600">
                Only @alteryx.com and @whitestonebranding.com email addresses are allowed
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValidEmail || (userStatus?.hasOrdered) || (!userStatus?.isInvited)}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Sending login link...
              </div>
            ) : userStatus?.hasOrdered ? (
              'Bundle Already Redeemed'
            ) : !userStatus?.isInvited ? (
              'Not Authorized'
            ) : (
              'Send Login Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have access? Contact your administrator to request an invitation.
          </p>
        </div>
      </div>
    </div>
  )
}
