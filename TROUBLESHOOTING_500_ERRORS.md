# Troubleshooting 500 Errors

## What I Fixed

1. **Enhanced Error Logging**: Added detailed error messages with context
2. **Improved Connection Handling**: Better connection string parsing
3. **Better Error Messages**: More specific error messages for different failure types

## Current Status

✅ Environment variables are set in Vercel:
- `NEON_DATABASE_URL` ✓
- `DATABASE_URL` ✓
- `JWT_SECRET` ✓

✅ Database connection works locally
✅ Database has data (10 songs, 8 artists, 1 user)

## If Errors Persist

### Check Vercel Logs

View the latest deployment logs:
```
vercel inspect [DEPLOYMENT_URL] --logs
```

Or check in dashboard: https://vercel.com/jackmichaels-projects/heavenkeys-chords-finder/logs

### Verify Environment Variables

1. Check in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Verify `NEON_DATABASE_URL` is set correctly
   - The value should be: `postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`

2. Test connection string format:
   ```bash
   node scripts/test-db-connection.js
   ```

### Common Issues

1. **Connection String Format**: Make sure there are no extra spaces or line breaks
2. **SSL Mode**: Should include `?sslmode=require` at the end
3. **Special Characters**: URL should be properly encoded if it contains special characters

### Debug Steps

1. **Check if tables exist**:
   Run this in Neon SQL Editor:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

2. **Test a simple query**:
   ```sql
   SELECT COUNT(*) FROM songs;
   SELECT COUNT(*) FROM artists;
   SELECT COUNT(*) FROM users;
   ```

3. **Check password_hash column**:
   ```sql
   SELECT column_name, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'password_hash';
   ```
   
   If it shows `is_nullable = NO`, run:
   ```sql
   ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
   ```

## Next Steps

1. Check Vercel logs for specific error messages
2. Test registration/login on the deployed site
3. If still failing, share the exact error from Vercel logs

