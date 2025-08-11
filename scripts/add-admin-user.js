const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addAdminUser() {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'admin@whitestonebranding.com',
        invited: true,
        first_name: 'Admin',
        last_name: 'User',
        address1: 'Please update with your address',
        city: 'Please update',
        state: 'Please update',
        zip_code: 'Please update',
        country: 'United States',
        phone_number: 'Please update',
        order_submitted: false
      })
      .select()

    if (error) {
      if (error.code === '23505') {
        console.log('✅ Admin user already exists, updating...')
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({
            invited: true,
            first_name: 'Admin',
            last_name: 'User'
          })
          .eq('email', 'admin@whitestonebranding.com')
          .select()

        if (updateError) {
          console.error('❌ Error updating admin user:', updateError)
        } else {
          console.log('✅ Admin user updated successfully:', updateData)
        }
      } else {
        console.error('❌ Error adding admin user:', error)
      }
    } else {
      console.log('✅ Admin user added successfully:', data)
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

addAdminUser()
