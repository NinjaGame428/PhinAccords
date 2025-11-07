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
  showKeyboard?: boolean
  showAudio?: boolean
}

const PianoChordDiagram: React.FC<PianoChordDiagramProps> = ({
  chordName,
  chordType,
  rootNote,
  notes: providedNotes,
  inversion = 0,
  showKeyboard = true,
  showAudio = true,
}) => {
  const { language } = useLanguage()
  const [chordNotes, setChordNotes] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      let notes: string[]

      if (providedNotes && providedNotes.length > 0) {
        notes = providedNotes
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

      // Apply inversion if needed
      if (inversion > 0) {
        const inverted = [...notes]
        for (let i = 0; i < inversion; i++) {
          const note = inverted.shift()
          if (note) inverted.push(note)
        }
        setChordNotes(inverted)
      } else {
        setChordNotes(notes)
      }

      setError(null)
    } catch (err: any) {
      setError(err.message || 'Invalid chord')
    }
  }, [chordName, chordType, rootNote, providedNotes, inversion])

  const handlePlay = async () => {
    if (chordNotes.length === 0) return

    setIsPlaying(true)
    try {
      // Convert note names to Tone.js format (e.g., "C" -> "C4")
      const toneNotes = chordNotes.map((note) => `${note}4`)
      await toneSampler.playChord(toneNotes, 1)
    } catch (error) {
      console.error('Error playing chord:', error)
    } finally {
      setTimeout(() => setIsPlaying(false), 1000)
    }
  }

  const handleStop = () => {
    toneSampler.stopAll()
    setIsPlaying(false)
  }

  const isKeyPressed = (note: string): boolean => {
    return chordNotes.includes(note)
  }

  const getKeyClass = (note: string): string => {
    const isBlack = note.includes('#')
    const isPressed = isKeyPressed(note)
    const baseClass = isBlack ? 'piano-key black' : 'piano-key white'
    return isPressed ? `${baseClass} pressed` : baseClass
  }

  // Piano keys layout (C4 to C5)
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', '']

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="piano-chord-diagram">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">{chordName || `${rootNote}${chordType}`}</h4>
          <p className="text-muted small mb-0">
            {chordNotes.map((note) => getNoteName(note, language)).join(' - ')}
          </p>
        </div>
        {showAudio && (
          <div>
            {!isPlaying ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={handlePlay}
                disabled={chordNotes.length === 0}
              >
                <i className="bi bi-play-fill me-1"></i>
                Play
              </button>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={handleStop}>
                <i className="bi bi-stop-fill me-1"></i>
                Stop
              </button>
            )}
          </div>
        )}
      </div>

      {showKeyboard && (
        <div className="piano-keyboard position-relative" style={{ height: '150px' }}>
          {/* White keys */}
          <div className="d-flex position-absolute" style={{ bottom: 0, left: 0, right: 0 }}>
            {whiteKeys.map((note, index) => (
              <div
                key={`white-${note}`}
                className={getKeyClass(note)}
                style={{
                  flex: 1,
                  height: '120px',
                  backgroundColor: isKeyPressed(note) ? '#4a90e2' : '#fff',
                  border: '1px solid #ccc',
                  borderRight: index === whiteKeys.length - 1 ? '1px solid #ccc' : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                }}
                title={getNoteName(note, language)}
              >
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2">
                  <small className="text-dark">{getNoteName(note, language)}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Black keys */}
          <div className="d-flex position-absolute" style={{ bottom: '80px', left: 0, right: 0 }}>
            {blackKeys.map((note, index) => {
              if (!note) return <div key={`spacer-${index}`} style={{ flex: 1 }} />

              return (
                <div
                  key={`black-${note}`}
                  className={getKeyClass(note)}
                  style={{
                    flex: 1,
                    height: '80px',
                    backgroundColor: isKeyPressed(note) ? '#2c5aa0' : '#333',
                    border: '1px solid #000',
                    marginLeft: index === 0 ? '3%' : '-3%',
                    marginRight: index === blackKeys.length - 1 ? '3%' : '-3%',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 2,
                  }}
                  title={getNoteName(note, language)}
                >
                  <div className="position-absolute bottom-0 start-50 translate-middle-x mb-1">
                    <small className="text-white">{getNoteName(note, language)}</small>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Chord info */}
      <div className="mt-3">
        <div className="d-flex gap-2 flex-wrap">
          {chordNotes.map((note, index) => (
            <span key={index} className="badge bg-primary">
              {getNoteName(note, language)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PianoChordDiagram

