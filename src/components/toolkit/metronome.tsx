/**
 * PhinAccords Metronome Component
 * Heavenkeys Ltd
 * 
 * Metronome with drumbeat sounds
 * Supports all time signatures
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { hasFeature } from '@/lib/subscription'
import { Play, Pause, Volume2 } from 'lucide-react'

interface MetronomeProps {
  initialBPM?: number
  initialTimeSignature?: string
}

const Metronome: React.FC<MetronomeProps> = ({ 
  initialBPM = 120,
  initialTimeSignature = '4/4'
}) => {
  const { t } = useLanguage()
  const { user, subscription } = useAuth()
  const [bpm, setBpm] = useState(initialBPM)
  const [timeSignature, setTimeSignature] = useState(initialTimeSignature)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [volume, setVolume] = useState(100)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)

  const tier = subscription?.tier || 'free'
  const canUseMetronome = hasFeature(tier, 'metronome')

  const [numerator, denominator] = timeSignature.split('/').map(Number)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playTick = (isDownbeat: boolean) => {
    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)()
      if (!audioContextRef.current) {
        audioContextRef.current = audioContext
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for downbeat vs regular beat
      oscillator.frequency.value = isDownbeat ? 800 : 600
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime((volume / 100) * 0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)

      oscillatorRef.current = oscillator
    } catch (error) {
      console.error('Error playing metronome tick:', error)
    }
  }

  const startMetronome = () => {
    if (!canUseMetronome) {
      alert('Metronome requires Premium + Toolkit subscription')
      return
    }

    const interval = 60000 / bpm // milliseconds per beat
    let beatCount = 0

    setIsPlaying(true)
    setCurrentBeat(1)

    // Play first tick immediately
    playTick(true)

    intervalRef.current = setInterval(() => {
      beatCount++
      const beatInMeasure = (beatCount % numerator) + 1
      const isDownbeat = beatInMeasure === 1

      setCurrentBeat(beatInMeasure)
      playTick(isDownbeat)
    }, interval)
  }

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
    setCurrentBeat(0)
  }

  const handleTapTempo = () => {
    // Simple tap tempo - in production, track multiple taps
    // For now, just toggle play/pause
    if (isPlaying) {
      stopMetronome()
    } else {
      startMetronome()
    }
  }

  if (!user) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="text-muted">Please log in to use the metronome</p>
        </div>
      </div>
    )
  }

  if (!canUseMetronome) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h5>Metronome - Premium + Toolkit Required</h5>
          <p className="text-muted">Upgrade to Premium + Toolkit to access the metronome</p>
          <a href="/pricing" className="btn-one">
            Upgrade Now
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Metronome</h5>
      </div>
      <div className="card-body">
        {/* BPM Control */}
        <div className="mb-4">
          <label className="form-label">BPM: {bpm}</label>
          <input
            type="range"
            className="form-range"
            min="30"
            max="300"
            value={bpm}
            onChange={(e) => {
              setBpm(parseInt(e.target.value))
              if (isPlaying) {
                stopMetronome()
                startMetronome()
              }
            }}
          />
          <div className="d-flex justify-content-between small text-muted">
            <span>30</span>
            <span>300</span>
          </div>
        </div>

        {/* Time Signature */}
        <div className="mb-4">
          <label className="form-label">Time Signature</label>
          <select
            className="form-select"
            value={timeSignature}
            onChange={(e) => {
              setTimeSignature(e.target.value)
              if (isPlaying) {
                stopMetronome()
                startMetronome()
              }
            }}
          >
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4">4/4</option>
            <option value="5/4">5/4</option>
            <option value="6/8">6/8</option>
            <option value="7/8">7/8</option>
          </select>
        </div>

        {/* Volume Control */}
        <div className="mb-4">
          <label className="form-label d-flex align-items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Volume: {volume}%
          </label>
          <input
            type="range"
            className="form-range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
          />
        </div>

        {/* Play/Pause Button */}
        <div className="text-center mb-4">
          <button
            className={`btn ${isPlaying ? 'btn-danger' : 'btn-one'} btn-lg rounded-circle`}
            onClick={isPlaying ? stopMetronome : startMetronome}
            style={{ width: '80px', height: '80px' }}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Beat Indicator */}
        {isPlaying && (
          <div className="beat-indicator text-center">
            <div className="d-flex justify-content-center gap-2">
              {Array.from({ length: numerator }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-circle ${currentBeat === i + 1 ? 'bg-color-one' : 'bg-secondary'}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    transition: 'all 0.1s',
                  }}
                >
                  <span className="d-flex align-items-center justify-content-center h-100 text-white fw-bold">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-muted">
              Beat {currentBeat} of {numerator}
            </p>
          </div>
        )}

        {/* Tap Tempo */}
        <div className="text-center mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={handleTapTempo}
          >
            Tap Tempo
          </button>
        </div>
      </div>
    </div>
  )
}

export default Metronome

