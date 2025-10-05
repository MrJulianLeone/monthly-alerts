-- Create admin_users table to track who has admin access
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your admin email here (replace with your actual email)
-- INSERT INTO admin_users (user_id) 
-- SELECT id FROM users WHERE email = 'your-admin-email@example.com';
