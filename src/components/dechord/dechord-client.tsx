'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Song {
  id: string
  title: string
  artist: string | null
  youtube_url: string | null
  youtube_id: string | null
  thumbnail_url: string | null
}

interface ChordSegment {
  startTime: number
  endTime: number
  chord: string
}

interface AnalysisResult {
  chords: ChordSegment[]
  key: string
  tempo: number
  duration: number
  title?: string
}

const DeChordClient = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  // Fetch songs from database
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('id, title, artist, youtube_url, youtube_id, thumbnail_url')
          .order('title')
          .limit(100)

        if (error) throw error
        setSongs(data || [])
      } catch (err) {
        console.error('Error fetching songs:', err)
      }
    }

    fetchSongs()
  }, [supabase])

  // Filter songs based on search query
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song)
    setAnalysisResult(null)
    setError(null)
    setUploadedFile(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setSelectedSong(null)
      setYoutubeUrl('')
      setAnalysisResult(null)
      setError(null)
    }
  }

  const handleYoutubeUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value
    setYoutubeUrl(url)
    if (url) {
      setSelectedSong(null)
      setUploadedFile(null)
      setAnalysisResult(null)
      setError(null)
    }
  }

  const analyzeAudio = async () => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const DECHORD_SERVICE_URL = process.env.NEXT_PUBLIC_DECHORD_SERVICE_URL || 'http://localhost:8001'

      if (youtubeUrl) {
        // Analyze YouTube URL
        const formData = new FormData()
        formData.append('url', youtubeUrl)

        const response = await fetch(`${DECHORD_SERVICE_URL}/analyze-youtube`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result: AnalysisResult = await response.json()
        setAnalysisResult(result)
      } else if (uploadedFile) {
        // Analyze uploaded file
        const formData = new FormData()
        formData.append('file', uploadedFile)
        const title = uploadedFile.name.replace(/\.[^/.]+$/, '')
        formData.append('title', title)

        const response = await fetch(`${DECHORD_SERVICE_URL}/analyze`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result: AnalysisResult = await response.json()
        setAnalysisResult(result)
      } else if (selectedSong?.youtube_url) {
        // Analyze selected song's YouTube URL
        const formData = new FormData()
        formData.append('url', selectedSong.youtube_url)

        const response = await fetch(`${DECHORD_SERVICE_URL}/analyze-youtube`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result: AnalysisResult = await response.json()
        setAnalysisResult(result)
      } else {
        setError('Please enter a YouTube URL, upload an audio file, or select a song with a YouTube URL')
        setIsAnalyzing(false)
        return
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze audio. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="dechord-analyzer">
      <div className="row g-4">
        {/* Left Column - Song Selection */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h3 className="h4 mb-4">Select Song or Upload Audio</h3>

              {/* YouTube URL Input */}
              <div className="mb-4">
                <label className="form-label fw-semibold">YouTube URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={handleYoutubeUrlChange}
                />
                <small className="text-muted d-block mt-2">
                  Paste a YouTube video URL to analyze
                </small>
                {youtubeUrl && (
                  <div className="alert alert-info mt-3 mb-0">
                    <i className="bi bi-youtube me-2"></i>
                    YouTube URL entered
                  </div>
                )}
              </div>

              <div className="text-center my-4">
                <span className="text-muted">OR</span>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Upload Audio File</label>
                <input
                  type="file"
                  className="form-control"
                  accept="audio/*,.mp3,.wav,.m4a,.aac"
                  onChange={handleFileUpload}
                />
                <small className="text-muted d-block mt-2">
                  Supported formats: MP3, WAV, M4A, AAC
                </small>
                {uploadedFile && (
                  <div className="alert alert-info mt-3 mb-0">
                    <i className="bi bi-file-earmark-music me-2"></i>
                    Selected: <strong>{uploadedFile.name}</strong>
                  </div>
                )}
              </div>

              <div className="text-center my-4">
                <span className="text-muted">OR</span>
              </div>

              {/* Song Search */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Search Songs</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Song List */}
              <div className="song-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredSongs.length === 0 ? (
                  <p className="text-muted text-center py-4">No songs found</p>
                ) : (
                  <div className="list-group">
                    {filteredSongs.map((song) => (
                      <button
                        key={song.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${
                          selectedSong?.id === song.id ? 'active' : ''
                        }`}
                        onClick={() => handleSongSelect(song)}
                      >
                        <div className="d-flex align-items-center">
                          {song.thumbnail_url && (
                            <img
                              src={song.thumbnail_url}
                              alt={song.title}
                              className="rounded me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          )}
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{song.title}</h6>
                            {song.artist && (
                              <small className="text-muted">{song.artist}</small>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <button
                className="btn btn-primary w-100 mt-4"
                onClick={analyzeAudio}
                disabled={isAnalyzing || (!selectedSong && !uploadedFile && !youtubeUrl)}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-music-note-beamed me-2"></i>
                    Analyze Audio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h3 className="h4 mb-4">Analysis Results</h3>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {analysisResult && (
                <div className="analysis-results">
                  {/* Key and Tempo */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h5 className="text-muted mb-2">Key</h5>
                          <h3 className="mb-0">{analysisResult.key}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h5 className="text-muted mb-2">Tempo</h5>
                          <h3 className="mb-0">{Math.round(analysisResult.tempo)} BPM</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-4">
                    <p className="text-muted mb-0">
                      <i className="bi bi-clock me-2"></i>
                      Duration: {formatTime(analysisResult.duration)}
                    </p>
                  </div>

                  {/* Chords List */}
                  <div className="mb-3">
                    <h5 className="mb-3">
                      <i className="bi bi-music-note-list me-2"></i>
                      Detected Chords ({analysisResult.chords.length})
                    </h5>
                    <div className="chords-timeline" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <div className="list-group">
                        {analysisResult.chords.map((chord, index) => (
                          <div
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <span className="badge bg-primary me-2">{chord.chord}</span>
                              <small className="text-muted">
                                {formatTime(chord.startTime)} - {formatTime(chord.endTime)}
                              </small>
                            </div>
                            <small className="text-muted">
                              {Math.round((chord.endTime - chord.startTime) * 10) / 10}s
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chord Progression Summary */}
                  <div className="mt-4">
                    <h5 className="mb-3">Chord Progression</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {Array.from(new Set(analysisResult.chords.map(c => c.chord))).map((chord, index) => (
                        <span key={index} className="badge bg-secondary fs-6 p-2">
                          {chord}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!analysisResult && !error && !isAnalyzing && (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-music-note-beamed fs-1 d-block mb-3"></i>
                  <p>Select a song or upload an audio file to analyze</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeChordClient

