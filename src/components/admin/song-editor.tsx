'use client'

import React, { useState, useEffect } from 'react'
import type { Song } from '@/types/song'
import { useNotification } from '@/contexts/NotificationContext'

interface SongEditorProps {
  song?: Song | null
  onClose: () => void
  onSave: (songData?: any) => void
}

const SongEditor: React.FC<SongEditorProps> = ({ song, onClose, onSave }) => {
  const { error: notifyError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    artist_id: '',
    genre: '',
    key_signature: '',
    difficulty: '',
    category: '',
    lyrics: '',
    chord_chart: '',
    chord_progression: '',
    description: '',
    youtube_url: '',
    tags: '',
  })

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title || '',
        artist: song.artist || '',
        artist_id: song.artist_id || '',
        genre: song.genre || '',
        key_signature: song.key_signature || '',
        difficulty: song.difficulty || '',
        category: song.category || '',
        lyrics: song.lyrics || '',
        chord_chart: song.chord_chart || '',
        chord_progression: song.chord_progression || '',
        description: song.description || '',
        youtube_url: song.youtube_url || '',
        tags: song.tags?.join(', ') || '',
      })
    }
  }, [song])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
      }

      onSave(payload)
    } catch (err: any) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{song ? 'Edit Song' : 'Add New Song'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Artist *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="artist"
                    value={formData.artist}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Genre</label>
                  <input
                    type="text"
                    className="form-control"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Key</label>
                  <select
                    className="form-select"
                    name="key_signature"
                    value={formData.key_signature}
                    onChange={handleChange}
                  >
                    <option value="">Select key</option>
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(
                      (key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="">Select difficulty</option>
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Lyrics <small className="text-muted">(Use [Verse 1], [Chorus], etc. for sections)</small>
                  </label>
                  <textarea
                    className="form-control font-monospace"
                    rows={10}
                    name="lyrics"
                    value={formData.lyrics}
                    onChange={handleChange}
                    placeholder="[Verse 1]&#10;Line 1&#10;Line 2&#10;&#10;[Chorus]&#10;Chorus line 1&#10;Chorus line 2"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Chord Chart</label>
                  <textarea
                    className="form-control font-monospace"
                    rows={8}
                    name="chord_chart"
                    value={formData.chord_chart}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Chord Progression</label>
                  <input
                    type="text"
                    className="form-control"
                    name="chord_progression"
                    value={formData.chord_progression}
                    onChange={handleChange}
                    placeholder="C - G - Am - F"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">YouTube URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="youtube_url"
                    value={formData.youtube_url}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="worship, praise, contemporary"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-six tran3s" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-one tran3s" disabled={loading}>
                {loading ? 'Saving...' : song ? 'Update Song' : 'Add Song'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SongEditor

