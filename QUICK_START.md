# PhinAccords Quick Start Guide
## Heavenkeys Ltd

Get your PhinAccords platform up and running in minutes!

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- FFmpeg (for audio processing)
- Supabase account and project

## Step 1: Install Dependencies

```bash
cd babun-main
npm install --legacy-peer-deps
```

## Step 2: Set Up Environment Variables

Create `.env.local` in `babun-main/`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Python Service
PYTHON_SERVICE_URL=http://localhost:8000
```

## Step 3: Run Database Migration

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open SQL Editor
3. Copy contents of `supabase/migrations/002_add_subscription_fields.sql`
4. Paste and run

See `DATABASE_MIGRATION_GUIDE.md` for detailed instructions.

## Step 4: Start Python Service

```bash
cd python-service
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

Service will run on `http://localhost:8000`

## Step 5: Start Next.js App

```bash
cd babun-main
npm run dev
```

App will run on `http://localhost:3000`

## Step 6: Test Features

1. **Create Account**: Go to `/register`
2. **Upload Song**: Go to upload page, test file upload
3. **Premium Features**: Go to any song, test toolbar features
4. **Toolkit**: Test tuner, metronome, live detection

## Troubleshooting

### Python Service Won't Start
- Install FFmpeg: `brew install ffmpeg` (Mac) or download from [ffmpeg.org](https://ffmpeg.org)
- Check Python version: `python --version` (needs 3.9+)
- Verify dependencies: `pip list`

### Database Migration Fails
- Check Supabase project is active
- Verify you have admin access
- Check for existing columns (migration is safe to run multiple times)

### Features Not Working
- Check browser console for errors
- Verify environment variables are set
- Check user subscription tier in database

## Next Steps

- Set up payment processing (Stripe/PayPal)
- Configure production environment
- Deploy Python service to separate server
- Set up monitoring and logging

---

**Need Help?** Check `SETUP_COMPLETE.md` for detailed information.

