-- Fix RLS policies for email-based queries
-- Run this script in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Create new policy that allows users to view their own profile by email
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (
        email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- Also allow service role to manage users
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy for inserting new users (for webhook)
CREATE POLICY "Allow webhook to insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
