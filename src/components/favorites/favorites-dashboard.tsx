'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import type { Song } from '@/types/song'
import type { Resource } from '@/types/resource'

const FavoritesDashboard: React.FC = () => {
  const { favorites, favoriteSongIds, favoriteResourceIds, removeFavorite } = useFavorites()
  const { user } = useAuth()
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([])
  const [favoriteResources, setFavoriteResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user && favorites.length > 0) {
      fetchFavoriteSongs()
      fetchFavoriteResources()
    } else {
      setLoading(false)
    }
  }, [user, favorites])

  const fetchFavoriteSongs = async () => {
    try {
      const songIds = Array.from(favoriteSongIds)
      if (songIds.length === 0) {
        setFavoriteSongs([])
        return
      }

      // Fetch each favorite song
      const songPromises = songIds.map((id) =>
        fetch(`/api/songs/${id}`).then((res) => res.json()).then((data) => data.song)
      )
      const songs = await Promise.all(songPromises)
      setFavoriteSongs(songs.filter((s) => s !== null))
    } catch (error) {
      console.error('Error fetching favorite songs:', error)
    }
  }

  const fetchFavoriteResources = async () => {
    try {
      const resourceIds = Array.from(favoriteResourceIds)
      if (resourceIds.length === 0) {
        setFavoriteResources([])
        return
      }

      // Fetch each favorite resource
      const resourcePromises = resourceIds.map((id) =>
        fetch(`/api/resources/${id}`).then((res) => res.json()).then((data) => data.resource)
      )
      const resources = await Promise.all(resourcePromises)
      setFavoriteResources(resources.filter((r) => r !== null))
    } catch (error) {
      console.error('Error fetching favorite resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (songId?: string, resourceId?: string) => {
    await removeFavorite(songId, resourceId)
    if (songId) {
      setFavoriteSongs((prev) => prev.filter((s) => s.id !== songId))
    } else if (resourceId) {
      setFavoriteResources((prev) => prev.filter((r) => r.id !== resourceId))
    }
  }

  const filteredSongs = favoriteSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredResources = favoriteResources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description &&
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading favorites...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-dashboard">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-3">My Favorites</h1>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-muted mb-0">
              {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
            </p>
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: '300px' }}
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Favorite Songs */}
      {filteredSongs.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3">Favorite Songs ({filteredSongs.length})</h3>
          <div className="row g-4">
            {filteredSongs.map((song) => (
              <div key={song.id} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Link href={`/songs/${song.slug}`} className="text-decoration-none">
                        <h5 className="card-title mb-1">{song.title}</h5>
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveFavorite(song.id)}
                        aria-label="Remove from favorites"
                      >
                        <i className="bi bi-heart-fill"></i>
                      </button>
                    </div>
                    <p className="text-muted small mb-2">
                      {song.artist || song.artist_data?.name || 'Unknown Artist'}
                    </p>
                    {song.key_signature && (
                      <span className="badge bg-secondary me-1">{song.key_signature}</span>
                    )}
                    {song.difficulty && (
                      <span className="badge bg-info">{song.difficulty}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Resources */}
      {filteredResources.length > 0 && (
        <div>
          <h3 className="mb-3">Favorite Resources ({filteredResources.length})</h3>
          <div className="row g-4">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-1">{resource.title}</h5>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveFavorite(undefined, resource.id)}
                        aria-label="Remove from favorites"
                      >
                        <i className="bi bi-heart-fill"></i>
                      </button>
                    </div>
                    {resource.description && (
                      <p className="text-muted small mb-2">{resource.description}</p>
                    )}
                    {resource.category && (
                      <span className="badge bg-secondary">{resource.category}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-heart display-1 text-muted"></i>
          <h3 className="mt-3">No favorites yet</h3>
          <p className="text-muted">
            Start exploring songs and resources, and add them to your favorites!
          </p>
          <Link href="/" className="btn-one tran3s">
            Browse Songs
          </Link>
        </div>
      )}
    </div>
  )
}

export default FavoritesDashboard

