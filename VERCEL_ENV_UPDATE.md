# Update Vercel Environment Variables

## 📋 Quick Update Guide

Your environment variables are already set in Vercel. Follow these steps to ensure they have the correct values:

## 🔗 Direct Link to Environment Variables

**Go to:** https://vercel.com/jackmichaels-projects/heavenkeys-chords-finder/settings/environment-variables

## ✅ Required Variables

### 1. NEON_DATABASE_URL

**Click on:** `NEON_DATABASE_URL`

**Update to:**
```
postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environments:** Select all (Production, Preview, Development)

**Click:** "Save"

### 2. DATABASE_URL

**Click on:** `DATABASE_URL`

**Update to:** Same value as NEON_DATABASE_URL above

**Environments:** Select all (Production, Preview, Development)

**Click:** "Save"

### 3. JWT_SECRET

**Click on:** `JWT_SECRET`

**If empty or needs update, generate new one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Current generated value:**
```
cbe5fcc5b235841273abb6edb2f2345f4665b07167e08e90b029cbbf654f0c47
```

**Environments:** Select all (Production, Preview, Development)

**Click:** "Save"

## 🚀 After Updating

### Option 1: Via Dashboard
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **"..."** menu
4. Click **"Redeploy"**
5. Select **"Use existing Build Cache"** or **"Redeploy"**
6. Wait for completion

### Option 2: Via CLI
```bash
vercel redeploy --prod
```

## ✅ Verification

After redeploy, test:
1. ✅ Registration form works
2. ✅ Login form works
3. ✅ Dashboard loads after login
4. ✅ No database errors in Vercel logs

## 🔍 Check Logs

If there are errors, check Vercel logs:
```bash
vercel logs --follow
```

Or via dashboard:
https://vercel.com/jackmichaels-projects/heavenkeys-chords-finder/logs

## 📝 Current Status

✅ All code pushed to GitHub
✅ All tables created in Neon database
✅ Application deployed to Vercel
⏳ Environment variables need verification/update
⏳ Final redeploy needed after env update

