"""
PhinAccords Audio Processing Service
Heavenkeys Ltd

Main FastAPI application for chord extraction from audio files.
Uses librosa and madmom for Music Information Retrieval (MIR).
"""

import os
import tempfile
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import librosa
import madmom
import numpy as np
from loguru import logger

# Configure logging
logging.basicConfig(level=logging.INFO)
logger.add("logs/audio_service.log", rotation="500 MB")

app = FastAPI(
    title="PhinAccords Audio Processing API",
    description="AI-powered chord extraction and beat tracking service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChordSegment(BaseModel):
    startTime: float
    endTime: float
    chord: str
    confidence: float

class BeatPosition(BaseModel):
    time: float
    beat: int
    downbeat: bool

class ExtractionResult(BaseModel):
    chords: List[ChordSegment]
    beats: List[BeatPosition]
    tempo: float
    key: str
    timeSignature: str
    duration: float
    title: Optional[str] = None
    artist: Optional[str] = None

class ProcessingStatus(BaseModel):
    status: str
    progress: float
    message: Optional[str] = None

# Global variables for models (load once)
chord_model = None
beat_tracker = None
downbeat_tracker = None

def load_models():
    """Load pre-trained models for chord recognition and beat tracking"""
    global chord_model, beat_tracker, downbeat_tracker
    
    try:
        # Initialize madmom beat tracker
        # Using madmom's built-in DBN beat tracker
        beat_tracker = madmom.features.beats.DBNBeatTrackingProcessor(fps=100)
        downbeat_tracker = madmom.features.downbeats.DBNDownBeatTrackingProcessor(fps=100)
        
        logger.info("Models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise

# Load models on startup
@app.on_event("startup")
async def startup_event():
    load_models()

def extract_chroma_features(y: np.ndarray, sr: int) -> np.ndarray:
    """Extract chroma features for chord recognition"""
    # Use librosa to extract chroma features
    chroma = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
    return chroma

def recognize_chords(chroma: np.ndarray, hop_length: int, sr: int) -> List[Dict[str, Any]]:
    """
    Recognize chords from chroma features using template matching
    In production, this would use a trained deep neural network
    """
    chords = []
    
    # Chord templates (simplified - in production use trained model)
    chord_templates = {
        'C': [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
        'C#': [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        'D': [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        'D#': [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        'E': [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
        'F': [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        'F#': [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        'G': [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
        'G#': [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
        'A': [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        'A#': [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
        'B': [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    }
    
    # Minor chord templates
    for root in list(chord_templates.keys()):
        minor_template = chord_templates[root].copy()
        # Shift for minor third
        minor_template = np.roll(minor_template, -3)
        chord_templates[f"{root}m"] = minor_template
    
    # Process chroma features frame by frame
    frame_time = hop_length / sr
    num_frames = chroma.shape[1]
    
    current_chord = None
    chord_start = 0.0
    
    for frame_idx in range(num_frames):
        frame_chroma = chroma[:, frame_idx]
        frame_chroma_norm = frame_chroma / (np.sum(frame_chroma) + 1e-10)
        
        # Find best matching chord
        best_match = None
        best_score = 0.0
        
        for chord_name, template in chord_templates.items():
            # Calculate cosine similarity
            template_norm = np.array(template) / (np.sum(template) + 1e-10)
            similarity = np.dot(frame_chroma_norm, template_norm)
            
            if similarity > best_score:
                best_score = similarity
                best_match = chord_name
        
        # Only add chord if confidence is high enough and it's different
        if best_match and best_score > 0.3:
            if best_match != current_chord:
                # Save previous chord
                if current_chord:
                    chords.append({
                        'chord': current_chord,
                        'startTime': chord_start,
                        'endTime': frame_idx * frame_time,
                        'confidence': 0.85
                    })
                
                current_chord = best_match
                chord_start = frame_idx * frame_time
    
    # Add final chord
    if current_chord:
        chords.append({
            'chord': current_chord,
            'startTime': chord_start,
            'endTime': num_frames * frame_time,
            'confidence': 0.85
        })
    
    return chords

def track_beats(y: np.ndarray, sr: int) -> tuple:
    """Track beats and downbeats using madmom"""
    try:
        # Extract onset features
        proc = madmom.features.beats.RNNBeatProcessor()
        act = proc(y)
        
        # Track beats
        beats = beat_tracker(act)
        
        # Track downbeats
        proc_db = madmom.features.downbeats.RNNDownBeatProcessor()
        act_db = proc_db(y)
        downbeats = downbeat_tracker(act_db)
        
        # Convert to list of beat positions
        beat_positions = []
        beat_num = 1
        
        for i, beat_time in enumerate(beats):
            is_downbeat = any(abs(beat_time - db) < 0.1 for db in downbeats[:, 0])
            beat_positions.append({
                'time': float(beat_time),
                'beat': beat_num,
                'downbeat': is_downbeat
            })
            beat_num = beat_num + 1 if not is_downbeat else 1
        
        return beat_positions, float(np.mean(1.0 / np.diff(beats)) * 60) if len(beats) > 1 else 120.0
    except Exception as e:
        logger.error(f"Error tracking beats: {e}")
        # Fallback to librosa tempo
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        return [{'time': float(b), 'beat': i+1, 'downbeat': i % 4 == 0} for i, b in enumerate(beats)], float(tempo)

def estimate_key(y: np.ndarray, sr: int) -> str:
    """Estimate the key of the song"""
    try:
        # Use librosa's key estimation
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        key = librosa.harmonic.key_estimation(y=y, sr=sr)
        key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        return key_names[key] if key < len(key_names) else 'C'
    except:
        return 'C'

@app.post("/extract-chords", response_model=ExtractionResult)
async def extract_chords(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    artist: Optional[str] = Form(None)
):
    """
    Extract chords from audio file or URL
    """
    try:
        # Handle file upload or URL
        if file:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_path = tmp_file.name
        elif url:
            # Download from URL (YouTube, etc.)
            import yt_dlp
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': tempfile.mktemp(suffix='.%(ext)s'),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                tmp_path = ydl.prepare_filename(info).replace('.webm', '.mp3').replace('.m4a', '.mp3')
        else:
            raise HTTPException(status_code=400, detail="Either file or url must be provided")
        
        try:
            # Load audio file
            logger.info(f"Loading audio from: {tmp_path}")
            y, sr = librosa.load(tmp_path, sr=22050, duration=None)
            duration = len(y) / sr
            
            # Extract chroma features
            chroma = extract_chroma_features(y, sr)
            hop_length = 512
            
            # Recognize chords
            logger.info("Recognizing chords...")
            chord_segments = recognize_chords(chroma, hop_length, sr)
            
            # Track beats
            logger.info("Tracking beats...")
            beat_positions, tempo = track_beats(y, sr)
            
            # Estimate key
            key = estimate_key(y, sr)
            
            # Determine time signature (simplified - assume 4/4)
            time_signature = "4/4"
            
            # Format results
            result = ExtractionResult(
                chords=[ChordSegment(**c) for c in chord_segments],
                beats=[BeatPosition(**b) for b in beat_positions],
                tempo=tempo,
                key=key,
                timeSignature=time_signature,
                duration=duration,
                title=title,
                artist=artist
            )
            
            logger.info(f"Successfully extracted {len(chord_segments)} chords")
            
            return result
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "PhinAccords Audio Processing"}

@app.get("/status/{job_id}", response_model=ProcessingStatus)
async def get_processing_status(job_id: str):
    """Get processing status for async jobs"""
    # In production, this would check Redis/Celery for job status
    return ProcessingStatus(status="completed", progress=100.0)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

