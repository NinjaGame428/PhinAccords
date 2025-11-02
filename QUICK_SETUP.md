# Quick Setup Guide

## 1. Add Environment Variables to Vercel

**Go to:** https://vercel.com/jackmichaels-projects/heavenkeys-chords-finder/settings/environment-variables

**Add these variables:**

### NEON_DATABASE_URL
```
postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
- Name: `NEON_DATABASE_URL`
- Value: `postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- Environment: All (Production, Preview, Development)

### DATABASE_URL (same value)
```
postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
- Name: `DATABASE_URL`
- Value: Same as above
- Environment: All

### JWT_SECRET
- Name: `JWT_SECRET`
- Value: Generate a secure random string (see below)
- Environment: All

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Setup Database Schema

**Connect to Neon using:**
```bash
psql 'postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

**Or use Neon SQL Editor** and run: `scripts/setup-database.sql`

This will:
- Create users table with password_hash column
- Set up indexes
- Enable UUID generation

## 3. Redeploy After Adding Variables

After adding environment variables in Vercel:
- Go to Deployments tab
- Click "..." on latest deployment  
- Click "Redeploy"

Or via CLI:
```bash
vercel redeploy --prod
```

## 4. Test Authentication

After deployment, try:
- Register a new user
- Login with existing user

If you need to create a test user, you can use the registration form or run:
```bash
node scripts/create-test-user.js
```

## Troubleshooting

**If registration fails:**
1. Check Vercel logs for database errors
2. Verify environment variables are set correctly
3. Ensure database schema is set up (run setup-database.sql)

**If login fails:**
1. Check that user exists in database
2. Verify password_hash is set correctly
3. Check JWT_SECRET is set

