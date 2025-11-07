'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Artist } from '@/types/song'
import type { Song } from '@/types/song'
import SongCard from '@/components/songs/song-card'

interface ArtistDetailClientProps {
  artist: Artist
}

const ArtistDetailClient: React.FC<ArtistDetailClientProps> = ({ artist }) => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ songCount: 0, avgRating: 0 })

  useEffect(() => {
    fetchSongs()
  }, [artist.id])

  const fetchSongs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/songs?artist_id=${artist.id}`)
      if (!response.ok) throw new Error('Failed to fetch songs')

      const data = await response.json()
      setSongs(data.songs || [])
      setStats({
        songCount: data.total || 0,
        avgRating:
          data.songs && data.songs.length > 0
            ? data.songs.reduce((sum: number, song: Song) => sum + (song.rating || 0), 0) /
              data.songs.length
            : 0,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.genre && song.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="artist-detail">
      {/* Artist Header */}
      <div className="row mb-5">
        <div className="col-md-3">
          {artist.image_url ? (
            <Image
              src={artist.image_url}
              alt={artist.name}
              width={300}
              height={300}
              className="img-fluid rounded shadow"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              className="bg-secondary rounded d-flex align-items-center justify-content-center"
              style={{ width: '100%', height: '300px' }}
            >
              <i className="bi bi-person-circle display-1 text-white"></i>
            </div>
          )}
        </div>
        <div className="col-md-9">
          <h1 className="mb-3">{artist.name}</h1>
          {artist.bio && <p className="lead mb-4">{artist.bio}</p>}
          <div className="d-flex gap-4 mb-3">
            <div>
              <strong>{stats.songCount}</strong>
              <br />
              <small className="text-muted">Songs</small>
            </div>
            {stats.avgRating > 0 && (
              <div>
                <strong>{stats.avgRating.toFixed(1)}</strong>
                <br />
                <small className="text-muted">Average Rating</small>
              </div>
            )}
          </div>
          {artist.website && (
            <a
              href={artist.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-six tran3s"
            >
              <i className="bi bi-link-45deg me-1"></i>
              Visit Website
            </a>
          )}
        </div>
      </div>

      {/* Songs Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Songs by {artist.name}</h2>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '300px' }}
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading songs...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No songs found.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} viewMode="grid" />
            ))}
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-4">
        <Link href="/artists" className="btn-six tran3s">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Artists
        </Link>
      </div>
    </div>
  )
}

export default ArtistDetailClient

