const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixInventoryRLS() {
  console.log('=== Fixing Inventory RLS Policies ===')
  
  try {
    // Enable RLS on inventory table
    console.log('\n1. Enabling RLS on inventory table...')
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;'
    })
    
    if (enableError) {
      console.log('RLS already enabled or error:', enableError)
    } else {
      console.log('RLS enabled successfully')
    }
    
    // Drop existing policies
    console.log('\n2. Dropping existing policies...')
    const { error: drop1Error } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Allow authenticated users to read inventory" ON inventory;'
    })
    
    const { error: drop2Error } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Allow anon users to read inventory" ON inventory;'
    })
    
    console.log('Policies dropped')
    
    // Create new policies
    console.log('\n3. Creating new policies...')
    const { error: policy1Error } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Allow authenticated users to read inventory" 
            ON inventory 
            FOR SELECT 
            TO authenticated 
            USING (true);`
    })
    
    if (policy1Error) {
      console.error('Error creating authenticated policy:', policy1Error)
    } else {
      console.log('Authenticated policy created')
    }
    
    const { error: policy2Error } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Allow anon users to read inventory" 
            ON inventory 
            FOR SELECT 
            TO anon 
            USING (true);`
    })
    
    if (policy2Error) {
      console.error('Error creating anon policy:', policy2Error)
    } else {
      console.log('Anon policy created')
    }
    
    // Grant permissions
    console.log('\n4. Granting permissions...')
    const { error: grant1Error } = await supabase.rpc('exec_sql', {
      sql: 'GRANT SELECT ON inventory TO authenticated;'
    })
    
    const { error: grant2Error } = await supabase.rpc('exec_sql', {
      sql: 'GRANT SELECT ON inventory TO anon;'
    })
    
    console.log('Permissions granted')
    
    // Test the fix
    console.log('\n5. Testing the fix...')
    const { data: testData, error: testError } = await supabase
      .from('inventory')
      .select('*')
    
    if (testError) {
      console.error('Test query failed:', testError)
    } else {
      console.log('Test query succeeded:', testData)
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

fixInventoryRLS()
