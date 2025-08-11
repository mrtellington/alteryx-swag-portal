import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return handleSignOut(request)
}

export async function POST(request: NextRequest) {
  return handleSignOut(request)
}

async function handleSignOut(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
    }

    // Redirect to home page after successful sign out
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    return NextResponse.redirect(new URL('/', appUrl))
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
