import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('Environment variables check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'EXISTS' : 'MISSING')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Yv6h4qOh94AuztLApbB8yM5PHcXDnBcW8FPYtmSnz1k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  invited: boolean
  first_name: string
  last_name: string
  address1: string
  address2?: string
  city: string
  state: string
  zip_code: string
  country: string
  phone_number: string
  order_submitted: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  size: string
  address1: string
  address2?: string
  city: string
  state: string
  zip_code: string
  country: string
  phone_number: string
  date_submitted: string
}

export interface Inventory {
  product_id: string
  sku: string
  name: string
  quantity_available: number
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'date_submitted'>
        Update: Partial<Omit<Order, 'id' | 'date_submitted'>>
      }
      inventory: {
        Row: Inventory
        Insert: Inventory
        Update: Partial<Inventory>
      }
    }
  }
}
