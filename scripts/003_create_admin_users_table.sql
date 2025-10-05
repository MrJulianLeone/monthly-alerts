-- Create admin_users table to track who has admin access
CREATE TABLE IF NOT EXISTS admin_users (
  user_id TEXT PRIMARY KEY REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your admin email here (replace with your actual email)
-- INSERT INTO admin_users (user_id) 
-- SELECT id FROM neon_auth.users_sync WHERE email = 'your-admin-email@example.com';
