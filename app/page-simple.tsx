'use client'

import { LoginPage } from '@/components/auth/LoginPage'

export default function HomePageSimple() {
  // Bypass authentication for now - just show login page
  return <LoginPage />
}
