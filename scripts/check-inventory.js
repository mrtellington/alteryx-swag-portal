const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkInventory() {
  console.log('Checking inventory table...')
  
  try {
    // Check if inventory table exists and has data
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
    
    if (error) {
      console.error('Error querying inventory:', error)
      return
    }
    
    console.log('Current inventory data:', data)
    
    if (!data || data.length === 0) {
      console.log('No inventory records found. Creating default inventory...')
      
      const { data: insertData, error: insertError } = await supabase
        .from('inventory')
        .insert([
          {
            id: 1,
            product_name: 'New Hire Bundle',
            quantity_available: 100,
            created_at: new Date().toISOString()
          }
        ])
        .select()
      
      if (insertError) {
        console.error('Error creating inventory:', insertError)
      } else {
        console.log('Inventory created successfully:', insertData)
      }
    } else {
      console.log('Inventory records found:', data.length)
    }
    
  } catch (error) {
    console.error('Exception checking inventory:', error)
  }
}

checkInventory()
