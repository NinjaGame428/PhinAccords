# Vercel Environment Variables Setup

## ✅ Current Status

All required environment variables are already set in Vercel. However, please verify they have the correct values.

## 🔧 Update Environment Variables

Go to: https://vercel.com/jackmichaels-projects/heavenkeys-chords-finder/settings/environment-variables

### 1. Update NEON_DATABASE_URL

**Current value:** (check in Vercel dashboard)
**Should be:**
```
postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**To update:**
- Click on `NEON_DATABASE_URL`
- Update the value
- Make sure it's set for: Production, Preview, Development
- Click "Save"

### 2. Update DATABASE_URL

**Should be:** Same as NEON_DATABASE_URL above

### 3. Verify JWT_SECRET

**Current value:** Already set (encrypted)
**If needed, generate new one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 After Updating Variables

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

Or via CLI:
```bash
vercel redeploy --prod
```

## ✅ Verification Checklist

- [ ] NEON_DATABASE_URL is set correctly
- [ ] DATABASE_URL is set correctly  
- [ ] JWT_SECRET is set (should be a long random string)
- [ ] All variables are set for Production, Preview, and Development
- [ ] Application has been redeployed after setting variables

## 🧪 Test After Setup

1. Try registering a new user
2. Try logging in
3. Check Vercel logs if there are any errors

