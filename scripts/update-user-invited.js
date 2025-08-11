const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateUserInvited() {
  try {
    // Update the user's invited status to true
    const { data, error } = await supabase
      .from('users')
      .update({ invited: true })
      .eq('email', 'tod.ellington@whitestonebranding.com')
      .select()

    if (error) {
      console.error('Error updating user:', error)
      return
    }

    console.log('User updated successfully:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

updateUserInvited()
