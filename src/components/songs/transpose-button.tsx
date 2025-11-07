'use client'

import React, { useState } from 'react'
import { translateChordProgression } from '@/lib/chord-translations'
import { useLanguage } from '@/contexts/LanguageContext'

interface TransposeButtonProps {
  currentKey: string
  chordProgression?: string
  onTranspose?: (newKey: string, transposedChords: string) => void
  className?: string
}

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const semitones = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

const TransposeButton: React.FC<TransposeButtonProps> = ({
  currentKey,
  chordProgression = '',
  onTranspose,
  className = '',
}) => {
  const { language } = useLanguage()
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedKey, setSelectedKey] = useState(currentKey)

  const transposeChords = (fromKey: string, toKey: string, progression: string): string => {
    if (!progression) return progression

    const fromIndex = keys.indexOf(fromKey)
    const toIndex = keys.indexOf(toKey)
    
    if (fromIndex === -1 || toIndex === -1) return progression

    const semitoneDiff = (toIndex - fromIndex + 12) % 12

    // Simple chord transposition (C, D, E, F, G, A, B)
    const chordMap: Record<string, string> = {
      'C': keys[(0 + semitoneDiff) % 12],
      'D': keys[(2 + semitoneDiff) % 12],
      'E': keys[(4 + semitoneDiff) % 12],
      'F': keys[(5 + semitoneDiff) % 12],
      'G': keys[(7 + semitoneDiff) % 12],
      'A': keys[(9 + semitoneDiff) % 12],
      'B': keys[(11 + semitoneDiff) % 12],
    }

    let transposed = progression
    Object.entries(chordMap).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}(?![a-z])`, 'gi')
      transposed = transposed.replace(regex, to)
    })

    // Translate to French if needed
    if (language === 'fr') {
      transposed = translateChordProgression(transposed, 'fr')
    }

    return transposed
  }

  const handleKeySelect = (newKey: string) => {
    setSelectedKey(newKey)
    setShowDropdown(false)

    if (chordProgression) {
      const transposed = transposeChords(currentKey, newKey, chordProgression)
      if (onTranspose) {
        onTranspose(newKey, transposed)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleKeySelect(key)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  return (
    <div className={`position-relative ${className}`}>
      <button
        type="button"
        className="btn-six tran3s"
        onClick={() => setShowDropdown(!showDropdown)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setShowDropdown(false)
        }}
        aria-label={`Transpose from ${currentKey} to another key`}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        tabIndex={0}
      >
        <i className="bi bi-arrow-left-right me-1" aria-hidden="true"></i>
        Transpose: {selectedKey}
      </button>

      {showDropdown && (
        <div
          className="dropdown-menu show"
          role="listbox"
          aria-label="Select key for transposition"
        >
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              className={`dropdown-item ${selectedKey === key ? 'active' : ''}`}
              onClick={() => handleKeySelect(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              role="option"
              aria-selected={selectedKey === key}
              tabIndex={0}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TransposeButton

