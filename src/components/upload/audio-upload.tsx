/**
 * PhinAccords Audio Upload Component
 * Heavenkeys Ltd
 * 
 * Upload audio files or YouTube URLs for chord extraction
 */

'use client'

import React, { useState, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { hasFeature, canUpload } from '@/lib/subscription'
import { Upload, Youtube, FileAudio, X, Loader } from 'lucide-react'

const AudioUpload: React.FC = () => {
  const { t } = useLanguage()
  const { user, subscription } = useAuth()
  const { success, error: notifyError } = useNotification()
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tier = subscription?.tier || 'free'
  const canUploadFiles = hasFeature(tier, 'upload')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (selectedFile.size > maxSize) {
      notifyError('File size exceeds 50MB limit')
      return
    }

    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'video/mp4']
    if (!allowedTypes.includes(selectedFile.type)) {
      notifyError('Invalid file type. Supported: MP3, MP4, OGG')
      return
    }

    setFile(selectedFile)
    
    // Extract title from filename if not provided
    if (!title) {
      const filename = selectedFile.name.replace(/\.[^/.]+$/, '')
      setTitle(filename)
    }
  }

  const handleUpload = async () => {
    if (!user) {
      notifyError('Please log in to upload songs')
      return
    }

    if (!canUploadFiles) {
      notifyError('Upload requires Basic, Premium, or Premium + Toolkit subscription')
      return
    }

    if (uploadType === 'file' && !file) {
      notifyError('Please select a file')
      return
    }

    if (uploadType === 'url' && !url.trim()) {
      notifyError('Please enter a URL')
      return
    }

    setIsUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      
      if (uploadType === 'file' && file) {
        formData.append('file', file)
      } else {
        formData.append('url', url)
      }
      
      if (title) formData.append('title', title)
      if (artist) formData.append('artist', artist)

      const response = await fetch('/api/audio/extract-chords', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      success('Song uploaded and chords extracted successfully!')
      setProgress(100)

      // Redirect to song page
      if (result.songId) {
        window.location.href = `/songs/${result.songId}`
      }
    } catch (error: any) {
      notifyError(error.message || 'Failed to upload song')
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const event = {
        target: { files: [droppedFile] },
      } as any
      handleFileSelect(event)
    }
  }

  if (!user) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="text-muted">Please log in to upload songs</p>
          <a href="/login" className="btn-one">
            Log In
          </a>
        </div>
      </div>
    )
  }

  if (!canUploadFiles) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h5>Upload Songs - Subscription Required</h5>
          <p className="text-muted">
            Upload your own music files to extract chords. Available with Basic, Premium, or Premium + Toolkit.
          </p>
          <a href="/pricing" className="btn-one">
            View Plans
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Upload Song</h5>
        <p className="text-muted small mb-0">
          Upload MP3, MP4, or OGG files (max 32-50MB, 20 minutes) or paste a YouTube URL
        </p>
      </div>
      <div className="card-body">
        {/* Upload Type Toggle */}
        <div className="btn-group w-100 mb-4" role="group">
          <button
            type="button"
            className={`btn ${uploadType === 'file' ? 'btn-one' : 'btn-outline-secondary'}`}
            onClick={() => setUploadType('file')}
          >
            <FileAudio className="h-4 w-4 me-2" />
            Upload File
          </button>
          <button
            type="button"
            className={`btn ${uploadType === 'url' ? 'btn-one' : 'btn-outline-secondary'}`}
            onClick={() => setUploadType('url')}
          >
            <Youtube className="h-4 w-4 me-2" />
            YouTube URL
          </button>
        </div>

        {/* File Upload */}
        {uploadType === 'file' && (
          <div
            className="upload-area border-2 border-dashed rounded p-5 text-center mb-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              borderColor: file ? 'var(--color-one)' : '#dee2e6',
              background: file ? 'rgba(207, 255, 69, 0.1)' : '#f8f9fa',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/mp4,audio/ogg,video/mp4"
              onChange={handleFileSelect}
              className="d-none"
            />
            
            {file ? (
              <div>
                <FileAudio className="h-5 w-5 mb-2 text-color-one" />
                <p className="mb-1 fw-bold">{file.name}</p>
                <p className="text-muted small mb-2">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  <X className="h-4 w-4" /> Remove
                </button>
              </div>
            ) : (
              <div>
                <Upload className="h-5 w-5 mb-2 text-muted" />
                <p className="mb-1">Drag & drop a file here</p>
                <p className="text-muted small">or click to browse</p>
              </div>
            )}
          </div>
        )}

        {/* URL Input */}
        {uploadType === 'url' && (
          <div className="mb-4">
            <label className="form-label">YouTube or Audio URL</label>
            <div className="input-group">
              <span className="input-group-text">
                <Youtube className="h-4 w-4" />
              </span>
              <input
                type="url"
                className="form-control"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <small className="text-muted">
              Paste a YouTube, SoundCloud, or direct audio file URL
            </small>
          </div>
        )}

        {/* Song Info */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="form-label">Song Title (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Artist (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>
        </div>

        {/* Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="progress" style={{ height: '25px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-color-one"
                role="progressbar"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
            <p className="text-center mt-2 small text-muted">
              Processing audio and extracting chords...
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          className="btn btn-one w-100"
          onClick={handleUpload}
          disabled={isUploading || (uploadType === 'file' && !file) || (uploadType === 'url' && !url.trim())}
        >
          {isUploading ? (
            <>
              <Loader className="h-4 w-4 me-2 spinner-border spinner-border-sm" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 me-2" />
              Upload & Extract Chords
            </>
          )}
        </button>

        <p className="text-muted small mt-3 mb-0">
          <strong>Note:</strong> Processing may take a few moments. Our AI will analyze the audio and extract chord progressions automatically.
        </p>
      </div>
    </div>
  )
}

export default AudioUpload

