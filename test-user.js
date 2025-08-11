const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUser() {
  try {
    console.log('Testing user lookup for: tod.ellington@whitestonebranding.com')
    
    // Test 1: Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'tod.ellington@whitestonebranding.com')
      .single()

    if (userError) {
      console.error('❌ Error finding user:', userError)
    } else {
      console.log('✅ User found:', user)
    }

    // Test 2: Check if user is invited
    const { data: invited, error: invitedError } = await supabase
      .from('users')
      .select('invited')
      .eq('email', 'tod.ellington@whitestonebranding.com')
      .single()

    if (invitedError) {
      console.error('❌ Error checking invitation:', invitedError)
    } else {
      console.log('✅ Invitation status:', invited)
    }

    // Test 3: Check if user has ordered
    const { data: ordered, error: orderedError } = await supabase
      .from('users')
      .select('order_submitted')
      .eq('email', 'tod.ellington@whitestonebranding.com')
      .single()

    if (orderedError) {
      console.error('❌ Error checking order status:', orderedError)
    } else {
      console.log('✅ Order status:', ordered)
    }

    // Test 4: List all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('email, invited, order_submitted')

    if (allUsersError) {
      console.error('❌ Error listing users:', allUsersError)
    } else {
      console.log('✅ All users in database:', allUsers)
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testUser()
