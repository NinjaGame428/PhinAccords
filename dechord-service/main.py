"""
DeChord Web Service - PhinAccords
Heavenkeys Ltd

Web API version of DeChord for real-time chord and key recognition
Based on: https://github.com/chinmaykrishnroy/DeChord
"""

import os
import hashlib
import tempfile
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import madmom
import librosa
import numpy as np
from loguru import logger
import yt_dlp
import subprocess

# Configure logging
logging.basicConfig(level=logging.INFO)
os.makedirs("logs", exist_ok=True)
logger.add("logs/dechord_service.log", rotation="500 MB")

app = FastAPI(
    title="DeChord Web API - PhinAccords",
    description="Real-time chord and key recognition from audio files",
    version="1.0.0"
)

# CORS middleware
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://phin-accords-kzhmbuv20-jackmichaels-projects.vercel.app,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChordSegment(BaseModel):
    startTime: float
    endTime: float
    chord: str

class AnalysisResult(BaseModel):
    chords: List[ChordSegment]
    key: str
    tempo: float
    duration: float
    title: Optional[str] = None

def format_chord_label(chord_label: str) -> str:
    """Format chord label (remove :maj, replace :min with m)"""
    if ":maj" in chord_label:
        return chord_label.replace(":maj", "")
    elif ":min" in chord_label:
        return chord_label.replace(":min", "m")
    return chord_label

def adjust_tempo(tempo: float) -> float:
    """Adjust tempo to reasonable range (matching DeChord logic)"""
    while tempo < 70:
        tempo *= 2
    while tempo > 190:
        tempo /= 2
    return tempo

def recognize_chords(audio_path: str) -> List[tuple]:
    """
    Recognize chords from audio file using madmom
    Returns list of (start_time, end_time, chord_label) tuples
    """
    try:
        cache_dir = "cache/chord/"
        os.makedirs(cache_dir, exist_ok=True)
        
        # Create cache key from file path
        hash_object = hashlib.md5(audio_path.encode())
        hashed_filename = hash_object.hexdigest() + ".txt"
        cache_file = os.path.join(cache_dir, hashed_filename)
        
        # Check cache
        if os.path.exists(cache_file):
            logger.info(f"Loading chords from cache: {cache_file}")
            chords = []
            with open(cache_file, "r") as f:
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) == 3:
                        start, end, label = parts
                        chords.append((float(start), float(end), label))
            return chords
        
        # Process audio
        logger.info(f"Processing chords for: {audio_path}")
        feat_processor = madmom.features.chords.CNNChordFeatureProcessor()
        recog_processor = madmom.features.chords.CRFChordRecognitionProcessor()
        
        feats = feat_processor(audio_path)
        chords = recog_processor(feats)
        
        # Format and cache results
        formatted_chords = []
        with open(cache_file, "w") as f:
            for chord in chords:
                start_time, end_time, chord_label = chord
                formatted_label = format_chord_label(chord_label)
                formatted_chords.append((start_time, end_time, formatted_label))
                f.write(f"{start_time},{end_time},{formatted_label}\n")
        
        logger.info(f"Recognized {len(formatted_chords)} chords")
        return formatted_chords
        
    except Exception as e:
        logger.error(f"Error recognizing chords: {e}")
        raise HTTPException(status_code=500, detail=f"Chord recognition failed: {str(e)}")

def recognize_key(audio_path: str) -> str:
    """
    Recognize musical key from audio file using madmom
    Returns key as string (e.g., "C major", "A minor")
    """
    try:
        cache_dir = "cache/key/"
        os.makedirs(cache_dir, exist_ok=True)
        
        # Create cache key
        hash_object = hashlib.md5(audio_path.encode())
        hashed_filename = hash_object.hexdigest() + ".txt"
        cache_file = os.path.join(cache_dir, hashed_filename)
        
        # Check cache
        if os.path.exists(cache_file):
            logger.info(f"Loading key from cache: {cache_file}")
            with open(cache_file, "r") as f:
                return f.read().strip()
        
        # Process audio
        logger.info(f"Processing key for: {audio_path}")
        key_processor = madmom.features.key.CNNKeyRecognitionProcessor()
        key_prediction = key_processor(audio_path)
        key = madmom.features.key.key_prediction_to_label(key_prediction)
        
        # Cache result
        with open(cache_file, "w") as f:
            f.write(key)
        
        logger.info(f"Recognized key: {key}")
        return key
        
    except Exception as e:
        logger.error(f"Error recognizing key: {e}")
        return "Unknown"

def detect_tempo(audio_path: str) -> float:
    """
    Detect tempo (BPM) from audio file using madmom (matching DeChord implementation)
    Returns tempo as float
    """
    try:
        cache_dir = "cache/tempo/"
        os.makedirs(cache_dir, exist_ok=True)
        
        # Create cache key
        hash_object = hashlib.md5(audio_path.encode())
        hashed_filename = hash_object.hexdigest() + ".txt"
        cache_file = os.path.join(cache_dir, hashed_filename)
        
        # Check cache
        if os.path.exists(cache_file):
            logger.info(f"Loading tempo from cache: {cache_file}")
            with open(cache_file, "r") as f:
                return float(f.read().strip())
        
        # Process audio using madmom (matching DeChord)
        logger.info(f"Processing tempo for: {audio_path}")
        from madmom.features.beats import RNNBeatProcessor
        from madmom.features.tempo import TempoEstimationProcessor
        
        beat_processor = RNNBeatProcessor()
        beats = beat_processor(audio_path)
        tempo_processor = TempoEstimationProcessor(fps=200)
        tempos = tempo_processor(beats)
        
        if len(tempos):
            top_tempo = tempos[0][0]
            # Adjust tempo (matching DeChord logic)
            adjusted_tempo = adjust_tempo(top_tempo)
            
            # Cache result
            with open(cache_file, "w") as f:
                f.write(str(round(adjusted_tempo)))
            
            logger.info(f"Detected tempo: {adjusted_tempo} BPM")
            return float(round(adjusted_tempo))
        else:
            return 120.0  # Default tempo
        
    except Exception as e:
        logger.error(f"Error detecting tempo: {e}")
        return 120.0  # Default tempo

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_audio(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = None
):
    """
    Analyze audio file for chords, key, and tempo
    Returns complete analysis result
    """
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Get audio duration
            y, sr = librosa.load(tmp_path)
            duration = float(librosa.get_duration(y=y, sr=sr))
            
            # Process in parallel (could be optimized with async)
            logger.info("Starting audio analysis...")
            
            # Recognize chords
            chords_data = recognize_chords(tmp_path)
            
            # Recognize key
            key = recognize_key(tmp_path)
            
            # Detect tempo
            tempo = detect_tempo(tmp_path)
            
            # Format chords
            chord_segments = [
                ChordSegment(
                    startTime=float(start),
                    endTime=float(end),
                    chord=label
                )
                for start, end, label in chords_data
            ]
            
            result = AnalysisResult(
                chords=chord_segments,
                key=key,
                tempo=tempo,
                duration=duration,
                title=title or Path(file.filename).stem
            )
            
            logger.info(f"Analysis complete: {len(chord_segments)} chords, key={key}, tempo={tempo}")
            
            # Clean up temp file in background
            if background_tasks:
                background_tasks.add_task(os.unlink, tmp_path)
            else:
                os.unlink(tmp_path)
            
            return result
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/chords", response_model=List[ChordSegment])
async def get_chords(file: UploadFile = File(...)):
    """Extract only chords from audio file"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            chords_data = recognize_chords(tmp_path)
            chord_segments = [
                ChordSegment(
                    startTime=float(start),
                    endTime=float(end),
                    chord=label
                )
                for start, end, label in chords_data
            ]
            return chord_segments
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Error extracting chords: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/key")
async def get_key(file: UploadFile = File(...)):
    """Extract only key from audio file"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            key = recognize_key(tmp_path)
            return {"key": key}
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Error extracting key: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/tempo")
async def get_tempo(file: UploadFile = File(...)):
    """Extract only tempo from audio file"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            tempo = detect_tempo(tmp_path)
            return {"tempo": tempo}
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Error detecting tempo: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def download_youtube_audio(url: str, output_path: str) -> tuple[str, str]:
    """
    Download audio from YouTube URL using yt-dlp
    Returns (audio_file_path, video_title)
    """
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_path,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'Unknown')
            # yt-dlp adds extension automatically
            audio_path = output_path + '.mp3'
            
            return audio_path, title
    except Exception as e:
        logger.error(f"Error downloading YouTube audio: {e}")
        raise HTTPException(status_code=500, detail=f"YouTube download failed: {str(e)}")

@app.post("/analyze-youtube", response_model=AnalysisResult)
async def analyze_youtube(
    url: str = Form(...),
    background_tasks: BackgroundTasks = None
):
    """
    Analyze YouTube video for chords, key, and tempo
    Downloads audio from YouTube URL and analyzes it
    """
    try:
        # Validate YouTube URL
        if 'youtube.com' not in url and 'youtu.be' not in url:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Create temp file for download
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
            tmp_path = tmp_file.name
        
        try:
            # Download audio from YouTube
            logger.info(f"Downloading audio from YouTube: {url}")
            audio_path, video_title = download_youtube_audio(url, tmp_path)
            
            if not os.path.exists(audio_path):
                raise HTTPException(status_code=500, detail="Failed to download audio")
            
            # Get audio duration
            y, sr = librosa.load(audio_path)
            duration = float(librosa.get_duration(y=y, sr=sr))
            
            # Process analysis
            logger.info("Starting audio analysis...")
            
            # Recognize chords
            chords_data = recognize_chords(audio_path)
            
            # Recognize key
            key = recognize_key(audio_path)
            
            # Detect tempo
            tempo = detect_tempo(audio_path)
            
            # Format chords
            chord_segments = [
                ChordSegment(
                    startTime=float(start),
                    endTime=float(end),
                    chord=label
                )
                for start, end, label in chords_data
            ]
            
            result = AnalysisResult(
                chords=chord_segments,
                key=key,
                tempo=tempo,
                duration=duration,
                title=video_title
            )
            
            logger.info(f"Analysis complete: {len(chord_segments)} chords, key={key}, tempo={tempo}")
            
            # Clean up temp files in background
            if background_tasks:
                background_tasks.add_task(os.unlink, audio_path)
                background_tasks.add_task(os.unlink, tmp_path)
            else:
                if os.path.exists(audio_path):
                    os.unlink(audio_path)
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
            
            return result
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            if 'audio_path' in locals() and os.path.exists(audio_path):
                os.unlink(audio_path)
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error processing YouTube request: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "DeChord Web API - PhinAccords",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8001)))

