# Deploy Admin Policies to Supabase

This file contains SQL policies that allow administrators to manage all database tables.

## Quick Deploy

Run the SQL in `supabase/admin-policies.sql` in your Supabase SQL Editor.

## What This Does

- Creates RLS policies that allow users with role 'admin' to:
  - Insert, update, and delete songs
  - Insert, update, and delete artists
  - Insert, update, and delete resources
  - Manage all users
  - Manage all favorites
  - Manage all ratings

## Steps to Deploy

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/admin-policies.sql`
4. Click "Run" to execute the SQL

## Verification

After deploying, test by:
1. Logging in as an admin user
2. Attempting to update a song via the admin panel
3. The update should now succeed

