const { createClient } = require('@supabase/supabase-js')

// Supabase configuration - using the anon key like the frontend
const supabaseUrl = 'https://dnpgplnekkqckdcekfnz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGdwbG5la2txY2tkY2VrZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njc4NTUsImV4cCI6MjA3MDQ0Mzg1NX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInventoryQuery() {
  console.log('=== Testing Frontend Inventory Query ===')
  
  try {
    // Test the exact query the frontend is making
    console.log('\n1. Testing frontend query: .select("quantity_available, name, sku").single()')
    const { data, error } = await supabase
      .from('inventory')
      .select('quantity_available, name, sku')
      .single()
    
    if (error) {
      console.error('Frontend query error:', error)
    } else {
      console.log('Frontend query success:', data)
    }
    
    // Test a simpler query
    console.log('\n2. Testing simple query: .select("*")')
    const { data: simpleData, error: simpleError } = await supabase
      .from('inventory')
      .select('*')
    
    if (simpleError) {
      console.error('Simple query error:', simpleError)
    } else {
      console.log('Simple query success:', simpleData)
    }
    
    // Test just quantity_available
    console.log('\n3. Testing quantity only: .select("quantity_available")')
    const { data: qtyData, error: qtyError } = await supabase
      .from('inventory')
      .select('quantity_available')
    
    if (qtyError) {
      console.error('Quantity query error:', qtyError)
    } else {
      console.log('Quantity query success:', qtyData)
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

testInventoryQuery()
