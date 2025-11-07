'use client'

import React, { useState, useEffect, useCallback } from 'react'
import PianoChordDiagram from './piano-chord-diagram'
import type { PianoChord } from '@/types/piano-chord'
import { safeAsync, getErrorMessage, ApiError } from '@/utils/error-handler'
import { useNotification } from '@/contexts/NotificationContext'
import { useLanguage } from '@/contexts/LanguageContext'
import ErrorState from '@/components/common/error-state'
import SkeletonLoader from '@/components/common/skeleton-loader'

interface PianoChordsClientProps {}

const PianoChordsClient: React.FC<PianoChordsClientProps> = () => {
  const { error: notifyError } = useNotification()
  const { t } = useLanguage()
  const [chords, setChords] = useState<PianoChord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    keySignature: '',
    difficulty: '',
    chordType: '',
    search: '',
  })
  const [playingChordId, setPlayingChordId] = useState<string | null>(null)

  const fetchChords = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await safeAsync(
      async () => {
        const params = new URLSearchParams()
        if (filters.keySignature) params.append('key_signature', filters.keySignature)
        if (filters.difficulty) params.append('difficulty', filters.difficulty)
        if (filters.chordType) params.append('chord_type', filters.chordType)
        if (filters.search) params.append('q', filters.search)

        const response = await fetch(`/api/piano-chords?${params.toString()}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`
          throw new ApiError(errorMessage, response.status)
        }

        const result = await response.json()
        
        if (!result || typeof result !== 'object') {
          throw new ApiError('Invalid response format', 500, 'INVALID_RESPONSE')
        }

        if (result.error) {
          throw new ApiError(result.error, result.statusCode || 500, result.code)
        }

        if (!result.chords) {
          throw new ApiError('No chords data in response', 500, 'MISSING_DATA')
        }

        return result
      },
      undefined,
      'fetchChords'
    )

    if (fetchError) {
      const message = getErrorMessage(fetchError)
      setError(message)
      notifyError(message)
    } else if (data) {
      setChords(data.chords || [])
    }

    setLoading(false)
  }, [filters, notifyError])

  useEffect(() => {
    fetchChords()
  }, [fetchChords])

  const keySignatures = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const difficulties = ['Easy', 'Medium', 'Hard']
  const chordTypes = ['Major', 'Minor', '7th', 'Suspended', 'Diminished', 'Augmented']

  if (loading && chords.length === 0) {
    return (
      <div>
        <div className="card mb-4">
          <div className="card-body">
            <SkeletonLoader type="list" lines={1} />
          </div>
        </div>
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-lg-4 col-md-6">
              <SkeletonLoader type="card" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && chords.length === 0) {
    return (
      <ErrorState
        title="Failed to load piano chords"
        message={error}
        onRetry={() => fetchChords()}
      />
    )
  }

  // Filter chords based on search and filters
  const filteredChords = chords.filter((chord) => {
    if (filters.search && !chord.chord_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.keySignature && chord.key_signature !== filters.keySignature) {
      return false
    }
    if (filters.difficulty && chord.difficulty !== filters.difficulty) {
      return false
    }
    if (filters.chordType && chord.chord_type !== filters.chordType) {
      return false
    }
    return true
  })

  const handlePlayChord = (chordId: string) => {
    if (playingChordId === chordId) {
      setPlayingChordId(null)
    } else {
      setPlayingChordId(chordId)
    }
  }

  return (
    <div className="piano-chords-page">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-2">{t('pianoChords.library')}</h2>
        <p className="text-muted">
          {filteredChords.length} {filteredChords.length === 1 ? 'chord' : 'chords'} available
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">{t('pianoChords.search')}</label>
              <input
                type="text"
                className="form-control"
                placeholder={t('pianoChords.search')}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                aria-label="Search chords"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Key</label>
              <select
                className="form-select"
                value={filters.keySignature}
                onChange={(e) => setFilters({ ...filters, keySignature: e.target.value })}
                aria-label="Filter by key signature"
              >
                <option value="">All Keys</option>
                {keySignatures.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">{t('song.difficulty')}</label>
              <select
                className="form-select"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                aria-label="Filter by difficulty"
              >
                <option value="">All Levels</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={filters.chordType}
                onChange={(e) => setFilters({ ...filters, chordType: e.target.value })}
                aria-label="Filter by chord type"
              >
                <option value="">All Types</option>
                {chordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chords Grid */}
      {filteredChords.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-music-note-beamed display-1 text-muted mb-3" aria-hidden="true"></i>
            <h5>No Chords Found</h5>
            <p className="text-muted">Try adjusting your filters or search terms</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredChords.map((chord) => (
            <div key={chord.id} className="col-lg-4 col-md-6">
              <PianoChordDiagram
                chordName={chord.chord_name}
                chordType={chord.chord_type}
                rootNote={chord.root_note}
                notes={chord.notes}
                inversion={chord.inversion || 0}
                difficulty={chord.difficulty}
                description={chord.description}
                showKeyboard={true}
                showAudio={true}
                isPlaying={playingChordId === chord.id}
                onPlay={() => handlePlayChord(chord.id)}
                onStop={() => setPlayingChordId(null)}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default PianoChordsClient
