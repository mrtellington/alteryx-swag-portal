const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserProfile() {
  console.log('=== Checking User Profile ===')
  
  try {
    const email = 'tod.ellington@whitestonebranding.com'
    
    // Check auth users
    console.log('\n1. Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error checking auth users:', authError)
    } else {
      const user = authUsers.users.find(u => u.email === email)
      if (user) {
        console.log('Auth user found:', {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at
        })
        
        // Check users table
        console.log('\n2. Checking users table...')
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()
        
        if (profileError) {
          console.error('Error checking user profile:', profileError)
          
          if (profileError.code === 'PGRST116') {
            console.log('No user profile found, creating one...')
            
            // Create user profile
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert([
                {
                  id: user.id,
                  email: email,
                  first_name: 'Tod',
                  last_name: 'Ellington',
                  invited: true,
                  order_submitted: false,
                  created_at: new Date().toISOString()
                }
              ])
              .select()
            
            if (createError) {
              console.error('Error creating user profile:', createError)
            } else {
              console.log('User profile created:', newProfile)
            }
          }
        } else {
          console.log('User profile found:', userProfile)
          
          // Check if ID matches
          if (userProfile.id !== user.id) {
            console.log('ID mismatch! Updating user profile ID...')
            
            const { data: updatedProfile, error: updateError } = await supabase
              .from('users')
              .update({ id: user.id })
              .eq('email', email)
              .select()
            
            if (updateError) {
              console.error('Error updating user profile ID:', updateError)
            } else {
              console.log('User profile ID updated:', updatedProfile)
            }
          }
        }
      } else {
        console.log('Auth user not found for email:', email)
      }
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

checkUserProfile()
