# Python Service Deployment Guide
## PhinAccords - Heavenkeys Ltd

Complete guide for deploying the Python audio processing service.

## 🚀 Quick Start

### Option 1: Local Development

```bash
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

Service will run on `http://localhost:8000`

### Option 2: Docker Deployment (Recommended for Production)

#### Create Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Build and Run

```bash
cd python-service

# Build Docker image
docker build -t phinaccords-audio-service .

# Run container
docker run -d \
  -p 8000:8000 \
  -e PYTHON_SERVICE_URL=http://localhost:8000 \
  --name phinaccords-audio \
  phinaccords-audio-service
```

### Option 3: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd python-service
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Service URL**
   ```bash
   railway domain
   ```

6. **Update Environment Variable**
   - Go to Vercel Dashboard
   - Settings → Environment Variables
   - Update `PYTHON_SERVICE_URL` with Railway URL

### Option 4: Deploy to Render

1. **Create New Web Service**
   - Go to [Render Dashboard](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `phinaccords-audio-service`
   - **Root Directory**: `python-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   - No additional variables needed for basic setup

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

5. **Get Service URL**
   - Copy the service URL from Render dashboard
   - Format: `https://phinaccords-audio-service.onrender.com`

6. **Update Vercel Environment Variable**
   - Go to Vercel Dashboard
   - Settings → Environment Variables
   - Update `PYTHON_SERVICE_URL` with Render URL

### Option 5: Deploy to Fly.io

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Create Fly App**
   ```bash
   cd python-service
   fly launch
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

5. **Get Service URL**
   ```bash
   fly info
   ```

6. **Update Environment Variable**
   - Update `PYTHON_SERVICE_URL` in Vercel with Fly.io URL

## 🔧 Configuration

### Environment Variables

The Python service doesn't require any environment variables for basic operation, but you can add:

```env
# Optional: For production
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info

# Optional: For enhanced features
OPENAI_API_KEY=your_key_here  # For AI-powered chord detection
```

### Update Vercel Environment Variables

After deploying the Python service:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `phin-accords`
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   - **Key**: `PYTHON_SERVICE_URL`
   - **Value**: Your deployed service URL (e.g., `https://your-service.railway.app`)
5. Click **Save**
6. Redeploy your Next.js app

## 🧪 Testing the Service

### Health Check

```bash
curl https://your-service-url.com/health
```

Should return:
```json
{"status": "healthy", "service": "PhinAccords Audio Processing"}
```

### Test Chord Extraction

```bash
curl -X POST https://your-service-url.com/extract-chords \
  -F "file=@test-audio.mp3" \
  -F "title=Test Song" \
  -F "artist=Test Artist"
```

## 📊 Monitoring

### Check Service Logs

**Railway:**
```bash
railway logs
```

**Render:**
- Go to Dashboard → Service → Logs

**Fly.io:**
```bash
fly logs
```

**Docker:**
```bash
docker logs phinaccords-audio
```

## 🔒 Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Authentication**: Add API key authentication for production
3. **CORS**: Configure CORS to only allow your Vercel domain
4. **File Size Limits**: Set maximum file size (e.g., 50MB)

## 🐛 Troubleshooting

### Service Won't Start

**Error**: `ModuleNotFoundError: No module named 'librosa'`
- **Solution**: Make sure virtual environment is activated and dependencies are installed

**Error**: `FFmpeg not found`
- **Solution**: Install FFmpeg:
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

### Service Not Accessible

**Error**: Connection refused
- **Solution**: Check service is running and port is correct
- **Solution**: Verify firewall/security group allows traffic on port 8000

**Error**: CORS errors
- **Solution**: Add your Vercel domain to CORS allowed origins in `main.py`

### Upload Feature Not Working

**Error**: `Failed to fetch`
- **Solution**: Check `PYTHON_SERVICE_URL` is set correctly in Vercel
- **Solution**: Verify service is accessible from public internet
- **Solution**: Check service logs for errors

## 📝 Next Steps

After deploying the Python service:

1. ✅ Update `PYTHON_SERVICE_URL` in Vercel
2. ✅ Test the service health endpoint
3. ✅ Test file upload from the app
4. ✅ Monitor service logs
5. ✅ Set up alerts/monitoring

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

