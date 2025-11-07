'use client'

import React, { useEffect, useState, useCallback } from 'react'
import type { Song, SongListResponse } from '@/types/song'
import SongCard from './song-card'
import { useLanguage } from '@/contexts/LanguageContext'

interface SongListProps {
  initialSongs?: Song[]
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
  viewMode?: 'grid' | 'list'
  showFilters?: boolean
}

const SongList: React.FC<SongListProps> = ({
  initialSongs = [],
  limit = 12,
  autoRefresh = false,
  refreshInterval = 30000,
  viewMode = 'grid',
  showFilters = false,
}) => {
  const { t } = useLanguage()
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [loading, setLoading] = useState(!initialSongs.length)
  const [error, setError] = useState<string | null>(null)

  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/songs?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch songs')
      }

      const data: SongListResponse = await response.json()
      setSongs(data.songs)
    } catch (err: any) {
      setError(err.message || t('common.error'))
      console.error('Error fetching songs:', err)
    } finally {
      setLoading(false)
    }
  }, [limit, t])

  useEffect(() => {
    if (!initialSongs.length) {
      fetchSongs()
    }
  }, [initialSongs.length, fetchSongs])

  useEffect(() => {
    if (!autoRefresh) return

    // Only refresh when page is visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSongs()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Auto-refresh interval
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchSongs()
      }
    }, refreshInterval)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchSongs])

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{t('songs.loading')}</span>
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

  if (!songs.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted">{t('songs.noResults')}</p>
      </div>
    )
  }

  const containerClass = viewMode === 'grid' ? 'row g-4' : 'list-group'

  return (
    <div className={containerClass}>
      {songs.map((song) => (
        <SongCard key={song.id} song={song} viewMode={viewMode} />
      ))}
    </div>
  )
}

export default SongList

