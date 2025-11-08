# DeChord Service - Ready for Deployment
## PhinAccords - Heavenkeys Ltd

✅ **DeChord web service has been created and is ready for deployment!**

## 📦 What Was Created

1. **Web API Service** (`dechord-service/main.py`)
   - FastAPI-based REST API
   - Chord recognition using madmom
   - Key detection
   - Tempo detection
   - Result caching

2. **Deployment Configuration**
   - `railway.json` - Railway build config
   - `nixpacks.toml` - Nixpacks build config
   - `requirements.txt` - Python dependencies

3. **Documentation**
   - `DECHORD_DEPLOYMENT.md` - Complete deployment guide
   - `README.md` - Service documentation

## 🚀 Current Status

The service is being deployed to Railway. The build may take 10-15 minutes due to:
- Installing madmom (large package with C dependencies)
- Building Cython extensions
- Installing ffmpeg and audio processing libraries

## 📋 Next Steps

### 1. Wait for Railway Build to Complete

Check build status:
- Railway Dashboard: https://railway.app/project/59b615dc-4b60-49f3-b803-ef1d5bde38a0
- Or run: `railway logs` (from `dechord-service` directory)

### 2. Get Service URL

Once deployed, get the service URL:
```bash
cd dechord-service
railway domain
```

### 3. Set Environment Variable in Vercel

Add to Vercel environment variables:
- **Key**: `DECHORD_SERVICE_URL`
- **Value**: Your Railway service URL (e.g., `https://perceptive-playfulness-production.up.railway.app`)
- **Environment**: All (Production, Preview, Development)

### 4. Test the Service

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

## 🎯 API Endpoints

### POST /analyze
Complete audio analysis (chords, key, tempo)

**Request:**
```bash
curl -X POST https://your-service-url.railway.app/analyze \
  -F "file=@audio.mp3" \
  -F "title=My Song"
```

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
  "title": "My Song"
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

## 🔗 Integration with PhinAccords

The DeChord service can be used as an alternative or complement to the existing Python audio service:

1. **Faster chord recognition** - Optimized for real-time chord detection
2. **Key detection** - Built-in key recognition
3. **Tempo detection** - Accurate BPM detection

Update your audio extraction API to optionally use DeChord:
```typescript
const DECHORD_SERVICE_URL = process.env.DECHORD_SERVICE_URL;

if (DECHORD_SERVICE_URL) {
  // Use DeChord for faster analysis
  const response = await fetch(`${DECHORD_SERVICE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  // Use result.chords, result.key, result.tempo
}
```

## 📊 Service Comparison

| Feature | Python Service | DeChord Service |
|---------|---------------|-----------------|
| Chord Extraction | ✅ | ✅ |
| Key Detection | ❌ | ✅ |
| Tempo Detection | ❌ | ✅ |
| YouTube Support | ✅ | ❌ |
| Deep Learning | ✅ | ✅ (madmom) |
| Speed | Medium | Fast |
| Caching | ❌ | ✅ |

## 🎉 Summary

✅ DeChord service created  
⏳ Deployment in progress (Railway)  
📝 Documentation complete  
🔗 Ready for Vercel integration  

**Next**: Wait for Railway build, get service URL, add to Vercel env vars!

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)
**Based on**: https://github.com/chinmaykrishnroy/DeChord

