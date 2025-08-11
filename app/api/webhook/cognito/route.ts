import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAlteryxEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Only create Supabase client if environment variables are available
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration not available' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
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

    // Parse full name into first and last name
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Parse shipping address (basic parsing - you might want to improve this)
    const addressParts = shippingAddress.split(',')
    const address1 = addressParts[0]?.trim() || ''
    const city = addressParts[1]?.trim() || ''
    const stateZip = addressParts[2]?.trim() || ''
    
    // Basic state/zip parsing
    const stateZipParts = stateZip.split(' ')
    const state = stateZipParts[0] || ''
    const zipCode = stateZipParts.slice(1).join(' ') || ''

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

    // Create new user with new schema
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        address1: address1,
        address2: '',
        city: city,
        state: state,
        zip_code: zipCode,
        country: 'United States',
        phone_number: '',
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
