const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUsersRLS() {
  console.log('=== Fixing Users Table RLS ===')
  
  try {
    // Test service role access
    console.log('\n1. Testing service role access to users table...')
    const { data: serviceData, error: serviceError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'tod.ellington@whitestonebranding.com')
    
    if (serviceError) {
      console.error('Service role error:', serviceError)
    } else {
      console.log('Service role can access users:', serviceData)
    }
    
    // Test with anon key (like the frontend)
    console.log('\n2. Testing anon access to users table...')
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
    const supabaseAnon = createClient(supabaseUrl, anonKey)
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('users')
      .select('*')
      .eq('email', 'tod.ellington@whitestonebranding.com')
    
    if (anonError) {
      console.error('Anon access error:', anonError)
      console.log('\n3. The issue is RLS blocking anon access to users table')
      console.log('You need to run this SQL in Supabase Dashboard:')
      console.log('')
      console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;')
      console.log('')
      console.log('Or create a policy that allows authenticated users to read their own profile:')
      console.log('')
      console.log('CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);')
    } else {
      console.log('Anon access works:', anonData)
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

fixUsersRLS()
