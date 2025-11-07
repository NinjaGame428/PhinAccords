-- Script to create an admin user in Neon database
-- Replace the values below with your desired admin credentials
-- Run this in Neon SQL Editor

-- Example: Create admin user
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  'admin@example.com',  -- Change this to your admin email
  '$2a$10$YourBcryptHashHere',  -- Generate this using: bcrypt.hash('your-password', 10)
  'Admin User',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  role = 'admin',
  updated_at = NOW();

-- To generate the bcrypt hash, you can use Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your-password', 10);
-- console.log(hash);

-- Or use online tool: https://bcrypt-generator.com/
-- Use 10 rounds

-- After creating admin user, you can login with:
-- Email: admin@example.com
-- Password: your-password

