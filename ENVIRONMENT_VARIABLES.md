# Environment Variables Configuration Guide
## PhinAccords - Heavenkeys Ltd

Complete guide for setting up all environment variables.

## 📋 Required Environment Variables

### For Local Development (`.env.local`)

Create a `.env.local` file in the `babun-main/` directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://zwvappfxasxuzoyxxkyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Python Audio Processing Service
# Local development:
PYTHON_SERVICE_URL=http://localhost:8000

# Production (after deploying Python service):
# PYTHON_SERVICE_URL=https://your-service.railway.app
# PYTHON_SERVICE_URL=https://your-service.onrender.com
# PYTHON_SERVICE_URL=https://your-service.fly.dev
```

### For Vercel Production

Go to **Vercel Dashboard** → **Settings** → **Environment Variables** and add:

#### 1. Supabase Variables (Already Set)
- `NEXT_PUBLIC_SUPABASE_URL` = `https://zwvappfxasxuzoyxxkyd.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Your anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = (Your service role key)

#### 2. Python Service URL (Set After Deployment)

**Key**: `PYTHON_SERVICE_URL`

**Value**: Your deployed Python service URL

**Examples**:
- Railway: `https://phinaccords-audio-production.up.railway.app`
- Render: `https://phinaccords-audio-service.onrender.com`
- Fly.io: `https://phinaccords-audio.fly.dev`
- Custom domain: `https://audio.phinaccords.com`

## 🔧 How to Set PYTHON_SERVICE_URL

### Step 1: Deploy Python Service

Choose one deployment option (see `PYTHON_SERVICE_DEPLOYMENT.md`):

#### Option A: Railway
```bash
cd python-service
railway login
railway init
railway up
railway domain  # Copy this URL
```

#### Option B: Render
1. Go to [Render Dashboard](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Root Directory: `python-service`
5. Deploy and copy the service URL

#### Option C: Fly.io
```bash
cd python-service
fly launch
fly deploy
fly info  # Get the URL
```

### Step 2: Get Your Service URL

After deployment, you'll get a URL like:
- `https://phinaccords-audio-production.up.railway.app`
- `https://phinaccords-audio-service.onrender.com`
- `https://phinaccords-audio.fly.dev`

### Step 3: Set in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **phin-accords**
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `PYTHON_SERVICE_URL`
   - **Value**: Your service URL (e.g., `https://your-service.railway.app`)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your application (or wait for auto-deploy)

### Step 4: Verify

Test the service is accessible:

```bash
# Test health endpoint
curl https://your-service-url.com/health

# Should return:
# {"status": "healthy", "service": "PhinAccords Audio Processing"}
```

## 🧪 Testing the Configuration

### Local Testing

1. Start Python service locally:
   ```bash
   cd python-service
   python main.py
   ```

2. Verify `.env.local` has:
   ```env
   PYTHON_SERVICE_URL=http://localhost:8000
   ```

3. Test upload feature in your app

### Production Testing

1. Verify Vercel environment variable is set
2. Visit your production site
3. Try uploading a song
4. Check browser console for errors
5. Check Vercel logs if issues occur

## 🔍 Troubleshooting

### Issue: "Failed to fetch" when uploading

**Causes**:
- `PYTHON_SERVICE_URL` not set in Vercel
- Python service not deployed
- Service URL incorrect
- CORS issues

**Solutions**:
1. Check Vercel environment variables
2. Verify Python service is running
3. Test service URL directly: `curl https://your-service-url.com/health`
4. Check service logs for errors
5. Verify CORS is configured in `python-service/main.py`

### Issue: Service returns 404

**Causes**:
- Wrong URL
- Service not deployed
- Path incorrect

**Solutions**:
1. Verify service URL is correct
2. Check service is running
3. Test health endpoint first
4. Check service logs

### Issue: CORS errors in browser

**Causes**:
- Service not allowing your Vercel domain
- CORS not configured

**Solutions**:
1. Update `python-service/main.py` to allow your Vercel domain:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://phin-accords-kzhmbuv20-jackmichaels-projects.vercel.app",
           "https://your-custom-domain.com",
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
2. Redeploy Python service
3. Clear browser cache

## 📝 Environment Variable Checklist

### Local Development
- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `PYTHON_SERVICE_URL=http://localhost:8000` set
- [ ] Python service running locally

### Vercel Production
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `PYTHON_SERVICE_URL` set (after deploying service)
- [ ] Python service deployed and accessible
- [ ] All variables set for Production environment
- [ ] App redeployed after setting variables

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Service Role Key** - Keep secret, has full database access
3. **Production URLs** - Use HTTPS only
4. **CORS** - Only allow your Vercel domain

## 📚 Related Documentation

- `PYTHON_SERVICE_DEPLOYMENT.md` - How to deploy Python service
- `NEXT_STEPS_GUIDE.md` - Complete setup guide
- `TESTING_CHECKLIST.md` - Testing guide

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

