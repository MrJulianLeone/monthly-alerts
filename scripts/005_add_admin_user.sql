-- Add julianleone@gmail.com as admin
-- This script will add the user to the admin_users table if they exist

INSERT INTO admin_users (user_id)
SELECT id FROM users 
WHERE email = 'julianleone@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.user_id = users.id
);
