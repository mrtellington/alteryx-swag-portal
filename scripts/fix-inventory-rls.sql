-- Fix RLS policies for inventory table
-- Run this script in your Supabase SQL editor

-- Drop existing policies on inventory table
DROP POLICY IF EXISTS "Allow authenticated users to view inventory" ON inventory;
DROP POLICY IF EXISTS "Allow service role to manage inventory" ON inventory;

-- Create a simple policy that allows authenticated users to view inventory
CREATE POLICY "Allow authenticated users to view inventory" ON inventory
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows service role to manage inventory
CREATE POLICY "Allow service role to manage inventory" ON inventory
    FOR ALL USING (auth.role() = 'service_role');

-- Also fix users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON users;

-- Create a simple policy that allows authenticated users to view any user profile
CREATE POLICY "Authenticated users can view user profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Keep the service role policy
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');
