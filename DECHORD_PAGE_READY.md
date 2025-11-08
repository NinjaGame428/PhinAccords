# DeChord Analyzer Page - Ready! 🎵
## PhinAccords - Heavenkeys Ltd

✅ **DeChord analyzer page has been created and is ready to use!**

## 📍 Page Location

**URL**: `/dechord`  
**Menu**: Added to navigation menu as "Chord Analyzer"

## 🎯 Features

### 1. **Song Selection**
- Search and select songs from your database
- Displays song title, artist, and thumbnail
- Shows up to 100 songs from database

### 2. **Audio File Upload**
- Upload audio files directly
- Supported formats: MP3, WAV, M4A, AAC
- Drag and drop or click to upload

### 3. **Automatic Analysis**
- **Chord Detection**: Identifies all chords with timing
- **Key Detection**: Determines the musical key
- **Tempo Detection**: Calculates BPM
- **Duration**: Shows total song length

### 4. **Results Display**
- **Key & Tempo Cards**: Visual display of key and BPM
- **Chord Timeline**: List of all detected chords with timestamps
- **Chord Progression**: Summary of unique chords used
- **Time Formatting**: Human-readable time display (MM:SS)

## 🚀 How to Use

### Step 1: Access the Page
1. Navigate to `/dechord` in your browser
2. Or click "Chord Analyzer" in the navigation menu

### Step 2: Select or Upload
**Option A - Upload Audio File:**
1. Click "Upload Audio File"
2. Select an audio file (MP3, WAV, M4A, AAC)
3. File will be shown as selected

**Option B - Select from Database:**
1. Type in the search box to filter songs
2. Click on a song from the list
3. Song will be highlighted

### Step 3: Analyze
1. Click "Analyze Audio" button
2. Wait for analysis (may take 30-60 seconds)
3. Results will appear in the right panel

### Step 4: View Results
- **Key**: Musical key (e.g., "C major", "A minor")
- **Tempo**: Beats per minute
- **Chords**: Complete list with timestamps
- **Progression**: Unique chords summary

## 🔧 Configuration

### Environment Variable

Add to your `.env.local` and Vercel:

```env
DECHORD_SERVICE_URL=https://your-dechord-service.railway.app
```

Or use the API proxy route (already configured):
- The page uses `/api/dechord/analyze` which proxies to the DeChord service
- Set `DECHORD_SERVICE_URL` in your environment variables

## 📋 API Route

**Endpoint**: `/api/dechord/analyze`

**Method**: POST

**Request**:
- `file`: Audio file (multipart/form-data)
- `title`: Optional song title

**Response**:
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

## 🎨 UI Components

- **Left Panel**: Song selection and file upload
- **Right Panel**: Analysis results
- **Bootstrap 5**: Styled with project theme
- **Responsive**: Works on mobile and desktop

## 🔗 Integration

The page integrates with:
- ✅ Supabase database (song list)
- ✅ DeChord service (audio analysis)
- ✅ Next.js API routes (proxy)
- ✅ Project navigation menu

## 📝 Notes

1. **YouTube URLs**: Currently not supported for direct analysis. Users need to upload audio files.

2. **Analysis Time**: 
   - Small files (< 3 min): ~30 seconds
   - Medium files (3-5 min): ~60 seconds
   - Large files (> 5 min): ~90+ seconds

3. **Caching**: DeChord service caches results, so re-analyzing the same file is faster.

4. **Error Handling**: 
   - Shows clear error messages
   - Handles network errors
   - Validates file types

## 🎉 Next Steps

1. ✅ Page created
2. ✅ Menu added
3. ✅ API route created
4. ⏳ Set `DECHORD_SERVICE_URL` in Vercel
5. ⏳ Test with real audio files

## 🐛 Troubleshooting

**"DeChord service URL not configured"**
- Set `DECHORD_SERVICE_URL` in environment variables

**"Failed to analyze audio"**
- Check DeChord service is running
- Verify file format is supported
- Check network connection

**"No songs found"**
- Ensure songs exist in database
- Check Supabase connection

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

