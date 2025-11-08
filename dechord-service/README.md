# DeChord Web Service - PhinAccords
## Heavenkeys Ltd

Web API version of DeChord for real-time chord and key recognition from audio files.

Based on: https://github.com/chinmaykrishnroy/DeChord

## Features

- **Chord Recognition**: Real-time chord detection using madmom
- **Key Recognition**: Musical key detection
- **Tempo Detection**: BPM detection using librosa
- **Caching**: Results cached for faster subsequent requests
- **REST API**: Simple HTTP endpoints for integration

## API Endpoints

### POST /analyze
Complete audio analysis (chords, key, tempo)

**Request:**
- `file`: Audio file (multipart/form-data)
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

## Deployment

### Railway

```bash
cd dechord-service
railway login
railway init
railway up
railway domain
```

### Local Development

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

## Integration with PhinAccords

Set the service URL in Vercel:
- Key: `DECHORD_SERVICE_URL`
- Value: `https://your-dechord-service.railway.app`

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

