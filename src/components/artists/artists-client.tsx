'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Artist } from '@/types/song'

interface ArtistsClientProps {}

const ArtistsClient: React.FC<ArtistsClientProps> = () => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
  })
  const [artistStats, setArtistStats] = useState<Record<string, { songCount: number; avgRating: number }>>({})

  useEffect(() => {
    fetchArtists()
  }, [filters])

  useEffect(() => {
    if (artists.length > 0) {
      fetchArtistStats()
    }
  }, [artists])

  const fetchArtists = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('q', filters.search)

      const response = await fetch(`/api/artists?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch artists')

      const data = await response.json()
      setArtists(data.artists || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchArtistStats = async () => {
    try {
      // Fetch song counts and ratings for each artist
      const statsPromises = artists.map(async (artist) => {
        const response = await fetch(`/api/songs?artist_id=${artist.id}&limit=1`)
        if (response.ok) {
          const data = await response.json()
          // Calculate average rating from songs
          const songs = data.songs || []
          const avgRating =
            songs.length > 0
              ? songs.reduce((sum: number, song: any) => sum + (song.rating || 0), 0) / songs.length
              : 0

          return {
            id: artist.id,
            songCount: data.total || 0,
            avgRating,
          }
        }
        return { id: artist.id, songCount: 0, avgRating: 0 }
      })

      const stats = await Promise.all(statsPromises)
      const statsMap: Record<string, { songCount: number; avgRating: number }> = {}
      stats.forEach((stat) => {
        statsMap[stat.id] = { songCount: stat.songCount, avgRating: stat.avgRating }
      })
      setArtistStats(statsMap)
    } catch (error) {
      console.error('Error fetching artist stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading artists...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="artists-page">
      {/* Filters and View Toggle */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label">Search Artists</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="bi bi-grid"></i> Grid
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="bi bi-list"></i> List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artists Display */}
      {artists.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No artists found. Try adjusting your search.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="row g-4">
          {artists.map((artist) => {
            const stats = artistStats[artist.id] || { songCount: 0, avgRating: 0 }
            return (
              <div key={artist.id} className="col-lg-3 col-md-4 col-sm-6">
                <Link href={`/artists/${artist.id}`} className="text-decoration-none">
                  <div className="card h-100 shadow-sm">
                    {artist.image_url && (
                      <div style={{ height: '200px', overflow: 'hidden' }}>
                        <Image
                          src={artist.image_url}
                          alt={artist.name}
                          width={300}
                          height={200}
                          className="card-img-top"
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{artist.name}</h5>
                      {artist.bio && (
                        <p className="card-text text-muted small" style={{ height: '60px', overflow: 'hidden' }}>
                          {artist.bio.substring(0, 100)}...
                        </p>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {stats.songCount} song{stats.songCount !== 1 ? 's' : ''}
                        </small>
                        {stats.avgRating > 0 && (
                          <small>
                            <i className="bi bi-star-fill text-warning"></i> {stats.avgRating.toFixed(1)}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="list-group">
          {artists.map((artist) => {
            const stats = artistStats[artist.id] || { songCount: 0, avgRating: 0 }
            return (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="list-group-item list-group-item-action"
              >
                <div className="d-flex align-items-center">
                  {artist.image_url && (
                    <Image
                      src={artist.image_url}
                      alt={artist.name}
                      width={80}
                      height={80}
                      className="rounded me-3"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{artist.name}</h5>
                    {artist.bio && (
                      <p className="mb-1 text-muted small">{artist.bio.substring(0, 150)}...</p>
                    )}
                    <div className="d-flex gap-3">
                      <small className="text-muted">
                        {stats.songCount} song{stats.songCount !== 1 ? 's' : ''}
                      </small>
                      {stats.avgRating > 0 && (
                        <small>
                          <i className="bi bi-star-fill text-warning"></i> {stats.avgRating.toFixed(1)}
                        </small>
                      )}
                      {artist.website && (
                        <small>
                          <i className="bi bi-link-45deg"></i> Website
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ArtistsClient

