'use client'

import React, { useState, useEffect } from 'react'
import PianoChordDiagram from './piano-chord-diagram'
import type { PianoChord } from '@/types/piano-chord'

interface PianoChordsClientProps {}

const PianoChordsClient: React.FC<PianoChordsClientProps> = () => {
  const [chords, setChords] = useState<PianoChord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    keySignature: '',
    difficulty: '',
    chordType: '',
    search: '',
  })

  useEffect(() => {
    fetchChords()
  }, [filters])

  const fetchChords = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.keySignature) params.append('key_signature', filters.keySignature)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.chordType) params.append('chord_type', filters.chordType)
      if (filters.search) params.append('q', filters.search)

      const response = await fetch(`/api/piano-chords?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch chords')

      const data = await response.json()
      setChords(data.chords || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const keySignatures = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const difficulties = ['Easy', 'Medium', 'Hard']
  const chordTypes = ['Major', 'Minor', '7th', 'Suspended', 'Diminished', 'Augmented']

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading chords...</span>
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
    <div className="piano-chords-page">
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Key Signature</label>
              <select
                className="form-select"
                value={filters.keySignature}
                onChange={(e) => setFilters({ ...filters, keySignature: e.target.value })}
              >
                <option value="">All Keys</option>
                {keySignatures.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="">All Difficulties</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Chord Type</label>
              <select
                className="form-select"
                value={filters.chordType}
                onChange={(e) => setFilters({ ...filters, chordType: e.target.value })}
              >
                <option value="">All Types</option>
                {chordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search chords..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chords Grid */}
      {chords.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No chords found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="row g-4">
          {chords.map((chord) => (
            <div key={chord.id} className="col-lg-4 col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <PianoChordDiagram
                    chordName={chord.chord_name}
                    chordType={chord.chord_type}
                    rootNote={chord.root_note}
                    notes={chord.notes}
                    inversion={chord.inversion || 0}
                    showKeyboard={true}
                    showAudio={true}
                  />
                  {chord.description && (
                    <p className="small text-muted mt-2 mb-0">{chord.description}</p>
                  )}
                  {chord.difficulty && (
                    <span className={`badge mt-2 ${getDifficultyBadgeClass(chord.difficulty)}`}>
                      {chord.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Reference */}
      <div className="card mt-5">
        <div className="card-body">
          <h3 className="card-title">Common Chord Progressions</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <h5>I - V - vi - IV (Pop Progression)</h5>
              <p className="text-muted small">
                Example in C: C - G - Am - F
                <br />
                One of the most common progressions in popular music
              </p>
            </div>
            <div className="col-md-6">
              <h5>ii - V - I (Jazz Progression)</h5>
              <p className="text-muted small">
                Example in C: Dm - G - C
                <br />
                Classic jazz progression
              </p>
            </div>
            <div className="col-md-6">
              <h5>I - vi - IV - V (50s Progression)</h5>
              <p className="text-muted small">
                Example in C: C - Am - F - G
                <br />
                Popular in 1950s music
              </p>
            </div>
            <div className="col-md-6">
              <h5>vi - IV - I - V (Pop Ballad)</h5>
              <p className="text-muted small">
                Example in C: Am - F - C - G
                <br />
                Common in ballads and emotional songs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getDifficultyBadgeClass = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-success'
    case 'Medium':
      return 'bg-warning'
    case 'Hard':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

export default PianoChordsClient

