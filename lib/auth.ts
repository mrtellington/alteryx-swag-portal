import { supabase } from './supabase'
import { User } from './supabase'

export const isAlteryxEmail = (email: string): boolean => {
  const allowedDomains = ['@alteryx.com', '@whitestonebranding.com']
  const allowedEmails = ['tod.ellington@whitestonebranding.com', 'admin@whitestonebranding.com']
  
  // Check if it's one of the specific allowed emails
  if (allowedEmails.includes(email.toLowerCase())) {
    return true
  }
  
  // Check if it ends with allowed domains
  return allowedDomains.some(domain => email.toLowerCase().endsWith(domain))
}

export const signInWithEmail = async (email: string) => {
  if (!isAlteryxEmail(email)) {
    throw new Error('Only @alteryx.com email addresses are allowed')
  }

  console.log('Attempting to send magic link to:', email)
  console.log('Redirect URL:', `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`)

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Supabase auth error:', error)
    throw error
  }
  
  console.log('Magic link sent successfully:', data)
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getUserProfile = async (userId: string): Promise<User | null> => {
  // Query the users table by user ID (which now matches the auth user ID)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('No user profile found for user ID:', userId)
      return null
    }
    console.error('Error getting user profile:', error)
    throw error
  }

  return data
}

export const getUserProfileByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('No user profile found for email:', email)
      return null
    }
    console.error('Error getting user profile by email:', error)
    throw error
  }

  return data
}

export const isUserInvited = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('invited')
    .eq('email', email.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return false // No rows returned
    throw error
  }

  return data?.invited || false
}

export const hasUserOrdered = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('order_submitted')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data?.order_submitted || false
}
