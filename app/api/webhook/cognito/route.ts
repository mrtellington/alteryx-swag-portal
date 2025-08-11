import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAlteryxEmail } from '@/lib/auth'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate webhook secret if provided
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Extract user data from Cognito Forms submission
    const { 
      'Full Name': fullName,
      'Email Address': email,
      'Shipping Address': shippingAddress,
      // Add other fields as needed based on your Cognito Form structure
    } = body

    if (!fullName || !email || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email domain
    if (!isAlteryxEmail(email)) {
      return NextResponse.json(
        { error: 'Only @alteryx.com email addresses are allowed' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        full_name: fullName,
        shipping_address: shippingAddress,
        invited: true,
        order_submitted: false,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    console.log('New user created via webhook:', newUser.id)

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
