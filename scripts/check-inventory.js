const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkInventory() {
  try {
    // Check if inventory exists
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')

    if (inventoryError) {
      console.error('Error checking inventory:', inventoryError)
      return
    }

    console.log('Current inventory:', inventoryData)

    if (!inventoryData || inventoryData.length === 0) {
      console.log('No inventory found, adding sample inventory...')
      
      // Add sample inventory
      const { data: newInventory, error: insertError } = await supabase
        .from('inventory')
        .insert([
          {
            product_id: 'alteryx-swag-pack-001',
            sku: 'AX-SWAG-001',
            name: 'Alteryx Employee Swag Pack',
            quantity_available: 50
          }
        ])
        .select()

      if (insertError) {
        console.error('Error inserting inventory:', insertError)
        return
      }

      console.log('Inventory added successfully:', newInventory)
    } else {
      console.log('Inventory already exists')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

checkInventory()
