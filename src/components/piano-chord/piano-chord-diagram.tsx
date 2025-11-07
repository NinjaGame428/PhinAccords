'use client'

import React, { useState, useEffect } from 'react'
import { extractNotesFromChord, getNoteName } from '@/utils/chord-utils'
import { toneSampler } from '@/lib/tone-sampler'
import { useLanguage } from '@/contexts/LanguageContext'

interface PianoChordDiagramProps {
  chordName: string
  chordType?: string
  rootNote?: string
  notes?: string[]
  inversion?: number
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  description?: string
  showKeyboard?: boolean
  showAudio?: boolean
  onPlay?: () => void
  onStop?: () => void
  isPlaying?: boolean
}

const PianoChordDiagram: React.FC<PianoChordDiagramProps> = ({
  chordName,
  chordType,
  rootNote,
  notes: providedNotes,
  inversion = 0,
  difficulty,
  description,
  showKeyboard = true,
  showAudio = true,
  onPlay,
  onStop,
  isPlaying = false,
}) => {
  const { language } = useLanguage()
  const [chordNotes, setChordNotes] = useState<string[]>([])
  const [chordNotesWithOctaves, setChordNotesWithOctaves] = useState<string[]>([]) // Notes with octave info for display
  const [isTonePlaying, setIsTonePlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      let notes: string[] = []

      if (providedNotes && providedNotes.length > 0) {
        notes = providedNotes.filter(note => note && note.trim().length > 0)
      } else if (chordName) {
        const parsed = extractNotesFromChord(chordName)
        notes = parsed.notes
      } else if (rootNote && chordType) {
        const parsed = extractNotesFromChord(`${rootNote}${chordType}`)
        notes = parsed.notes
      } else {
        setError('No chord information provided')
        return
      }

      if (notes.length === 0) {
        setError('Could not extract chord notes')
        return
      }

      // Apply inversion: reorder notes but keep all in same octave
      // Root position (0): C E G → C4 E4 G4 (original order)
      // First inversion (1): E G C → E4 G4 C4 (first note moves to end)
      // Second inversion (2): G C E → G4 C4 E4 (first two notes move to end)
      let reorderedNotes: string[] = []
      let notesWithOctaves: string[] = []

      if (inversion === 0) {
        // Root position: keep original order
        reorderedNotes = [...notes]
        notesWithOctaves = notes.map(note => `${note}4`)
      } else if (inversion > 0 && inversion < notes.length) {
        // For inversions: move the first 'inversion' number of notes to the end
        // Example: [C, E, G] with inversion 1 → [E, G, C]
        // Example: [C, E, G] with inversion 2 → [G, C, E]
        const inverted = [...notes]
        
        // Move first 'inversion' notes to the end
        const notesToMove = inverted.splice(0, inversion)
        reorderedNotes = [...inverted, ...notesToMove]

        // All notes stay in octave 4 (same octave)
        notesWithOctaves = reorderedNotes.map((note) => `${note}4`)
      } else {
        // Invalid inversion, use root position
        reorderedNotes = [...notes]
        notesWithOctaves = notes.map(note => `${note}4`)
      }

      setChordNotes(reorderedNotes)
      setChordNotesWithOctaves(notesWithOctaves)

      setError(null)
    } catch (err: any) {
      console.error('Error extracting chord notes:', err)
      setError(err.message || 'Invalid chord')
    }
  }, [chordName, chordType, rootNote, providedNotes, inversion])

  const handlePlay = async () => {
    if (chordNotes.length === 0) {
      setError('No chord notes available')
      return
    }

    if (isTonePlaying) {
      toneSampler.stopAll()
      setIsTonePlaying(false)
      if (onStop) onStop()
      return
    }

    setIsTonePlaying(true)
    setError(null)
    if (onPlay) onPlay()

    try {
      // Convert notes to Tone.js format - all notes in same octave (octave 4)
      // Root position: C E G → C4 E4 G4
      // First inversion: E G C → E4 G4 C4 (same octave, just reordered)
      // Second inversion: G C E → G4 C4 E4 (same octave, just reordered)
      const toneNotes = chordNotes.map((note) => {
        let cleanNote = note.trim()
        const octave = 4 // All notes in same octave
        
        // Handle sharps and flats
        if (cleanNote.includes('#')) {
          return `${cleanNote}${octave}`
        }
        if (cleanNote.includes('b')) {
          return `${cleanNote}${octave}`
        }
        return `${cleanNote}${octave}`
      })

      await toneSampler.playChord(toneNotes, 1.5)

      setTimeout(() => {
        setIsTonePlaying(false)
        if (onStop) onStop()
      }, 2500)
    } catch (error: any) {
      console.error('Error playing chord:', error)
      setError(error?.message || 'Failed to play chord')
      setIsTonePlaying(false)
      if (onStop) onStop()
    }
  }

  useEffect(() => {
    return () => {
      if (isTonePlaying) {
        toneSampler.stopAll()
      }
    }
  }, [isTonePlaying])

  const getDisplayNote = (note: string): string => {
    return getNoteName(note, language)
  }

  // Two octaves of notes for displaying inversions
  const octaveNotes = language === 'fr'
    ? ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']
    : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  // Create two octaves for the keyboard
  const twoOctaves = [...octaveNotes, ...octaveNotes]

  const normalizeNote = (note: string | undefined): string => {
    if (!note) return ''
    const flatToSharp: { [key: string]: string } = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
      'Ré♭': 'Do#', 'Mi♭': 'Ré#', 'Sol♭': 'Fa#', 'La♭': 'Sol#', 'Si♭': 'La#',
    }
    const frenchToEnglish: { [key: string]: string } = {
      'Do': 'C', 'Do#': 'C#', 'Ré': 'D', 'Ré#': 'D#', 'Mi': 'E',
      'Fa': 'F', 'Fa#': 'F#', 'Sol': 'G', 'Sol#': 'G#',
      'La': 'A', 'La#': 'A#', 'Si': 'B',
    }
    if (frenchToEnglish[note]) {
      return frenchToEnglish[note]
    }
    return flatToSharp[note] || note
  }

  // Get the octave number from a note (e.g., "C4" -> 4, "C" -> 4 default)
  const getNoteOctave = (note: string | undefined): number => {
    if (!note) return 4
    const match = note.match(/(\d+)$/)
    return match && match[1] ? parseInt(match[1], 10) : 4
  }

  // Check if a key at a specific position (octave and note) should be highlighted
  // Since all notes are in octave 4, we check both octaves for the same note
  const isKeyPressed = (displayNote: string, octaveIndex: number): boolean => {
    const standardNote = normalizeNote(displayNote)
    // All notes are in octave 4, so we only highlight octave 4 (first octave)
    if (octaveIndex !== 0) return false
    
    return chordNotesWithOctaves.some(noteWithOctave => {
      if (!noteWithOctave) return false
      const normalizedNote = normalizeNote(noteWithOctave)
      const baseNote = normalizedNote.replace(/\d+$/, '')
      const displayBaseNote = standardNote.replace(/\d+$/, '')
      const noteOctave = getNoteOctave(noteWithOctave)
      
      // Match note name and ensure it's in octave 4
      return baseNote === displayBaseNote && noteOctave === 4
    })
  }

  // Get the order/position of a note in the chord (1, 2, 3, etc.)
  // This should match the order in chordNotes array (the reordered notes)
  const getNoteOrder = (displayNote: string, octaveIndex: number): number | null => {
    // All notes are in octave 4, so we only check octave 4 (first octave)
    if (octaveIndex !== 0) return null
    
    // Match against chordNotes (the reordered array without octaves)
    // This ensures the order matches the displayed order
    for (let i = 0; i < chordNotes.length; i++) {
      const chordNote = chordNotes[i]
      if (!chordNote) continue
      
      const normalizedChordNote = normalizeNote(chordNote)
      const normalizedDisplayNote = normalizeNote(displayNote)
      
      // Match note names (without octave)
      if (normalizedChordNote === normalizedDisplayNote) {
        return i + 1 // Return position (1-based): 1st note = 1, 2nd note = 2, 3rd note = 3
      }
    }
    
    return null
  }

  // Black key positions for first octave (C4-B4)
  const blackKeyPositionsOctave1: { [key: string]: number } = {
    'C#': 35, 'Do#': 35,
    'D#': 85, 'Ré#': 85,
    'F#': 185, 'Fa#': 185,
    'G#': 235, 'Sol#': 235,
    'A#': 285, 'La#': 285,
  }

  // Black key positions for second octave (C5-B5) - offset by 350 (one octave width)
  const blackKeyPositionsOctave2: { [key: string]: number } = {
    'C#': 385, 'Do#': 385,
    'D#': 435, 'Ré#': 435,
    'F#': 535, 'Fa#': 535,
    'G#': 585, 'Sol#': 585,
    'A#': 635, 'La#': 635,
  }

  const flatToSharpPosOctave1: { [key: string]: number } = {
    'Ré♭': 35, 'Mi♭': 85, 'Sol♭': 185, 'La♭': 235, 'Si♭': 285,
    'Db': 35, 'Eb': 85, 'Gb': 185, 'Ab': 235, 'Bb': 285,
  }

  const flatToSharpPosOctave2: { [key: string]: number } = {
    'Ré♭': 385, 'Mi♭': 435, 'Sol♭': 535, 'La♭': 585, 'Si♭': 635,
    'Db': 385, 'Eb': 435, 'Gb': 535, 'Ab': 585, 'Bb': 635,
  }

  const getDifficultyBadge = () => {
    if (!difficulty) return null
    const colors = {
      Easy: 'bg-success text-white',
      Medium: 'bg-warning text-dark',
      Hard: 'bg-danger text-white',
    }
    return (
      <span className={`badge ${colors[difficulty] || 'bg-secondary'}`}>
        {difficulty}
      </span>
    )
  }

  const actualPlayingState = isTonePlaying || isPlaying

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1">{chordName || `${rootNote}${chordType}`}</h5>
            {description && <p className="text-muted small mb-0">{description}</p>}
          </div>
          <div className="d-flex align-items-center gap-2">
            {getDifficultyBadge()}
            {showAudio && (
              <button
                className={`btn ${actualPlayingState ? 'btn-danger' : 'btn-one'} rounded-circle d-flex align-items-center justify-content-center tran3s`}
                onClick={handlePlay}
                disabled={chordNotes.length === 0}
                style={{
                  width: '45px',
                  height: '45px',
                }}
                aria-label={actualPlayingState ? 'Stop chord' : 'Play chord'}
              >
                <i className={`bi ${actualPlayingState ? 'bi-stop-fill' : 'bi-play-fill'}`}></i>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="card-body">
        {/* Notes Badge Display */}
        {chordNotes.length > 0 && (
          <div className="mb-3 d-flex gap-2 flex-wrap justify-content-center">
            {chordNotes.map((note, index) => (
              <span key={index} className="badge bg-primary fs-6 px-3 py-2">
                {getDisplayNote(note)}
              </span>
            ))}
          </div>
        )}

        {/* Piano Keyboard SVG - Two Octaves for Inversions */}
        {showKeyboard && (
          <div className="mt-3">
            <svg
              width="100%"
              height="200"
              viewBox="0 0 700 200"
              className="bg-light rounded border border-secondary"
              style={{ maxWidth: '100%' }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* White keys - Two octaves */}
              {twoOctaves.filter(n => !n.includes('#') && !n.includes('♭')).map((note, idx) => {
                const x = idx * 50
                const octaveIndex = idx < 7 ? 0 : 1 // First 7 white keys (C-D-E-F-G-A-B) are octave 4, next 7 are octave 5
                const displayNote = getDisplayNote(note)
                const isHighlighted = isKeyPressed(note, octaveIndex)
                const noteOrder = getNoteOrder(note, octaveIndex)
                const octaveLabel = octaveIndex === 0 ? '4' : '5'
                return (
                  <g key={`${note}-${idx}`}>
                    <rect
                      x={x}
                      y="20"
                      width="48"
                      height="150"
                      fill={isHighlighted ? '#dc2626' : '#ffffff'}
                      stroke={isHighlighted ? '#991b1b' : '#d1d5db'}
                      strokeWidth={isHighlighted ? '3' : '1.5'}
                      rx="3"
                      ry="3"
                      className={isHighlighted ? 'shadow-lg' : ''}
                    />
                    <text
                      x={x + 24}
                      y="165"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                      fill={isHighlighted ? 'white' : '#1f2937'}
                      className="select-none"
                    >
                      {displayNote}
                    </text>
                    <text
                      x={x + 24}
                      y="180"
                      textAnchor="middle"
                      fontSize="10"
                      fill={isHighlighted ? 'white' : '#6b7280'}
                      className="select-none"
                    >
                      {octaveLabel}
                    </text>
                    {isHighlighted && (
                      <>
                        <circle
                          cx={x + 24}
                          cy="85"
                          r="8"
                          fill="#991b1b"
                          opacity="0.9"
                        />
                        {noteOrder !== null && (
                          <text
                            x={x + 24}
                            y="90"
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="bold"
                            fill="white"
                            className="select-none"
                          >
                            {noteOrder}
                          </text>
                        )}
                      </>
                    )}
                  </g>
                )
              })}

              {/* Black keys (sharps) - First octave */}
              {octaveNotes.filter(n => n.includes('#')).map((note) => {
                const x = blackKeyPositionsOctave1[note] || 0
                const displayNote = getDisplayNote(note)
                const isHighlighted = isKeyPressed(note, 0)
                const noteOrder = getNoteOrder(note, 0)
                return (
                  <g key={`${note}-oct1`}>
                    <rect
                      x={x}
                      y="20"
                      width="32"
                      height="100"
                      fill={isHighlighted ? '#991b1b' : '#1f2937'}
                      stroke={isHighlighted ? '#7f1d1d' : '#111827'}
                      strokeWidth={isHighlighted ? '2.5' : '1.5'}
                      rx="2"
                      ry="2"
                      className={isHighlighted ? 'shadow-xl' : 'shadow-md'}
                    />
                    <text
                      x={x + 16}
                      y="105"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      className="select-none"
                    >
                      {displayNote}
                    </text>
                    {isHighlighted && (
                      <>
                        <circle
                          cx={x + 16}
                          cy="60"
                          r="6"
                          fill="#dc2626"
                          opacity="0.95"
                        />
                        {noteOrder !== null && (
                          <text
                            x={x + 16}
                            y="65"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="white"
                            className="select-none"
                          >
                            {noteOrder}
                          </text>
                        )}
                      </>
                    )}
                  </g>
                )
              })}

              {/* Black keys (sharps) - Second octave */}
              {octaveNotes.filter(n => n.includes('#')).map((note) => {
                const x = blackKeyPositionsOctave2[note] || 0
                const displayNote = getDisplayNote(note)
                const isHighlighted = isKeyPressed(note, 1)
                return (
                  <g key={`${note}-oct2`}>
                    <rect
                      x={x}
                      y="20"
                      width="32"
                      height="100"
                      fill={isHighlighted ? '#991b1b' : '#1f2937'}
                      stroke={isHighlighted ? '#7f1d1d' : '#111827'}
                      strokeWidth={isHighlighted ? '2.5' : '1.5'}
                      rx="2"
                      ry="2"
                      className={isHighlighted ? 'shadow-xl' : 'shadow-md'}
                    />
                    <text
                      x={x + 16}
                      y="105"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      className="select-none"
                    >
                      {displayNote}
                    </text>
                    {isHighlighted && (
                      <circle
                        cx={x + 16}
                        cy="60"
                        r="6"
                        fill="#dc2626"
                        opacity="0.95"
                      />
                    )}
                  </g>
                )
              })}

              {/* Black keys (flats) - First octave */}
              {octaveNotes.filter(n => n.includes('♭')).map((note) => {
                const x = flatToSharpPosOctave1[note] || 0
                const displayNote = getDisplayNote(note)
                const isHighlighted = isKeyPressed(note, 0)
                const noteOrder = getNoteOrder(note, 0)
                return (
                  <g key={`${note}-oct1`}>
                    <rect
                      x={x}
                      y="20"
                      width="32"
                      height="100"
                      fill={isHighlighted ? '#991b1b' : '#1f2937'}
                      stroke={isHighlighted ? '#7f1d1d' : '#111827'}
                      strokeWidth={isHighlighted ? '2.5' : '1.5'}
                      rx="2"
                      ry="2"
                      className={isHighlighted ? 'shadow-xl' : 'shadow-md'}
                    />
                    <text
                      x={x + 16}
                      y="105"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      className="select-none"
                    >
                      {displayNote}
                    </text>
                    {isHighlighted && (
                      <>
                        <circle
                          cx={x + 16}
                          cy="60"
                          r="6"
                          fill="#dc2626"
                          opacity="0.95"
                        />
                        {noteOrder !== null && (
                          <text
                            x={x + 16}
                            y="65"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="white"
                            className="select-none"
                          >
                            {noteOrder}
                          </text>
                        )}
                      </>
                    )}
                  </g>
                )
              })}

              {/* Black keys (flats) - Second octave */}
              {octaveNotes.filter(n => n.includes('♭')).map((note) => {
                const x = flatToSharpPosOctave2[note] || 0
                const displayNote = getDisplayNote(note)
                const isHighlighted = isKeyPressed(note, 1)
                return (
                  <g key={`${note}-oct2`}>
                    <rect
                      x={x}
                      y="20"
                      width="32"
                      height="100"
                      fill={isHighlighted ? '#991b1b' : '#1f2937'}
                      stroke={isHighlighted ? '#7f1d1d' : '#111827'}
                      strokeWidth={isHighlighted ? '2.5' : '1.5'}
                      rx="2"
                      ry="2"
                      className={isHighlighted ? 'shadow-xl' : 'shadow-md'}
                    />
                    <text
                      x={x + 16}
                      y="105"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      className="select-none"
                    >
                      {displayNote}
                    </text>
                    {isHighlighted && (
                      <circle
                        cx={x + 16}
                        cy="60"
                        r="6"
                        fill="#dc2626"
                        opacity="0.95"
                      />
                    )}
                  </g>
                )
              })}

              {/* Octave separator line */}
              <line
                x1="350"
                y1="20"
                x2="350"
                y2="170"
                stroke="#d1d5db"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        )}

        {/* Chord Info */}
        {chordType && (
          <div className="mt-3 text-center">
            <span className="badge bg-secondary">{chordType}</span>
            {inversion > 0 && (
              <span className="badge bg-info ms-2">Inversion: {inversion}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PianoChordDiagram
