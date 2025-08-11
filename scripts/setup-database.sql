-- Alteryx Swag Portal Database Setup
-- Run this script in your Supabase SQL editor

-- Create users table with updated structure
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    invited BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address1 VARCHAR(500) NOT NULL,
    address2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL DEFAULT 'United States',
    phone_number VARCHAR(50) NOT NULL,
    order_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    size VARCHAR(10) NOT NULL,
    address1 VARCHAR(500) NOT NULL,
    address2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    date_submitted TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    product_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity_available INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON inventory;
DROP POLICY IF EXISTS "Service role can manage inventory" ON inventory;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for orders table
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage orders" ON orders
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for inventory table
CREATE POLICY "Authenticated users can view inventory" ON inventory
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage inventory" ON inventory
    FOR ALL USING (auth.role() = 'service_role');

-- Insert initial inventory data
INSERT INTO inventory (sku, name, quantity_available) 
VALUES ('ALT-SWAG-001', 'New Hire Bundle', 100)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample users (replace with actual data)
INSERT INTO users (email, invited, first_name, last_name, address1, address2, city, state, zip_code, country, phone_number, order_submitted) 
VALUES 
    ('john.doe@alteryx.com', true, 'John', 'Doe', '123 Main St', 'Apt 4B', 'San Francisco', 'CA', '94105', 'United States', '+1-555-123-4567', false),
    ('jane.smith@alteryx.com', true, 'Jane', 'Smith', '456 Oak Ave', '', 'New York', 'NY', '10001', 'United States', '+1-555-987-6543', false)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_invited ON users(invited);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date_submitted ON orders(date_submitted);

-- Create function to check if user is invited
CREATE OR REPLACE FUNCTION is_user_invited(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE email = user_email AND invited = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has ordered
CREATE OR REPLACE FUNCTION has_user_ordered(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_uuid AND order_submitted = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
