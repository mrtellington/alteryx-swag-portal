const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

async function checkInventoryRLS() {
  console.log('=== Checking Inventory RLS Policies ===')
  
  try {
    // Test with service role (should work)
    console.log('\n1. Testing with SERVICE ROLE...')
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('inventory')
      .select('*')
    
    if (serviceError) {
      console.error('Service role error:', serviceError)
    } else {
      console.log('Service role success:', serviceData)
    }
    
    // Test with anon role (might be blocked by RLS)
    console.log('\n2. Testing with ANON ROLE...')
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('inventory')
      .select('*')
    
    if (anonError) {
      console.error('Anon role error:', anonError)
    } else {
      console.log('Anon role success:', anonData)
    }
    
    // Check RLS policies
    console.log('\n3. Checking RLS policies...')
    const { data: policies, error: policiesError } = await supabaseService
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'inventory')
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError)
    } else {
      console.log('Inventory table policies:', policies)
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

checkInventoryRLS()
