const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Yv6h4qOh94AuztLApbB8yM5PHcXDnBcW8FPYtmSnz1k'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUser() {
  const email = 'tod.ellington@whitestonebranding.com'
  
  console.log(`Testing user: ${email}`)
  
  try {
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      console.log('Error fetching user:', error)
      return
    }
    
    if (!user) {
      console.log('User not found')
      return
    }
    
    console.log('User found:')
    console.log('- ID:', user.id)
    console.log('- Email:', user.email)
    console.log('- Invited:', user.invited)
    console.log('- Order submitted:', user.order_submitted)
    console.log('- First name:', user.first_name)
    console.log('- Last name:', user.last_name)
    
    // List all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
    
    if (allUsersError) {
      console.log('Error fetching all users:', allUsersError)
      return
    }
    
    console.log('\nAll users in database:')
    allUsers.forEach(u => {
      console.log(`- ${u.email} (invited: ${u.invited}, ordered: ${u.order_submitted})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testUser()
