# DeChord YouTube Support - Ready! 🎵
## PhinAccords - Heavenkeys Ltd

✅ **YouTube URL support has been added to the DeChord analyzer!**

## 🎯 New Features

### YouTube URL Analysis
- **Direct YouTube URL input** - Paste any YouTube video URL
- **Automatic audio download** - Downloads audio using yt-dlp
- **Full analysis** - Detects chords, key, and tempo from YouTube videos
- **Video title extraction** - Automatically gets video title

## 📍 How to Use

### Step 1: Access the Page
1. Navigate to `/dechord` or click "Chord Analyzer" in the menu
2. The page is already in the navigation menu ✅

### Step 2: Enter YouTube URL
1. In the "YouTube URL" field, paste a YouTube video URL
2. Supported formats:
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://www.youtube.com/embed/VIDEO_ID`

### Step 3: Analyze
1. Click "Analyze Audio" button
2. The service will:
   - Download audio from YouTube
   - Extract video title
   - Analyze chords, key, and tempo
   - Display results

### Step 4: View Results
- **Key**: Musical key detected
- **Tempo**: BPM detected
- **Chords**: Complete timeline with timestamps
- **Progression**: Unique chords summary

## 🔧 Technical Details

### DeChord Service Updates
- ✅ Added `yt-dlp` dependency
- ✅ Added `/analyze-youtube` endpoint
- ✅ Added FFmpeg support (for audio conversion)
- ✅ Automatic audio download and cleanup

### API Routes
- ✅ `/api/dechord/analyze` - For file uploads
- ✅ `/api/dechord/analyze-youtube` - For YouTube URLs

### Frontend Updates
- ✅ YouTube URL input field
- ✅ YouTube URL validation
- ✅ Support for YouTube URLs from selected songs
- ✅ Error handling for invalid URLs

## 📋 Requirements

### DeChord Service
The service needs:
- `yt-dlp` - For YouTube downloads
- `ffmpeg` - For audio conversion
- Python 3.12+

### Environment Variables
Set in Vercel:
- `DECHORD_SERVICE_URL` - Your Railway DeChord service URL

## 🚀 Deployment

### Railway Deployment
The DeChord service is configured for Railway with:
- ✅ `nixpacks.toml` - Includes FFmpeg
- ✅ `requirements.txt` - Includes yt-dlp
- ✅ YouTube endpoint ready

### Build Notes
- FFmpeg is included in Nixpacks setup
- yt-dlp will be installed during build
- Service handles YouTube downloads automatically

## 🎨 UI Features

### Input Options
1. **YouTube URL** - Paste YouTube link (NEW!)
2. **File Upload** - Upload audio file
3. **Song Selection** - Select from database

### Analysis Flow
- All three methods work independently
- Only one can be active at a time
- Clear visual feedback for selected option

## ⚠️ Important Notes

1. **Processing Time**: 
   - YouTube downloads add 30-60 seconds
   - Analysis takes 30-90 seconds
   - Total: 1-2 minutes for YouTube videos

2. **File Size**: 
   - YouTube videos are downloaded as MP3 (192kbps)
   - Temporary files are automatically cleaned up

3. **Rate Limits**: 
   - YouTube may rate limit if too many requests
   - Use responsibly

4. **Copyright**: 
   - Only analyze videos you have permission to use
   - Respect YouTube's Terms of Service

## 🐛 Troubleshooting

**"Invalid YouTube URL"**
- Ensure URL includes `youtube.com` or `youtu.be`
- Check URL format is correct

**"YouTube download failed"**
- Check DeChord service is running
- Verify FFmpeg is installed
- Check service logs

**"Analysis failed"**
- Video may be too long (>10 minutes may timeout)
- Check service has enough resources
- Try a shorter video

## ✅ Checklist

- [x] YouTube URL input added
- [x] DeChord service YouTube endpoint
- [x] yt-dlp dependency added
- [x] FFmpeg support configured
- [x] API route for YouTube
- [x] Error handling
- [x] Navigation menu link (already exists)
- [x] Code pushed to GitHub

## 🎉 Ready to Use!

The DeChord analyzer now supports:
- ✅ YouTube URLs
- ✅ File uploads
- ✅ Database song selection
- ✅ Full chord/key/tempo analysis

**Next Step**: Deploy DeChord service to Railway and set `DECHORD_SERVICE_URL` in Vercel!

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

