-- Create admin_users table to track who has admin access
-- Note: Run this AFTER 004_create_auth_tables.sql

DROP TABLE IF EXISTS admin_users;
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your admin email here (replace with your actual email)
-- Example:
-- INSERT INTO admin_users (user_id) 
-- SELECT id FROM users WHERE email = 'your-admin-email@example.com';
