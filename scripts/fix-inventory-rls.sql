-- Fix RLS policies for inventory table
-- Run this script in your Supabase SQL editor

-- Enable RLS on inventory table
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read inventory" ON inventory;
DROP POLICY IF EXISTS "Allow anon users to read inventory" ON inventory;

-- Create policy to allow authenticated users to read inventory
CREATE POLICY "Allow authenticated users to read inventory" 
ON inventory 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow anon users to read inventory (for initial loading)
CREATE POLICY "Allow anon users to read inventory" 
ON inventory 
FOR SELECT 
TO anon 
USING (true);

-- Grant necessary permissions
GRANT SELECT ON inventory TO authenticated;
GRANT SELECT ON inventory TO anon;
