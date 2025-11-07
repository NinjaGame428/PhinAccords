# PYTHON_SERVICE_URL Setup Guide
## Quick Reference for Setting the Python Service URL

## 🎯 What Value to Use

### For Local Development

In your `.env.local` file (already set):
```env
PYTHON_SERVICE_URL=http://localhost:8000
```

This works when running the Python service locally on port 8000.

---

### For Production (Vercel)

**After deploying your Python service**, you'll get a URL like:

#### Railway Example:
```
https://phinaccords-audio-production.up.railway.app
```

#### Render Example:
```
https://phinaccords-audio-service.onrender.com
```

#### Fly.io Example:
```
https://phinaccords-audio.fly.dev
```

**Set this URL in Vercel** as the `PYTHON_SERVICE_URL` value.

---

## 📝 Step-by-Step: Setting in Vercel

### 1. Deploy Python Service First

Choose one method (see `PYTHON_SERVICE_DEPLOYMENT.md`):

**Railway (Easiest)**:
```bash
cd python-service
railway login
railway init
railway up
railway domain  # Copy this URL!
```

**Render**:
- Go to Render Dashboard
- Create Web Service
- Copy the service URL

**Fly.io**:
```bash
cd python-service
fly launch
fly deploy
fly info  # Copy the URL
```

### 2. Copy Your Service URL

After deployment, you'll have a URL like:
- `https://your-service-name.railway.app`
- `https://your-service-name.onrender.com`
- `https://your-service-name.fly.dev`

### 3. Set in Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your project: **phin-accords**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Key**: `PYTHON_SERVICE_URL`
   - **Value**: `https://your-service-url.com` (paste your service URL)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### 4. Redeploy

- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

Or wait for the next auto-deploy.

---

## ✅ Verify It's Working

### Test 1: Health Check
```bash
curl https://your-service-url.com/health
```

Should return:
```json
{"status": "healthy", "service": "PhinAccords Audio Processing"}
```

### Test 2: From Your App
1. Visit your Vercel site
2. Try uploading a song
3. Check browser console (F12) for errors
4. If you see "Failed to fetch", check:
   - Vercel environment variable is set
   - Service URL is correct
   - Service is running

---

## 🔧 Current Configuration

### Local Development
```env
# .env.local
PYTHON_SERVICE_URL=http://localhost:8000
```

### Production (Vercel)
```
PYTHON_SERVICE_URL=https://your-deployed-service-url.com
```

---

## 🐛 Common Issues

### Issue: "PYTHON_SERVICE_URL is not defined"

**Solution**: 
- Make sure variable is set in Vercel
- Redeploy after setting variable
- Check variable name is exactly `PYTHON_SERVICE_URL`

### Issue: "Failed to fetch" when uploading

**Solutions**:
1. Verify service is running: `curl https://your-service-url.com/health`
2. Check Vercel environment variable is set correctly
3. Verify CORS is configured (already done in `main.py`)
4. Check service logs for errors

### Issue: CORS errors

**Solution**: 
The Python service is already configured to allow your Vercel domain. If you still see CORS errors:
1. Check the service URL is correct
2. Verify service is accessible
3. Check browser console for specific error

---

## 📋 Quick Checklist

- [ ] Python service deployed
- [ ] Service URL copied
- [ ] `PYTHON_SERVICE_URL` set in Vercel
- [ ] Variable set for all environments (Production, Preview, Development)
- [ ] App redeployed after setting variable
- [ ] Health check works: `curl https://your-service-url.com/health`
- [ ] Upload feature works on production site

---

## 🔗 Related Files

- `ENVIRONMENT_VARIABLES.md` - Complete environment variables guide
- `PYTHON_SERVICE_DEPLOYMENT.md` - How to deploy Python service
- `NEXT_STEPS_GUIDE.md` - Complete setup guide

---

**Quick Answer**: 
- **Local**: `http://localhost:8000`
- **Production**: `https://your-deployed-service-url.com` (set after deploying Python service)

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

