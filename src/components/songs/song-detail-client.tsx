'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Song } from '@/types/song'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface SongDetailClientProps {
  song: Song
}

const SongDetailClient: React.FC<SongDetailClientProps> = ({ song }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { user } = useAuth()
  const { success, error: notifyError } = useNotification()
  const { t } = useLanguage()
  const [currentKey, setCurrentKey] = useState(song.key_signature || 'C')

  const isFav = isFavorite(song.id)

  const handleFavoriteToggle = async () => {
    if (!user) {
      notifyError('Please log in to add favorites')
      return
    }

    if (isFav) {
      const { error } = await removeFavorite(song.id)
      if (error) {
        notifyError('Failed to remove favorite')
      } else {
        success('Removed from favorites')
      }
    } else {
      const { error } = await addFavorite(song.id)
      if (error) {
        notifyError('Failed to add favorite')
      } else {
        success('Added to favorites')
      }
    }
  }

  const transposeKey = (key: string, semitones: number) => {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const currentIndex = keys.indexOf(key)
    if (currentIndex === -1) return key
    const newIndex = (currentIndex + semitones + 12) % 12
    return keys[newIndex]
  }

  const handleTranspose = (direction: 'up' | 'down') => {
    const semitones = direction === 'up' ? 1 : -1
    setCurrentKey(transposeKey(currentKey, semitones))
  }

  return (
    <div className="song-detail">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div>
              <h1 className="mb-2">{song.title}</h1>
              <p className="text-muted mb-2">
                {song.artist || song.artist_data?.name || 'Unknown Artist'}
                {song.genre && ` • ${song.genre}`}
                {song.year && ` • ${song.year}`}
              </p>
            </div>
            <button
              className="btn-six tran3s"
              onClick={handleFavoriteToggle}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <i className={`bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
            </button>
          </div>

          {/* Metadata */}
          <div className="d-flex flex-wrap gap-3 mb-3">
            {song.key_signature && (
              <div>
                <span className="badge bg-secondary">{t('song.key')}: {currentKey}</span>
              </div>
            )}
            {song.difficulty && (
              <div>
                <span className="badge bg-info">{t('song.difficulty')}: {song.difficulty}</span>
              </div>
            )}
            {song.tempo && (
              <div>
                <span className="badge bg-success">Tempo: {song.tempo}</span>
              </div>
            )}
            {song.time_signature && (
              <div>
                <span className="badge bg-warning">Time: {song.time_signature}</span>
              </div>
            )}
          </div>

          {/* Transpose Controls */}
          {song.key_signature && (
            <div className="mb-3">
              <label className="form-label">Transpose Key:</label>
              <div className="btn-group" role="group">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleTranspose('down')}
                >
                  <i className="bi bi-arrow-down"></i>
                </button>
                <span className="btn btn-sm btn-outline-secondary disabled">
                  {currentKey}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleTranspose('up')}
                >
                  <i className="bi bi-arrow-up"></i>
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="d-flex gap-4 text-muted small">
            {song.rating !== undefined && (
              <div>
                <i className="bi bi-star-fill text-warning"></i> {song.rating.toFixed(1)}
              </div>
            )}
            {song.downloads !== undefined && (
              <div>
                <i className="bi bi-download"></i> {song.downloads} {t('song.downloads')}
              </div>
            )}
          </div>
        </div>

        {song.thumbnail_url && (
          <div className="col-md-4">
            <Image
              src={song.thumbnail_url}
              alt={song.title}
              width={400}
              height={300}
              className="img-fluid rounded"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
      </div>

      {/* Description */}
      {song.description && (
        <div className="mb-4">
          <p>{song.description}</p>
        </div>
      )}

      {/* YouTube Video */}
      {song.youtube_url && (
        <div className="mb-4">
          <h3>Video</h3>
          <div className="ratio ratio-16x9">
            <iframe
              src={`https://www.youtube.com/embed/${song.youtube_id || song.youtube_url.split('/').pop()}`}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Lyrics and Chords */}
      {song.lyrics && (
        <div className="mb-4">
          <h3>Lyrics & Chords</h3>
          <div className="card">
            <div className="card-body">
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {song.lyrics}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Chord Chart */}
      {song.chord_chart && (
        <div className="mb-4">
          <h3>Chord Chart</h3>
          <div className="card">
            <div className="card-body">
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {song.chord_chart}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Chord Progression */}
      {song.chord_progression && (
        <div className="mb-4">
          <h3>Chord Progression</h3>
          <div className="card">
            <div className="card-body">
              <p className="mb-0">{song.chord_progression}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {song.tags && song.tags.length > 0 && (
        <div className="mb-4">
          <h3>Tags</h3>
          <div>
            {song.tags.map((tag, index) => (
              <span key={index} className="badge bg-secondary me-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-4">
        <Link href="/" className="btn-six tran3s">
          <i className="bi bi-arrow-left"></i> Back to Songs
        </Link>
      </div>
    </div>
  )
}

export default SongDetailClient

