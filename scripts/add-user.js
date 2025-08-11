const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addUser() {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'tod.ellington@whitestonebranding.com',
        invited: true,
        full_name: 'Tod Ellington',
        shipping_address: 'Please update with your shipping address',
        order_submitted: false
      })
      .select()

    if (error) {
      if (error.code === '23505') {
        console.log('✅ User already exists, updating...')
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({
            invited: true,
            full_name: 'Tod Ellington'
          })
          .eq('email', 'tod.ellington@whitestonebranding.com')
          .select()

        if (updateError) {
          console.error('❌ Error updating user:', updateError)
        } else {
          console.log('✅ User updated successfully:', updateData)
        }
      } else {
        console.error('❌ Error adding user:', error)
      }
    } else {
      console.log('✅ User added successfully:', data)
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

addUser()
