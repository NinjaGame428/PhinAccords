# Set Python Service URL in Vercel
## PhinAccords - Quick Setup Guide

Your Python service is deployed to Railway at:
**`https://phinaccords-production.up.railway.app`**

Now you need to add this URL to Vercel environment variables.

## 🚀 Quick Steps

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/dashboard

### 2. Select Your Project
Click on: **phin-accords** (or your project name)

### 3. Go to Settings
- Click **Settings** in the top menu
- Click **Environment Variables** in the left sidebar

### 4. Add Environment Variable
Click **Add New** and enter:

**Key:**
```
PYTHON_SERVICE_URL
```

**Value:**
```
https://phinaccords-production.up.railway.app
```

**Environment:**
- ✅ Production
- ✅ Preview  
- ✅ Development

Click **Save**

### 5. Redeploy
- Go to **Deployments** tab
- Click **⋯** (three dots) on the latest deployment
- Click **Redeploy**

Or wait for the next auto-deploy from GitHub.

## ✅ Verify It's Working

After redeploying, test the upload feature:
1. Visit your Vercel site
2. Try uploading a song
3. Check browser console (F12) for errors
4. If you see "Failed to fetch", wait a few minutes for Railway build to complete

## 🔍 Check Railway Build Status

The Python service build may still be in progress. Check:
- Railway Dashboard: https://railway.app/project/b5f16eb3-0241-4212-9dc1-eeb36613336f
- Or run: `railway logs` (from python-service directory)

## 📋 Summary

**What to do:**
1. ✅ Add `PYTHON_SERVICE_URL` = `https://phinaccords-production.up.railway.app` in Vercel
2. ✅ Redeploy Vercel app
3. ✅ Wait for Railway build to complete
4. ✅ Test upload feature

**Service URLs:**
- **Next.js App (Vercel)**: https://phin-accords-kzhmbuv20-jackmichaels-projects.vercel.app
- **Python Service (Railway)**: https://phinaccords-production.up.railway.app

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)
