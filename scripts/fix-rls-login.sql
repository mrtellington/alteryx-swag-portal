-- Fix RLS policies for login functionality
-- Run this script in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Allow webhook to insert users" ON users;

-- Create policy that allows email-based lookups for login
CREATE POLICY "Allow email-based user lookup" ON users
    FOR SELECT USING (
        -- Allow service role full access
        auth.role() = 'service_role'
        OR
        -- Allow anonymous users to look up users by email for login
        (auth.role() = 'anon' AND email IS NOT NULL)
    );

-- Create policy for service role to manage users
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy for inserting new users (for webhook)
CREATE POLICY "Allow webhook to insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create policy for updating users
CREATE POLICY "Allow service role to update users" ON users
    FOR UPDATE USING (auth.role() = 'service_role');
