import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get user profile using service key (bypasses RLS)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          authorized: false, 
          reason: 'User not found' 
        })
      }
      throw error
    }

    if (!user) {
      return NextResponse.json({ 
        authorized: false, 
        reason: 'User not found' 
      })
    }

    // Check authorization
    if (user.order_submitted) {
      return NextResponse.json({ 
        authorized: false, 
        reason: 'Already ordered' 
      })
    }

    if (!user.invited) {
      return NextResponse.json({ 
        authorized: false, 
        reason: 'Not invited' 
      })
    }

    return NextResponse.json({ 
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        invited: user.invited,
        order_submitted: user.order_submitted
      }
    })

  } catch (error) {
    console.error('Error checking authorization:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
