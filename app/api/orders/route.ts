import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      firstName, 
      lastName, 
      email, 
      size,
      address1, 
      address2, 
      city, 
      state, 
      zipCode, 
      country, 
      phoneNumber 
    } = body

    if (!userId || !firstName || !lastName || !email || !size || !address1 || !city || !state || !zipCode || !country || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user has already ordered
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('order_submitted')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error checking user order status:', userError)
      return NextResponse.json(
        { error: 'Failed to check order status' },
        { status: 500 }
      )
    }

    if (existingUser?.order_submitted) {
      return NextResponse.json(
        { error: 'User has already placed an order' },
        { status: 400 }
      )
    }

    // Check inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('quantity_available')
      .single()

    if (inventoryError) {
      console.error('Error checking inventory:', inventoryError)
      return NextResponse.json(
        { error: 'Failed to check inventory' },
        { status: 500 }
      )
    }

    if (inventory.quantity_available <= 0) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // Start transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        size: size,
        address1: address1,
        address2: address2 || null,
        city: city,
        state: state,
        zip_code: zipCode,
        country: country,
        phone_number: phoneNumber,
        date_submitted: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Update user order status
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ order_submitted: true })
      .eq('id', userId)

    if (updateUserError) {
      console.error('Error updating user order status:', updateUserError)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    // Decrement inventory
    const { error: updateInventoryError } = await supabase
      .from('inventory')
      .update({ quantity_available: inventory.quantity_available - 1 })
      .eq('quantity_available', inventory.quantity_available)

    if (updateInventoryError) {
      console.error('Error updating inventory:', updateInventoryError)
      return NextResponse.json(
        { error: 'Failed to update inventory' },
        { status: 500 }
      )
    }

    // Send confirmation email
    try {
      const fullName = `${firstName} ${lastName}`
      const shippingAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${state} ${zipCode}, ${country}`
      
      await sendOrderConfirmationEmail({
        to: email,
        fullName,
        orderId: order.id,
        shippingAddress,
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order placed successfully',
    })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
