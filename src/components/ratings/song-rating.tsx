'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import type { Rating } from '@/types/rating'

interface SongRatingProps {
  songId: string
  initialRating?: number
  initialComment?: string
}

const SongRating: React.FC<SongRatingProps> = ({ songId, initialRating, initialComment }) => {
  const { user } = useAuth()
  const { success, error: notifyError } = useNotification()
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(initialRating || 0)
  const [comment, setComment] = useState(initialComment || '')
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [loading, setLoading] = useState(false)
  const [recentRatings, setRecentRatings] = useState<Rating[]>([])

  useEffect(() => {
    fetchRatings()
  }, [songId])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?songId=${songId}`)
      if (response.ok) {
        const data = await response.json()
        setAverageRating(data.averageRating || 0)
        setTotalRatings(data.totalRatings || 0)
        setRecentRatings(data.ratings || [])
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  const handleRatingClick = async (rating: number) => {
    if (!user) {
      notifyError('Please log in to rate songs')
      return
    }

    setSelectedRating(rating)
    await submitRating(rating, comment)
  }

  const submitRating = async (rating: number, commentText: string) => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          song_id: songId,
          rating,
          comment: commentText,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit rating')
      }

      success('Rating submitted successfully!')
      await fetchRatings()
    } catch (error: any) {
      notifyError(error.message || 'Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (selectedRating === 0) {
      notifyError('Please select a rating first')
      return
    }

    await submitRating(selectedRating, comment)
  }

  if (!user) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="text-muted mb-0">
            <a href="/login" className="text-decoration-none">
              Sign in
            </a>{' '}
            to rate this song
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="song-rating">
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Rate this Song</h5>

          {/* Star Rating */}
          <div className="mb-3">
            <div className="d-flex align-items-center gap-2" role="group" aria-label="Rating">
              <span className="me-2" id="rating-label">Rating:</span>
              <div role="radiogroup" aria-labelledby="rating-label" aria-required="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-link p-0 border-0 touch-target"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => handleRatingClick(star)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleRatingClick(star)
                      } else if (e.key === 'ArrowRight' && star < 5) {
                        e.preventDefault()
                        const next = e.currentTarget.nextElementSibling as HTMLElement
                        next?.focus()
                      } else if (e.key === 'ArrowLeft' && star > 1) {
                        e.preventDefault()
                        const prev = e.currentTarget.previousElementSibling as HTMLElement
                        prev?.focus()
                      }
                    }}
                    disabled={loading}
                    style={{ fontSize: '1.5rem', lineHeight: 1 }}
                    aria-label={`Rate ${star} out of 5 stars`}
                    aria-pressed={selectedRating === star}
                    role="radio"
                    tabIndex={star === 1 ? 0 : selectedRating === star ? 0 : -1}
                  >
                    <i
                      className={`bi ${
                        star <= (hoveredRating || selectedRating)
                          ? 'bi-star-fill text-warning'
                          : 'bi-star text-muted'
                      }`}
                      aria-hidden="true"
                    ></i>
                  </button>
                ))}
              </div>
              {selectedRating > 0 && (
                <span className="ms-2 text-muted small" aria-live="polite">
                  {selectedRating} out of 5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-3">
            <label htmlFor="rating-comment" className="form-label">
              Comment (optional)
            </label>
            <textarea
              className="form-control"
              id="rating-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this song..."
              disabled={loading}
            />
          </div>

          <button
            className="btn-one tran3s touch-target"
            onClick={handleCommentSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCommentSubmit()
              }
            }}
            disabled={loading || selectedRating === 0}
            aria-label="Submit rating"
            tabIndex={0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </button>
        </div>
      </div>

      {/* Average Rating Display */}
      {totalRatings > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title">Overall Rating</h6>
            <div className="d-flex align-items-center gap-2">
              <div className="display-6 fw-bold">{averageRating.toFixed(1)}</div>
              <div>
                <div className="d-flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`bi ${
                        star <= Math.round(averageRating)
                          ? 'bi-star-fill text-warning'
                          : 'bi-star text-muted'
                      }`}
                    ></i>
                  ))}
                </div>
                <small className="text-muted">Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {recentRatings.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Recent Ratings</h6>
            <div className="list-group list-group-flush">
              {recentRatings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`bi ${
                              star <= rating.rating
                                ? 'bi-star-fill text-warning'
                                : 'bi-star text-muted'
                            }`}
                            style={{ fontSize: '0.875rem' }}
                          ></i>
                        ))}
                      </div>
                      {rating.comment && <p className="mb-0 small">{rating.comment}</p>}
                    </div>
                    <small className="text-muted">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SongRating

