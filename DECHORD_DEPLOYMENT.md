# DeChord Service Deployment Guide
## PhinAccords - Heavenkeys Ltd

Complete guide for deploying the DeChord web service (based on https://github.com/chinmaykrishnroy/DeChord)

## 🎯 What is DeChord?

DeChord is a real-time music analysis tool that recognizes:
- **Chords** - Detects chord progressions with timing
- **Key** - Identifies the musical key
- **Tempo** - Detects BPM

The web service version provides REST API endpoints for integration.

## 🚀 Quick Deployment to Railway

### Step 1: Navigate to Service Directory

```bash
cd babun-main/dechord-service
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Create New Railway Project

```bash
railway init
```

When prompted:
- Create new project: **Yes**
- Project name: `phinaccords-dechord` (or your choice)
- Environment: `production`

### Step 4: Deploy

```bash
railway up
```

### Step 5: Get Service URL

```bash
railway domain
```

This will give you a URL like: `https://phinaccords-dechord-production.up.railway.app`

## 📝 Set Environment Variable in Vercel

After deployment:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **phin-accords**
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key**: `DECHORD_SERVICE_URL`
   - **Value**: Your Railway service URL (e.g., `https://phinaccords-dechord-production.up.railway.app`)
   - **Environment**: All (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your Vercel app

## 🧪 Test the Service

### Health Check

```bash
curl https://your-service-url.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "DeChord Web API - PhinAccords",
  "version": "1.0.0"
}
```

### Test Chord Recognition

```bash
curl -X POST https://your-service-url.railway.app/analyze \
  -F "file=@test-audio.mp3" \
  -F "title=Test Song"
```

## 📊 API Endpoints

### POST /analyze
Complete analysis (chords, key, tempo)

**Request:**
- `file`: Audio file (MP3, WAV, M4A, AAC)
- `title`: Optional song title

**Response:**
```json
{
  "chords": [
    {"startTime": 0.0, "endTime": 2.5, "chord": "C"},
    {"startTime": 2.5, "endTime": 5.0, "chord": "Am"}
  ],
  "key": "C major",
  "tempo": 120.0,
  "duration": 180.5,
  "title": "Song Title"
}
```

### POST /chords
Extract only chords

### POST /key
Extract only key

### POST /tempo
Extract only tempo

### GET /health
Health check

## 🔧 Integration with PhinAccords

### Update Audio Extraction API

Update `src/app/api/audio/extract-chords/route.ts` to optionally use DeChord:

```typescript
const DECHORD_SERVICE_URL = process.env.DECHORD_SERVICE_URL;

// Option 1: Use DeChord for faster, simpler analysis
if (DECHORD_SERVICE_URL) {
  const response = await fetch(`${DECHORD_SERVICE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  // Use result.chords, result.key, result.tempo
}

// Option 2: Use existing Python service for advanced features
```

## 📋 Deployment Checklist

- [ ] Service deployed to Railway
- [ ] Service URL obtained
- [ ] `DECHORD_SERVICE_URL` set in Vercel
- [ ] Health check passes
- [ ] Test analysis works
- [ ] Integrated with PhinAccords (optional)

## 🔗 Service URLs

After deployment, you'll have:
- **DeChord Service**: `https://your-dechord-service.railway.app`
- **Python Audio Service**: `https://phinaccords-production.up.railway.app`
- **Next.js App**: `https://phin-accords-kzhmbuv20-jackmichaels-projects.vercel.app`

## 🎉 Features

✅ Real-time chord recognition  
✅ Key detection  
✅ Tempo detection  
✅ Result caching  
✅ REST API  
✅ Web-ready (no GUI dependencies)

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)
**Based on**: https://github.com/chinmaykrishnroy/DeChord

