# How to Run DeChord Service
## PhinAccords - Heavenkeys Ltd

## 🚀 Quick Start Options

### Option 1: Deploy to Railway (Recommended for Production)

#### Step 1: Login to Railway
```bash
cd dechord-service
railway login
```
(Opens browser for authentication)

#### Step 2: Create/Link Project
```bash
railway init
```
- If new project: Enter project name (e.g., `phinaccords-dechord`)
- If existing: Select existing project

#### Step 3: Deploy
```bash
railway up
```

#### Step 4: Get Service URL
```bash
railway domain
```
This will give you a URL like: `https://your-service.up.railway.app`

#### Step 5: Set Environment Variable in Vercel
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - **Key**: `DECHORD_SERVICE_URL`
   - **Value**: Your Railway service URL
   - **Environment**: All (Production, Preview, Development)
3. Redeploy Vercel app

### Option 2: Run Locally (For Development)

#### Prerequisites
- Python 3.12+ installed
- FFmpeg installed (for YouTube support)

#### Step 1: Install Python
**Windows:**
- Download from: https://www.python.org/downloads/
- Or use: `winget install Python.Python.3.12`

**Mac:**
```bash
brew install python@3.12
```

**Linux:**
```bash
sudo apt update
sudo apt install python3.12 python3.12-venv
```

#### Step 2: Install FFmpeg
**Windows:**
- Download from: https://ffmpeg.org/download.html
- Add to PATH

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

#### Step 3: Set Up Virtual Environment
```bash
cd dechord-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

#### Step 4: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note**: This may take 10-15 minutes as it installs:
- madmom (large package with C dependencies)
- librosa
- yt-dlp
- FastAPI and dependencies

#### Step 5: Run the Service
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

Service will run on: `http://localhost:8001`

#### Step 6: Test
```bash
# Health check
curl http://localhost:8001/health

# Should return:
# {"status":"healthy","service":"DeChord Web API - PhinAccords","version":"1.0.0"}
```

#### Step 7: Update Next.js App
In `.env.local`:
```env
NEXT_PUBLIC_DECHORD_SERVICE_URL=http://localhost:8001
```

### Option 3: Use Docker (Alternative)

#### Create Dockerfile
```dockerfile
FROM python:3.12-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY main.py .

# Expose port
EXPOSE 8001

# Run service
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Build and Run
```bash
docker build -t dechord-service .
docker run -p 8001:8001 dechord-service
```

## ✅ Verification

### Check Service is Running
```bash
curl http://localhost:8001/health
```

### Test from Browser
Visit: `http://localhost:8001/health`

### Test from Next.js App
1. Go to `/dechord` page
2. Enter a YouTube URL or upload a file
3. Click "Analyze Audio"
4. Should see analysis results

## 🔧 Troubleshooting

### "Python was not found"
- Install Python 3.12+ from python.org
- Make sure Python is in PATH
- Restart terminal after installation

### "FFmpeg not found"
- Install FFmpeg (required for YouTube downloads)
- Add to PATH
- Restart terminal

### "ModuleNotFoundError: No module named 'madmom'"
- Make sure virtual environment is activated
- Run: `pip install -r requirements.txt`
- May need to install Cython first: `pip install Cython setuptools wheel`

### "Port 8001 already in use"
- Change port: `uvicorn main:app --host 0.0.0.0 --port 8002`
- Update `.env.local` with new port

### Railway Build Fails
- Check Railway logs: `railway logs`
- Ensure `nixpacks.toml` includes FFmpeg
- Check `requirements.txt` is correct

## 📋 Quick Commands

### Railway Deployment
```bash
cd dechord-service
railway login
railway init
railway up
railway domain
```

### Local Development
```bash
cd dechord-service
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

## 🎯 Next Steps

1. ✅ Choose deployment method (Railway recommended)
2. ✅ Deploy/run the service
3. ✅ Get service URL
4. ✅ Set `DECHORD_SERVICE_URL` in Vercel
5. ✅ Test from `/dechord` page

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

