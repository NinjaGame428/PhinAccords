# Vercel Environment Variables Check

The 500 errors you're experiencing are likely due to missing or incorrect environment variables in Vercel.

## Quick Fix

1. **Check Environment Variables in Vercel:**
   ```bash
   vercel env ls
   ```

2. **Set the required variables:**
   ```bash
   # Set Neon Database URL
   vercel env add NEON_DATABASE_URL production
   # Paste: postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # Set JWT Secret (generate a secure random string)
   vercel env add JWT_SECRET production
   # Use a strong random string, e.g: openssl rand -base64 32
   ```

3. **Or use the Vercel Dashboard:**
   - Go to https://vercel.com/your-project/settings/environment-variables
   - Add these variables:
     - `NEON_DATABASE_URL`: `postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
     - `JWT_SECRET`: (Generate a secure random string)
     - `DATABASE_URL`: (Optional, same as NEON_DATABASE_URL)

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Required Environment Variables

- `NEON_DATABASE_URL` (required)
- `JWT_SECRET` (required for authentication)
- `DATABASE_URL` (optional fallback)

## Test Locally

Run this to verify your connection:
```bash
node scripts/test-db-connection.js
```

## Check Vercel Logs

View recent errors:
```bash
vercel logs --follow
```

Or check in dashboard: https://vercel.com/your-project/logs

