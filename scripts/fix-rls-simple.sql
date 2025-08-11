-- Simple RLS policy fix
-- Run this script in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Create a simple policy that allows authenticated users to view any user profile
-- This is for development - in production you'd want more restrictive policies
CREATE POLICY "Authenticated users can view user profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Keep the service role policy
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');
