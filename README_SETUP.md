# PhinAccords Setup Instructions
## Heavenkeys Ltd

Complete setup guide for PhinAccords platform.

## ✅ What's Already Done

1. ✅ All npm dependencies installed
2. ✅ Database migration file created
3. ✅ TypeScript types updated
4. ✅ All "Chordify" references replaced with "PhinAccords"
5. ✅ Environment variables template ready

## 🚀 Setup Steps

### Step 1: Run Database Migration (Required)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Open file: `supabase/migrations/002_add_subscription_fields.sql`
6. Copy entire contents
7. Paste into SQL Editor
8. Click **Run** (or press `Ctrl+Enter`)

**Verify**: Go to Table Editor → `user_profiles` → Check for new subscription columns

### Step 2: Set Up Python Service (Required for Upload Feature)

**Prerequisites**:
- Python 3.9 or higher
- FFmpeg installed

**Installation**:

```bash
# Navigate to python-service directory
cd python-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

**Verify**: Service should start on `http://localhost:8000`

**Note**: If Python is not installed, download from [python.org](https://www.python.org/downloads/)

### Step 3: Verify Environment Variables

Check `.env.local` has:
```env
PYTHON_SERVICE_URL=http://localhost:8000
```

If missing, add it.

### Step 4: Start Development Server

```bash
cd babun-main
npm run dev
```

App will be available at `http://localhost:3000`

## 🧪 Testing Checklist

### Basic Features
- [ ] Home page loads
- [ ] Songs page displays songs
- [ ] Search functionality works
- [ ] Song detail page loads

### Authentication
- [ ] Can register new account
- [ ] Can log in
- [ ] Can log out
- [ ] User profile accessible

### Premium Features (Requires Subscription)
- [ ] Premium toolbar appears on song pages
- [ ] Transpose buttons work
- [ ] Capo selector works
- [ ] Tempo slider works
- [ ] Loop toggle works
- [ ] Volume controls work
- [ ] MIDI export downloads file
- [ ] PDF export downloads file

### Upload Feature (Requires Subscription)
- [ ] Upload page accessible
- [ ] Can select file
- [ ] Can paste YouTube URL
- [ ] Upload processes successfully
- [ ] Chords extracted and displayed

### Toolkit Features (Requires Premium + Toolkit)
- [ ] Tuner component loads
- [ ] Metronome component loads
- [ ] Live chord detection loads
- [ ] Features require correct subscription tier

## 📊 Subscription Tiers

Default tier for new users: **free**

To test premium features, update user subscription in database:
```sql
UPDATE user_profiles
SET subscription_tier = 'premium_toolkit',
    subscription_status = 'active'
WHERE user_id = 'your-user-id';
```

## 🔧 Troubleshooting

### Python Service Issues

**Error**: `ModuleNotFoundError: No module named 'librosa'`
- **Solution**: Make sure virtual environment is activated and run `pip install -r requirements.txt`

**Error**: `FFmpeg not found`
- **Solution**: Install FFmpeg:
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

**Error**: `Port 8000 already in use`
- **Solution**: Change port in `main.py` or kill process using port 8000

### Database Issues

**Error**: `column "subscription_tier" does not exist`
- **Solution**: Run the migration file `002_add_subscription_fields.sql`

**Error**: `type "subscription_tier" does not exist`
- **Solution**: Migration not run completely, run it again

### Feature Not Working

**Issue**: Premium features not showing
- **Check**: User subscription tier in database
- **Check**: Feature flags in `src/lib/subscription.ts`
- **Check**: Browser console for errors

**Issue**: Upload fails
- **Check**: Python service is running
- **Check**: `PYTHON_SERVICE_URL` in `.env.local`
- **Check**: File size and type restrictions

## 📚 Additional Resources

- `QUICK_START.md` - 5-minute quick start
- `SETUP_COMPLETE.md` - Complete feature checklist
- `DATABASE_MIGRATION_GUIDE.md` - Detailed migration guide
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `python-service/README.md` - Python service documentation

## 🎯 Next Steps After Setup

1. **Test All Features**: Go through testing checklist above
2. **Set Up Payment Processing**: Integrate Stripe/PayPal for subscriptions
3. **Configure Production**: Set up production environment variables
4. **Deploy Python Service**: Deploy to separate server/container
5. **Monitor Performance**: Set up logging and monitoring

## ✅ Setup Complete When:

- ✅ Database migration run successfully
- ✅ Python service running on port 8000
- ✅ Next.js app running on port 3000
- ✅ Can log in and access features
- ✅ Premium features work (after setting subscription tier)
- ✅ Upload feature works (after setting subscription tier)

---

**Need Help?** Check the documentation files or review error messages in browser console and terminal.

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

