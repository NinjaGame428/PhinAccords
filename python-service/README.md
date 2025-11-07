# PhinAccords Audio Processing Service

Python microservice for automatic chord extraction from audio files using Music Information Retrieval (MIR) techniques.

## Features

- **Automatic Chord Extraction**: Uses librosa and madmom to extract chord progressions from audio
- **Beat Tracking**: Accurate beat and downbeat detection
- **Tempo Estimation**: Automatic BPM detection
- **Key Estimation**: Automatic key detection
- **YouTube Integration**: Extract audio from YouTube URLs
- **Deep Learning**: Ready for neural network-based chord recognition

## Setup

1. Install Python 3.9+ and FFmpeg

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the service:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### POST /extract-chords
Extract chords from audio file or URL.

**Parameters:**
- `file`: Audio file (MP3, MP4, OGG)
- `url`: YouTube or audio URL (optional)
- `title`: Song title (optional)
- `artist`: Artist name (optional)

**Response:**
```json
{
  "chords": [
    {
      "startTime": 0.0,
      "endTime": 2.5,
      "chord": "C",
      "confidence": 0.95
    }
  ],
  "beats": [...],
  "tempo": 120.0,
  "key": "C",
  "timeSignature": "4/4",
  "duration": 180.5
}
```

### GET /health
Health check endpoint.

## Production Deployment

For production, consider:
- Using Docker containers
- Redis for job queue
- Celery for async processing
- Trained neural network models for better accuracy
- GPU acceleration for faster processing

## Model Training

To improve chord recognition accuracy:
1. Train a deep neural network on labeled chord datasets
2. Use transfer learning from pre-trained models
3. Fine-tune on your specific music genres

## License

Copyright © 2025 Heavenkeys Ltd. All rights reserved.

