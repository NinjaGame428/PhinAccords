'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Song } from '@/types/song'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'

interface SongCardProps {
  song: Song
  viewMode?: 'grid' | 'list'
}

const SongCard: React.FC<SongCardProps> = ({ song, viewMode = 'grid' }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { user } = useAuth()
  const { success, error: notifyError } = useNotification()

  const isFav = isFavorite(song.id)

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  if (viewMode === 'list') {
    return (
      <div className="list-group-item">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <Link href={`/songs/${song.slug}`} className="text-decoration-none">
              <h5 className="mb-1">{song.title}</h5>
            </Link>
            <p className="mb-1 text-muted">
              {song.artist || song.artist_data?.name || 'Unknown Artist'}
              {song.genre && ` • ${song.genre}`}
            </p>
            <small className="text-muted">
              {song.key_signature && `Key: ${song.key_signature} • `}
              {song.difficulty && `Difficulty: ${song.difficulty}`}
            </small>
          </div>
          <button
            className="btn btn-sm btn-outline-primary ms-3"
            onClick={handleFavoriteToggle}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="col-lg-4 col-md-6">
      <div className="card h-100 shadow-sm">
        {song.thumbnail_url && (
          <Link href={`/songs/${song.slug}`}>
            <Image
              src={song.thumbnail_url}
              alt={song.title}
              width={400}
              height={225}
              className="card-img-top"
              style={{ objectFit: 'cover', height: '225px' }}
            />
          </Link>
        )}
        <div className="card-body d-flex flex-column">
          <Link href={`/songs/${song.slug}`} className="text-decoration-none">
            <h5 className="card-title">{song.title}</h5>
          </Link>
          <p className="card-text text-muted small">
            {song.artist || song.artist_data?.name || 'Unknown Artist'}
          </p>
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="small text-muted">
                {song.key_signature && (
                  <span className="badge bg-secondary me-1">{song.key_signature}</span>
                )}
                {song.difficulty && (
                  <span className="badge bg-info">{song.difficulty}</span>
                )}
              </div>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleFavoriteToggle}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <i className={`bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
              </button>
            </div>
            {song.rating && (
              <div className="small">
                <i className="bi bi-star-fill text-warning"></i> {song.rating.toFixed(1)}
                {song.downloads !== undefined && (
                  <span className="ms-3 text-muted">
                    <i className="bi bi-download"></i> {song.downloads}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SongCard

