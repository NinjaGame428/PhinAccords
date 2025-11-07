/**
 * PhinAccords Premium Features Toolbar
 * Heavenkeys Ltd
 * 
 * Complete toolbar with all Premium features for PhinAccords
 * Uses Bootstrap 5 components
 */

'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { hasFeature } from '@/lib/subscription'
import {
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
  Gauge,
  Repeat,
  Download,
  FileText,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
} from 'lucide-react'

interface PremiumToolbarProps {
  currentKey: string
  onTranspose: (semitones: number) => void
  onCapoChange: (fret: number) => void
  onTempoChange: (bpm: number) => void
  onLoopToggle: () => void
  onLoopSet?: (start: number, end: number) => void
  onVolumeChange: (type: 'song' | 'chords', volume: number) => void
  onExportMIDI: () => void
  onExportPDF: () => void
  onCountOff?: () => void
  songVolume?: number
  chordsVolume?: number
  tempo?: number
  isLooping?: boolean
  loopStart?: number
  loopEnd?: number
  capo?: number
  isPlaying?: boolean
  onPlayPause?: () => void
  onSeek?: (seconds: number) => void
  currentTime?: number
  duration?: number
}

export const PremiumToolbar: React.FC<PremiumToolbarProps> = ({
  currentKey,
  onTranspose,
  onCapoChange,
  onTempoChange,
  onLoopToggle,
  onLoopSet,
  onVolumeChange,
  onExportMIDI,
  onExportPDF,
  onCountOff,
  songVolume = 100,
  chordsVolume = 100,
  tempo = 120,
  isLooping = false,
  loopStart,
  loopEnd,
  capo = 0,
  isPlaying = false,
  onPlayPause,
  onSeek,
  currentTime = 0,
  duration = 0,
}) => {
  const { t } = useLanguage()
  const { user, subscription } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  const tier = subscription?.tier || 'free'
  const canTranspose = hasFeature(tier, 'transpose')
  const canCapo = hasFeature(tier, 'capo')
  const canTempo = hasFeature(tier, 'tempo')
  const canLoop = hasFeature(tier, 'loop')
  const canMidi = hasFeature(tier, 'midiExport')
  const canPDF = hasFeature(tier, 'pdfExport')
  const canCountOff = hasFeature(tier, 'countOff')
  const canVolume = hasFeature(tier, 'volumeControl')

  const handleTranspose = (direction: 'up' | 'down') => {
    if (!canTranspose) return
    onTranspose(direction === 'up' ? 1 : -1)
  }

  const handleCapoChange = (fret: number) => {
    if (!canCapo) return
    onCapoChange(fret)
  }

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canTempo) return
    onTempoChange(parseInt(e.target.value))
  }

  if (!user) {
    return null
  }

  return (
    <div className="premium-toolbar bg-light border rounded p-3 mb-4">
      <div className="d-flex flex-wrap align-items-center gap-3">
        {/* Playback Controls */}
        <div className="d-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle"
            onClick={() => onSeek?.(Math.max(0, currentTime - 5))}
            style={{ width: '36px', height: '36px' }}
            title="Rewind 5s"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            className="btn btn-sm btn-one rounded-circle"
            onClick={onPlayPause}
            style={{ width: '40px', height: '40px' }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          <button
            className="btn btn-sm btn-outline-secondary rounded-circle"
            onClick={() => onSeek?.(Math.min(duration, currentTime + 5))}
            style={{ width: '36px', height: '36px' }}
            title="Forward 5s"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Transpose */}
        {canTranspose && (
          <div className="d-flex align-items-center gap-2 border-end pe-3">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleTranspose('down')}
              title="Transpose down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>

            <span className="fw-bold" style={{ minWidth: '3rem', textAlign: 'center' }}>
              {currentKey}
            </span>

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleTranspose('up')}
              title="Transpose up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Capo */}
        {canCapo && (
          <div className="d-flex align-items-center gap-2 border-end pe-3">
            <span className="text-muted small">Capo</span>
            <select
              className="form-select form-select-sm"
              style={{ width: '80px' }}
              value={capo}
              onChange={(e) => handleCapoChange(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tempo/BPM */}
        {canTempo && (
          <div className="d-flex align-items-center gap-2 border-end pe-3" style={{ minWidth: '200px' }}>
            <Gauge className="h-4 w-4 text-muted" />
            <input
              type="range"
              className="form-range flex-grow-1"
              min="50"
              max="200"
              value={tempo}
              onChange={handleTempoChange}
            />
            <span className="fw-bold" style={{ minWidth: '4rem', textAlign: 'right' }}>
              {tempo} BPM
            </span>
          </div>
        )}

        {/* Loop */}
        {canLoop && (
          <button
            className={`btn btn-sm ${isLooping ? 'btn-one' : 'btn-outline-secondary'}`}
            onClick={onLoopToggle}
            title="Loop section"
          >
            <Repeat className="h-4 w-4" />
          </button>
        )}

        {/* Volume Controls */}
        {canVolume && (
          <div className="d-flex align-items-center gap-2 border-end pe-3">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onVolumeChange('song', songVolume > 0 ? 0 : 100)}
              title="Song Volume"
            >
              {songVolume > 0 ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>

            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
              value={songVolume}
              onChange={(e) => onVolumeChange('song', parseInt(e.target.value))}
              style={{ width: '80px' }}
            />

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onVolumeChange('chords', chordsVolume > 0 ? 0 : 100)}
              title="Chords Volume"
            >
              <Music className="h-4 w-4" />
            </button>

            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
              value={chordsVolume}
              onChange={(e) => onVolumeChange('chords', parseInt(e.target.value))}
              style={{ width: '80px' }}
            />
          </div>
        )}

        {/* Count-off */}
        {canCountOff && onCountOff && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onCountOff}
            title="Count-off for perfect timing"
          >
            <span className="small">1, 2, 3, 4</span>
          </button>
        )}

        {/* Export Options */}
        <div className="d-flex align-items-center gap-1 border-end pe-3">
          {canMidi && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onExportMIDI}
              title="Export MIDI"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          {canPDF && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onExportPDF}
              title="Export PDF"
            >
              <FileText className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Settings */}
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Loop Range Selector */}
      {isLooping && canLoop && onLoopSet && (
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex align-items-center gap-3">
            <span className="small text-muted">Loop Range:</span>
            <input
              type="number"
              className="form-control form-control-sm"
              style={{ width: '100px' }}
              placeholder="Start (s)"
              value={loopStart || 0}
              onChange={(e) => onLoopSet(parseFloat(e.target.value) || 0, loopEnd || duration)}
            />
            <span className="text-muted">to</span>
            <input
              type="number"
              className="form-control form-control-sm"
              style={{ width: '100px' }}
              placeholder="End (s)"
              value={loopEnd || duration}
              onChange={(e) => onLoopSet(loopStart || 0, parseFloat(e.target.value) || duration)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PremiumToolbar
