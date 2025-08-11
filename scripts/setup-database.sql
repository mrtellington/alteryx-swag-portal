-- Alteryx Swag Portal Database Setup
-- Run this script in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    invited BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    order_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
VALUES ('ALT-SWAG-001', 'Alteryx Employee Swag Pack', 100)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample users (replace with actual data)
INSERT INTO users (email, invited, full_name, shipping_address, order_submitted) 
VALUES 
    ('john.doe@alteryx.com', true, 'John Doe', '123 Main St, San Francisco, CA 94105', false),
    ('jane.smith@alteryx.com', true, 'Jane Smith', '456 Oak Ave, New York, NY 10001', false)
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
