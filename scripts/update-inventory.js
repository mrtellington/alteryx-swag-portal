const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2Nzg1NSwiZXhwIjoyMDcwNDQzODU1fQ.iqVe2SRCw8ygSs8WGK5gIb-gTfG6dM6vqksZR9EuPGM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateInventory() {
  console.log('=== Updating Inventory Quantity ===')
  
  try {
    // First check current inventory
    console.log('\n1. Checking current inventory...')
    const { data: currentData, error: currentError } = await supabase
      .from('inventory')
      .select('*')
    
    if (currentError) {
      console.error('Error checking inventory:', currentError)
      return
    }
    
    console.log('Current inventory:', currentData)
    
    // Update quantity to 100 if it's 0 or less
    if (currentData && currentData.length > 0) {
      const item = currentData[0]
      console.log(`\n2. Current quantity: ${item.quantity_available}`)
      
      if (item.quantity_available <= 0) {
        console.log('Quantity is 0 or less, updating to 100...')
        
        const { data: updateData, error: updateError } = await supabase
          .from('inventory')
          .update({ quantity_available: 100 })
          .eq('product_id', item.product_id)
          .select()
        
        if (updateError) {
          console.error('Error updating inventory:', updateError)
        } else {
          console.log('Inventory updated successfully:', updateData)
        }
      } else {
        console.log('Quantity is already greater than 0, no update needed')
      }
    } else {
      console.log('No inventory records found')
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

updateInventory()
