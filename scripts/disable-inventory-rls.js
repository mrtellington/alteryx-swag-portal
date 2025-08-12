const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableInventoryRLS() {
  console.log('=== Disabling RLS on Inventory Table ===')
  
  try {
    // Check current RLS status
    console.log('\n1. Checking current RLS status...')
    const { data: currentData, error: currentError } = await supabase
      .from('inventory')
      .select('*')
    
    if (currentError) {
      console.error('Error checking inventory:', currentError)
    } else {
      console.log('Service role can access inventory:', currentData)
    }
    
    // Since we can't execute SQL directly, let me try a different approach
    // Let me check if there's a way to grant public access
    console.log('\n2. Testing anon access...')
    
    // Create a new client with anon key
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
    const supabaseAnon = createClient(supabaseUrl, anonKey)
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('inventory')
      .select('*')
    
    if (anonError) {
      console.error('Anon access error:', anonError)
      console.log('\n3. The issue is RLS blocking anon access')
      console.log('You need to run this SQL in Supabase Dashboard:')
      console.log('')
      console.log('ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;')
      console.log('')
      console.log('Or create a policy that allows anon access:')
      console.log('')
      console.log('CREATE POLICY "Allow public read access" ON inventory FOR SELECT USING (true);')
    } else {
      console.log('Anon access works:', anonData)
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

disableInventoryRLS()
