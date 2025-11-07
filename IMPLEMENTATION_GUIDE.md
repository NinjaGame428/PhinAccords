# PhinAccords Complete Implementation Guide
## Heavenkeys Ltd - PhinAccords AI-Powered Chord Extraction Platform

This document outlines the complete implementation of all premium features for PhinAccords.

## ✅ Completed Components

### 1. Python Audio Processing Service
**Location**: `python-service/`

- **FastAPI service** with librosa and madmom integration
- **Chord extraction** using chroma features and template matching
- **Beat tracking** using madmom's DBN beat tracker
- **Downbeat detection** for bar alignment
- **Tempo estimation** from beat intervals
- **Key estimation** using librosa
- **YouTube integration** via yt-dlp

**To Run**:
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 2. Subscription System
**Location**: `src/lib/subscription.ts`

- **Pricing Tiers**:
  - Free: Basic features only
  - Basic: CA$2.25/month (CA$27/year) - All Premium + Toolkit
  - Premium: CA$4/month (CA$48/year) - Advanced features
  - Premium + Toolkit: CA$1.25/month first year (CA$144), then CA$72/year
- **Feature flags** per tier
- **Upload limitations** per tier
- **Pricing calculations** and formatting

### 3. Pricing Page
**Location**: `src/components/pricing/pricing-area.tsx`

- Complete pricing display with all tiers
- Monthly/Yearly toggle
- Feature comparison
- FAQ section
- Matches industry-standard pricing structure

### 4. Audio Extraction API
**Location**: `src/app/api/audio/extract-chords/route.ts`

- File upload handling (MP3, MP4, OGG)
- YouTube URL processing
- Subscription validation
- Calls Python service for processing
- Database integration

## 🚧 In Progress / To Implement

### 5. Premium Features Toolbar
**Needs**: Create `src/components/premium/toolbar.tsx`

Features to implement:
- ✅ Transpose controls (up/down semitones)
- ✅ Capo selector (0-11 frets)
- ✅ Tempo/BPM slider (50-200 BPM)
- ✅ Loop toggle and section selection
- ✅ Volume controls (song & chords separate)
- ✅ MIDI export button
- ✅ PDF export button
- ✅ Playback controls (play, pause, seek)
- ✅ Count-off feature

### 6. Toolkit Features
**Needs**: Create `src/components/toolkit/`

#### 6.1 Tuner Component
- Polyphonic tuner (detect all strings at once)
- Support for guitar, ukulele, mandolin
- Visual frequency display
- Pitch detection using Web Audio API

#### 6.2 Metronome Component
- Adjustable BPM (30-300)
- Time signatures (4/4, 3/4, 6/8, etc.)
- Drumbeat sounds
- Visual beat indicators
- Tap tempo

#### 6.3 Practice Chords Component
- Chord library browser
- Chord diagrams for all instruments
- Practice mode with audio playback
- Progress tracking

#### 6.4 Live Chord Detection
- Real-time audio analysis
- Microphone input processing
- Display detected chords in real-time
- Uses Web Audio API + Essentia.js or backend processing

### 7. Song Player with Premium Features
**Needs**: Update `src/components/songs/song-player.tsx`

Features:
- Audio playback with controls
- Chord display synchronized with audio
- Transpose functionality
- Capo visualization
- Tempo adjustment
- Loop section selection
- Volume controls
- Count-off before playback

### 8. MIDI Export
**Needs**: Create `src/lib/midi-export.ts`

- Generate MIDI file from chord progression
- Two versions:
  - Quantized (for sheet music software)
  - Time-aligned (for DAWs)
- Include bass line track
- Export as .mid file

### 9. PDF Export
**Needs**: Create `src/lib/pdf-export.ts`

- Generate PDF chord sheets
- Include chord diagrams
- Song metadata (title, artist, key, tempo)
- Print-friendly layout
- Use jsPDF library

### 10. Setlists Feature
**Needs**: Create `src/components/setlists/`

- Create and manage setlists
- Add/remove songs
- Reorder songs
- Share setlists
- Offline access

### 11. Upload Component
**Needs**: Create `src/components/upload/audio-upload.tsx`

- Drag & drop file upload
- YouTube URL input
- Progress indicator
- File validation
- Processing status
- Support: MP3, MP4, OGG (max 32-50MB, 20min)

### 12. Lyrics Integration
**Needs**: Integrate LyricFind API or similar

- Display lyrics synchronized with chords
- Scroll automatically with playback
- Highlight current line
- Search songs by lyrics

### 13. YouTube Integration
**Needs**: Update song detail page

- Embed YouTube player
- Extract audio from YouTube URLs
- Sync chords with video playback
- Full-screen mode

## 🔧 Technical Implementation Details

### Python Service Setup

1. **Install Dependencies**:
```bash
cd python-service
pip install -r requirements.txt
```

2. **Set Environment Variables**:
```env
PYTHON_SERVICE_URL=http://localhost:8000
```

3. **Run Service**:
```bash
uvicorn main:app --reload --port 8000
```

### Database Schema Updates

Add to `user_profiles` table:
```sql
ALTER TABLE user_profiles 
ADD COLUMN subscription_tier TEXT DEFAULT 'free',
ADD COLUMN subscription_status TEXT DEFAULT 'active',
ADD COLUMN subscription_start_date TIMESTAMP,
ADD COLUMN subscription_end_date TIMESTAMP,
ADD COLUMN billing_cycle TEXT DEFAULT 'monthly';
```

### Environment Variables

Add to `.env.local`:
```env
PYTHON_SERVICE_URL=http://localhost:8000
LYRICFIND_API_KEY=your_key_here  # For lyrics integration
```

## 📋 Feature Checklist

### Free Features
- [x] View chords
- [x] View lyrics
- [x] Search songs
- [x] Basic chord diagrams
- [x] Multiple instruments (guitar, piano, ukulele, mandolin)

### Basic Features (CA$2.25/month)
- [ ] Unlimited access to songs
- [ ] All Premium benefits
- [ ] Complete access to Toolkit

### Premium Features (CA$4/month)
- [ ] No commercial advertising
- [ ] Transpose in one click
- [ ] Download chord MIDI files
- [ ] Chord diagrams and sheets in PDF
- [ ] Change the tempo
- [ ] Setlists to organize songs
- [ ] Loop parts of a song
- [ ] Digital capo
- [ ] Count-off for perfect timing
- [ ] Song and chords volume
- [ ] Upload your own music files

### Toolkit Features (Premium + Toolkit)
- [ ] Tuner with advanced functions
- [ ] Metronome with drumbeat
- [ ] Learn and practice all chords
- [ ] Detect what chord is playing (Live Chord Detection)

## 🎯 Next Steps

1. **Create Premium Toolbar Component** - Integrate into song detail pages
2. **Implement MIDI Export** - Use mido or similar library
3. **Implement PDF Export** - Use jsPDF
4. **Create Toolkit Components** - Tuner, Metronome, Practice, Live Detection
5. **Update Song Player** - Add all premium controls
6. **Create Setlists Feature** - Database tables and UI
7. **Add Upload UI** - Drag & drop interface
8. **Integrate Lyrics** - LyricFind API or similar
9. **YouTube Integration** - React Player + chord sync
10. **Branding** - All references updated to PhinAccords/Heavenkeys

## 🔐 Security & Performance

- Validate all file uploads (size, type, content)
- Rate limit audio processing requests
- Authenticate all premium feature access
- Cache processed chord progressions
- Use Redis for job queue (Celery)
- Implement request throttling
- GPU acceleration for Python service (optional)

## 📊 Production Deployment

### Python Service
- Deploy to separate server/container
- Use Docker for consistency
- Set up Redis for job queue
- Use Celery for async processing
- Monitor with logging and metrics

### Next.js App
- Deploy to Vercel
- Set environment variables
- Configure CORS for Python service
- Set up CDN for static assets

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)
**Status**: Foundation Complete, Core Features In Progress

