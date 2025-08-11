'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginPage } from '@/components/auth/LoginPage'

export default function LoginRoute() {
  const router = useRouter()

  useEffect(() => {
    // This route exists to provide a direct link to login
    // The actual login logic is handled in the main page
    console.log('Login route accessed')
  }, [])

  return <LoginPage />
}
