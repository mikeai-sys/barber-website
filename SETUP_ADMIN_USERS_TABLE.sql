-- SQL Script to Create Admin Users Table
-- Run this in Supabase SQL Editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT true,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster searches
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view admin_users table
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  USING (
    auth.email() IN (
      SELECT email FROM admin_users WHERE is_admin = true
    )
  );

-- Policy: Only admins can insert admin users
CREATE POLICY "Admins can add admin users"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    auth.email() IN (
      SELECT email FROM admin_users WHERE is_admin = true
    )
  );

-- Policy: Only admins can update admin users
CREATE POLICY "Admins can update admin users"
  ON admin_users
  FOR UPDATE
  USING (
    auth.email() IN (
      SELECT email FROM admin_users WHERE is_admin = true
    )
  );

-- Policy: Only admins can delete admin users
CREATE POLICY "Admins can delete admin users"
  ON admin_users
  FOR DELETE
  USING (
    auth.email() IN (
      SELECT email FROM admin_users WHERE is_admin = true
    )
  );

-- Insert existing admins from business.js
INSERT INTO admin_users (email, is_admin) 
VALUES 
  ('admin@haytembarber.com', true),
  ('abd2008ghafour@gmail.com', true)
ON CONFLICT (email) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
