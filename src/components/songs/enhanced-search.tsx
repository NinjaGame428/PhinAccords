'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { Song } from '@/types/song'
import { useLanguage } from '@/contexts/LanguageContext'

interface EnhancedSearchProps {
  onResultClick?: (song: Song) => void
  placeholder?: string
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onResultClick,
  placeholder,
}) => {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/songs?q=${encodeURIComponent(query)}&limit=10`)
        if (!response.ok) throw new Error('Search failed')

        const data = await response.json()
        setResults(data.songs || [])
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = useCallback(
    (song: Song) => {
      if (onResultClick) {
        onResultClick(song)
      }
      setShowResults(false)
      setQuery('')
    },
    [onResultClick]
  )

  return (
    <div className="position-relative" ref={searchRef}>
      <div className="input-group">
        <span className="input-group-text">
          {loading ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <i className="bi bi-search"></i>
          )}
        </span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder || t('songs.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowResults(false)
              setQuery('')
            } else if (e.key === 'ArrowDown' && showResults && results.length > 0) {
              e.preventDefault()
              const firstResult = document.querySelector('.dropdown-item') as HTMLElement
              firstResult?.focus()
            }
          }}
          aria-label={t('songs.search')}
          aria-expanded={showResults}
          aria-autocomplete="list"
          aria-controls="search-results"
          role="combobox"
          tabIndex={0}
        />
        {query && (
          <button
            className="btn-six tran3s"
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div
          id="search-results"
          className="dropdown-menu show w-100 mt-1"
          style={{ maxHeight: '400px', overflowY: 'auto' }}
          role="listbox"
          aria-label="Search results"
        >
          {results.map((song, index) => (
            <Link
              key={song.id}
              href={`/songs/${song.slug}`}
              className="dropdown-item"
              onClick={() => handleResultClick(song)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  const next = e.currentTarget.nextElementSibling as HTMLElement
                  next?.focus()
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  const prev = e.currentTarget.previousElementSibling as HTMLElement
                  prev?.focus()
                } else if (e.key === 'Escape') {
                  setShowResults(false)
                }
              }}
              role="option"
              aria-label={`${song.title} by ${song.artist || song.artist_data?.name || 'Unknown Artist'}`}
              tabIndex={index === 0 ? 0 : -1}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-bold">{song.title}</div>
                  <small className="text-muted">
                    {song.artist || song.artist_data?.name || 'Unknown Artist'}
                    {song.key_signature && ` • ${song.key_signature}`}
                  </small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <div className="dropdown-menu show w-100 mt-1">
          <div className="dropdown-item-text text-muted">
            {t('songs.noResults')}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedSearch

