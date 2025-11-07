'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Song, SongFilters } from '@/types/song'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNotification } from '@/contexts/NotificationContext'
import { safeAsync, getErrorMessage, ApiError } from '@/utils/error-handler'
import { isSongArray } from '@/utils/type-guards'
import EnhancedSearch from './enhanced-search'
import SongCard from './song-card'
import ViewToggle from '@/components/common/view-toggle'
import ErrorState from '@/components/common/error-state'
import SkeletonLoader from '@/components/common/skeleton-loader'

type ViewMode = 'grid' | 'list'

const SongsClient: React.FC = () => {
  const { t } = useLanguage()
  const { error: notifyError } = useNotification()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<SongFilters>({
    search: searchParams.get('q') || undefined,
    genre: searchParams.get('genre') || undefined,
    key_signature: searchParams.get('key') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    limit: 20,
    offset: 0,
  })
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchSongs = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      setError(null)
    }

    const { data, error: fetchError } = await safeAsync(
      async () => {
        const params = new URLSearchParams()
        if (filters.search) params.append('q', filters.search)
        if (filters.genre) params.append('genre', filters.genre)
        if (filters.key_signature) params.append('key', filters.key_signature)
        if (filters.difficulty) params.append('difficulty', filters.difficulty)
        params.append('limit', String(filters.limit || 20))
        params.append('offset', String(reset ? 0 : filters.offset || 0))

        const response = await fetch(`/api/songs?${params.toString()}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`
          throw new ApiError(errorMessage, response.status)
        }

        const result = await response.json()
        
        if (!result || typeof result !== 'object') {
          throw new ApiError('Invalid response format', 500, 'INVALID_RESPONSE')
        }

        // Handle case where API returns error in response
        if (result.error) {
          throw new ApiError(result.error, result.statusCode || 500, result.code)
        }

        // Ensure songs array exists and is valid
        if (!result.songs) {
          throw new ApiError('No songs data in response', 500, 'MISSING_DATA')
        }

        if (!isSongArray(result.songs)) {
          throw new ApiError('Invalid response format: songs array expected', 500, 'INVALID_FORMAT')
        }

        return result
      },
      undefined,
      'fetchSongs'
    )

    if (fetchError) {
      const message = getErrorMessage(fetchError)
      setError(message)
      notifyError(message)
      setLoading(false)
      return
    }

    if (data) {
      if (reset) {
        setSongs(data.songs)
      } else {
        setSongs((prev) => [...prev, ...data.songs])
      }
      setTotal(data.total || 0)
      setHasMore(data.songs.length === (filters.limit || 20))
      setLoading(false)
    }
  }, [filters, notifyError])

  useEffect(() => {
    fetchSongs(true)
  }, [filters.search, filters.genre, filters.key_signature, filters.difficulty])

  const handleLoadMore = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 20),
    }))
    fetchSongs(false)
  }, [fetchSongs])

  const handleFilterChange = useCallback((newFilters: Partial<SongFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      offset: 0,
    }))
    setHasMore(true)
  }, [])

  // Search is handled by EnhancedSearch component directly

  if (loading && songs.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <SkeletonLoader type="list" lines={3} />
        </div>
        <div className="row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-md-6 col-lg-4 mb-4">
              <SkeletonLoader type="card" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && songs.length === 0) {
    return (
      <ErrorState
        title="Failed to load songs"
        message={error}
        onRetry={() => fetchSongs(true)}
      />
    )
  }

  return (
    <div className="songs-client">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1" style={{ maxWidth: '500px' }}>
          <EnhancedSearch
            placeholder={t('songs.search')}
            onResultClick={(song) => router.push(`/songs/${song.slug}`)}
          />
        </div>
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <label className="form-label">{t('songs.filter')}</label>
          <select
            className="form-select"
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange({ genre: e.target.value || undefined })}
            aria-label="Filter by genre"
          >
            <option value="">All Genres</option>
            <option value="Gospel">Gospel</option>
            <option value="Contemporary">Contemporary</option>
            <option value="Traditional">Traditional</option>
            <option value="Worship">Worship</option>
            <option value="Hymn">Hymn</option>
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">{t('song.key')}</label>
          <select
            className="form-select"
            value={filters.key_signature || ''}
            onChange={(e) => handleFilterChange({ key_signature: e.target.value || undefined })}
            aria-label="Filter by key"
          >
            <option value="">All Keys</option>
            <option value="C">C</option>
            <option value="C#">C#</option>
            <option value="D">D</option>
            <option value="D#">D#</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="F#">F#</option>
            <option value="G">G</option>
            <option value="G#">G#</option>
            <option value="A">A</option>
            <option value="A#">A#</option>
            <option value="B">B</option>
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">{t('song.difficulty')}</label>
          <select
            className="form-select"
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange({ difficulty: e.target.value || undefined })}
            aria-label="Filter by difficulty"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
        <div className="col-md-3 mb-3 d-flex align-items-end">
          <button
            className="btn-six w-100 tran3s"
            onClick={() => {
              setFilters({
                limit: 20,
                offset: 0,
              })
              router.push('/songs')
            }}
            aria-label="Clear filters"
          >
            {t('common.clear')}
          </button>
        </div>
      </div>

      {songs.length === 0 && !loading ? (
        <div className="text-center py-5">
          <p className="text-muted">{t('songs.noResults')}</p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'row' : 'list-group'}>
            {songs.map((song) => (
              <div
                key={song.id}
                className={viewMode === 'grid' ? 'col-md-6 col-lg-4 mb-4' : 'list-group-item mb-3'}
              >
                <SongCard song={song} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <button
                className="btn-one tran3s"
                onClick={handleLoadMore}
                disabled={loading}
                aria-label="Load more songs"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.next')
                )}
              </button>
            </div>
          )}

          <div className="text-center mt-3 text-muted small" role="status" aria-live="polite">
            Showing {songs.length} of {total} songs
          </div>
        </>
      )}
    </div>
  )
}

export default SongsClient

