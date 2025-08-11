const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUserRecord() {
  const email = 'tod.ellington@whitestonebranding.com'
  
  console.log(`Fixing user record for: ${email}`)
  
  try {
    // First, let's check if there's an auth user for this email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('Error listing auth users:', authError)
      return
    }
    
    const authUser = authUsers.users.find(u => u.email === email)
    
    if (!authUser) {
      console.log('No auth user found for this email. Creating one...')
      
      // Create auth user
      const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { name: 'Tod Ellington' }
      })
      
      if (createAuthError) {
        console.log('Error creating auth user:', createAuthError)
        return
      }
      
      console.log('Created auth user:', newAuthUser.user.id)
      
      // Now update the users table record to use the auth user ID
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ id: newAuthUser.user.id })
        .eq('email', email)
        .select()
      
      if (updateError) {
        console.log('Error updating user record:', updateError)
        return
      }
      
      console.log('Updated user record:', updateData)
      
    } else {
      console.log('Found auth user:', authUser.id)
      
      // Update the users table record to use the auth user ID
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ id: authUser.id })
        .eq('email', email)
        .select()
      
      if (updateError) {
        console.log('Error updating user record:', updateError)
        return
      }
      
      console.log('Updated user record:', updateData)
    }
    
    // Verify the fix
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (userError) {
      console.log('Error verifying user:', userError)
      return
    }
    
    console.log('Final user record:')
    console.log('- ID:', user.id)
    console.log('- Email:', user.email)
    console.log('- Invited:', user.invited)
    console.log('- Order submitted:', user.order_submitted)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixUserRecord()
