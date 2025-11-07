'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'

const RequestSongClient: React.FC = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error: notifyError } = useNotification()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    key: '',
    difficulty: '',
    description: '',
    contactEmail: user?.email || '',
    priority: 'Normal',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const genres = [
    'Gospel',
    'Contemporary Christian',
    'Hymn',
    'Worship',
    'Praise',
    'Traditional',
    'African Gospel',
    'Reggae Gospel',
    'Other',
  ]

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  const difficulties = ['Easy', 'Medium', 'Hard']

  const priorities = ['Low', 'Normal', 'High', 'Urgent']

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Song title is required'
    }

    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist name is required'
    }

    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch('/api/song-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre || null,
          key: formData.key || null,
          difficulty: formData.difficulty || null,
          message: formData.description || null,
          contact_email: formData.contactEmail || null,
          priority: formData.priority,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit request')
      }

      setIsSubmitted(true)
      success('Song request submitted successfully! We will review it and add it to our collection.')
    } catch (err: any) {
      notifyError(err.message || 'Failed to submit song request')
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="card shadow">
        <div className="card-body text-center p-5">
          <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
          <h2 className="mb-3">Request Submitted!</h2>
          <p className="text-muted mb-4">
            Thank you for your song request. We will review it and add it to our collection as soon
            as possible.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn-one tran3s"
              onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  title: '',
                  artist: '',
                  genre: '',
                  key: '',
                  difficulty: '',
                  description: '',
                  contactEmail: user?.email || '',
                  priority: 'Normal',
                })
              }}
            >
              Submit Another Request
            </button>
            <button className="btn-six tran3s" onClick={() => router.push('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow">
      <div className="card-body p-4">
        <h2 className="card-title mb-4">Request a Song</h2>
        <p className="text-muted mb-4">
          Can't find a song you're looking for? Request it here and we'll add it to our collection!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="title" className="form-label">
                Song Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter song title"
                disabled={loading}
                required
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="artist" className="form-label">
                Artist <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.artist ? 'is-invalid' : ''}`}
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Enter artist name"
                disabled={loading}
                required
              />
              {errors.artist && <div className="invalid-feedback">{errors.artist}</div>}
            </div>

            <div className="col-md-4">
              <label htmlFor="genre" className="form-label">
                Genre
              </label>
              <select
                className="form-select"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="key" className="form-label">
                Key
              </label>
              <select
                className="form-select"
                id="key"
                name="key"
                value={formData.key}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select key</option>
                {keys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="difficulty" className="form-label">
                Difficulty
              </label>
              <select
                className="form-select"
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select difficulty</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label htmlFor="description" className="form-label">
                Additional Information
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Any additional information about the song (optional)"
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="contactEmail" className="form-label">
                Contact Email
              </label>
              <input
                type="email"
                className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={loading}
              />
              {errors.contactEmail && (
                <div className="invalid-feedback">{errors.contactEmail}</div>
              )}
              <div className="form-text">We'll notify you when the song is added</div>
            </div>

            <div className="col-md-6">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                className="form-select"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestSongClient

