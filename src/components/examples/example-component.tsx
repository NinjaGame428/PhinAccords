/**
 * Example Component Following Best Practices
 * 
 * This component demonstrates:
 * - Proper file structure
 * - TypeScript best practices
 * - Error handling
 * - Performance optimization
 * - Accessibility
 */

'use client'

// 1. Imports
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { safeAsync, getErrorMessage } from '@/utils/error-handler'
import { isSong, isSongArray } from '@/utils/type-guards'
import { useDebounce } from '@/utils/performance'
import type { Song } from '@/types/song'
import LoadingSpinner from '@/components/common/loading-spinner'
import ErrorState from '@/components/common/error-state'
import SkeletonLoader from '@/components/common/skeleton-loader'

// 2. Types/Interfaces
interface ExampleComponentProps {
  title: string
  onSongSelect?: (song: Song) => void
  initialSongs?: Song[]
  className?: string
}

interface SongListState {
  songs: Song[]
  loading: boolean
  error: string | null
}

// 3. Component
export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  onSongSelect,
  initialSongs = [],
  className = '',
}) => {
  // 4. Hooks
  const { user } = useAuth()
  const { success, error: notifyError } = useNotification()
  const [state, setState] = useState<SongListState>({
    songs: initialSongs,
    loading: false,
    error: null,
  })
  const [searchQuery, setSearchQuery] = useState('')

  // 5. Memoized values
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return state.songs

    const query = searchQuery.toLowerCase()
    return state.songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query)
    )
  }, [state.songs, searchQuery])

  // 6. Debounced search
  const debouncedSearch = useDebounce(
    async (query: string) => {
      if (query.length < 2) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await safeAsync(async () => {
        const response = await fetch(`/api/songs?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (!isSongArray(result.songs)) {
          throw new Error('Invalid response format')
        }

        return result.songs
      })

      if (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }))
        notifyError(error.message)
      } else if (data) {
        setState((prev) => ({
          ...prev,
          songs: data,
          loading: false,
          error: null,
        }))
      }
    },
    300,
    [searchQuery]
  )

  // 7. Effects
  useEffect(() => {
    if (searchQuery.length >= 2) {
      debouncedSearch(searchQuery)
    }
  }, [searchQuery, debouncedSearch])

  // 8. Handlers
  const handleSongClick = useCallback(
    (song: Song) => {
      if (!isSong(song)) {
        notifyError('Invalid song data')
        return
      }

      if (onSongSelect) {
        onSongSelect(song)
      }
      success(`Selected: ${song.title}`)
    },
    [onSongSelect, success, notifyError]
  )

  const handleRetry = useCallback(() => {
    if (searchQuery.length >= 2) {
      debouncedSearch(searchQuery)
    } else {
      setState((prev) => ({ ...prev, error: null }))
    }
  }, [searchQuery, debouncedSearch])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  // 9. Render
  return (
    <div className={`example-component ${className}`}>
      <header className="mb-4">
        <h2 className="h4">{title}</h2>
        {user && (
          <p className="text-muted small">
            Welcome, {user.email}
          </p>
        )}
      </header>

      {/* Search Input */}
      <div className="mb-4">
        <label htmlFor="song-search" className="form-label">
          Search Songs
        </label>
        <input
          id="song-search"
          type="text"
          className="form-control"
          placeholder="Type to search..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search for songs"
          aria-describedby="search-help"
        />
        <small id="search-help" className="form-text text-muted">
          Enter at least 2 characters to search
        </small>
      </div>

      {/* Loading State */}
      {state.loading && (
        <div className="mb-4">
          <SkeletonLoader type="list" lines={5} />
        </div>
      )}

      {/* Error State */}
      {state.error && !state.loading && (
        <ErrorState
          title="Failed to load songs"
          message={state.error}
          onRetry={handleRetry}
        />
      )}

      {/* Song List */}
      {!state.loading && !state.error && (
        <div className="song-list" role="list" aria-label="Song list">
          {filteredSongs.length === 0 ? (
            <p className="text-muted text-center py-4" role="status">
              {searchQuery
                ? 'No songs found matching your search'
                : 'No songs available'}
            </p>
          ) : (
            filteredSongs.map((song) => {
              if (!isSong(song)) return null

              return (
                <div
                  key={song.id}
                  className="card mb-2"
                  role="listitem"
                >
                  <div className="card-body">
                    <h5 className="card-title">{song.title}</h5>
                    <p className="card-text text-muted">
                      {song.artist || 'Unknown Artist'}
                    </p>
                    <button
                      className="btn btn-primary btn-sm touch-target"
                      onClick={() => handleSongClick(song)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSongClick(song)
                        }
                      }}
                      aria-label={`Select song: ${song.title}`}
                      tabIndex={0}
                    >
                      Select
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Results Count */}
      {!state.loading && !state.error && filteredSongs.length > 0 && (
        <div className="mt-3 text-muted small" role="status" aria-live="polite">
          Showing {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default ExampleComponent

