/**
 * PhinAccords Live Chord Detection Component
 * Heavenkeys Ltd
 * 
 * Real-time chord detection from microphone input
 * Premium + Toolkit feature
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { hasFeature } from '@/lib/subscription'
import { Mic, MicOff } from 'lucide-react'

const LiveChordDetection: React.FC = () => {
  const { t } = useLanguage()
  const { user, subscription } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [detectedChord, setDetectedChord] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)

  const tier = subscription?.tier || 'free'
  const canUseLiveDetection = hasFeature(tier, 'liveDetection')

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  const startListening = async () => {
    if (!canUseLiveDetection) {
      alert('Live Chord Detection requires Premium + Toolkit subscription')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 4096
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      microphoneRef.current = microphone

      setIsListening(true)
      analyzeAudio()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopListening = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setIsListening(false)
    setDetectedChord(null)
    setConfidence(0)
  }

  const analyzeAudio = async () => {
    if (!analyserRef.current || !isListening) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Get time domain data for better analysis
    const timeData = new Uint8Array(bufferLength)
    analyserRef.current.getByteTimeDomainData(timeData)

    // Extract chroma features with improved algorithm
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const chroma = extractChromaFeatures(dataArray, timeData, sampleRate, bufferLength)

    // Detect chord from chroma with enhanced detection
    const { chord, conf } = detectChordFromChroma(chroma)
    
    // Only update if confidence is above threshold
    if (conf > 30) {
      setDetectedChord(chord)
      setConfidence(conf)
    } else {
      setDetectedChord(null)
      setConfidence(0)
    }

    if (isListening) {
      requestAnimationFrame(analyzeAudio)
    }
  }

  const extractChromaFeatures = (
    frequencyData: Uint8Array,
    timeData: Uint8Array,
    sampleRate: number,
    bufferLength: number
  ): number[] => {
    // Enhanced chroma extraction with harmonic analysis
    const chroma = new Array(12).fill(0)
    const energy = new Array(12).fill(0)
    
    // Analyze frequency spectrum
    for (let i = 0; i < bufferLength; i++) {
      const frequency = (i * sampleRate) / (bufferLength * 2)
      const magnitude = frequencyData[i]
      
      // Only process audible frequencies (20Hz - 20kHz)
      if (frequency >= 20 && frequency <= 20000 && magnitude > 30) {
        // Convert frequency to MIDI note number
        const midiNote = 12 * Math.log2(frequency / 440) + 69
        
        // Map to chroma bin (C=0, C#=1, D=2, ..., B=11)
        const chromaBin = Math.round(midiNote) % 12
        const octave = Math.floor(midiNote / 12) - 1
        
        // Weight by magnitude and octave (lower octaves have more weight for bass)
        const weight = magnitude * (1 + (octave < 4 ? 0.5 : 0))
        chroma[chromaBin] += weight
        energy[chromaBin] += magnitude
      }
    }

    // Apply smoothing and normalization
    const smoothed = chroma.map((val, idx) => {
      const prev = chroma[(idx - 1 + 12) % 12]
      const next = chroma[(idx + 1) % 12]
      return (prev * 0.2 + val * 0.6 + next * 0.2)
    })

    // Normalize to 0-1 range
    const max = Math.max(...smoothed, 1)
    return smoothed.map(c => c / max)
  }

  const detectChordFromChroma = (chroma: number[]): { chord: string; conf: number } => {
    // Enhanced chord detection with major, minor, and extended chords
    const chordTemplates: { [key: string]: { pattern: number[]; weight: number } } = {
      // Major chords
      'C': { pattern: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], weight: 1.0 },
      'C#': { pattern: [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0], weight: 1.0 },
      'D': { pattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0], weight: 1.0 },
      'D#': { pattern: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0], weight: 1.0 },
      'E': { pattern: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1], weight: 1.0 },
      'F': { pattern: [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0], weight: 1.0 },
      'F#': { pattern: [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0], weight: 1.0 },
      'G': { pattern: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1], weight: 1.0 },
      'G#': { pattern: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0], weight: 1.0 },
      'A': { pattern: [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0], weight: 1.0 },
      'A#': { pattern: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0], weight: 1.0 },
      'B': { pattern: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1], weight: 1.0 },
      // Minor chords
      'Cm': { pattern: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0], weight: 0.9 },
      'C#m': { pattern: [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], weight: 0.9 },
      'Dm': { pattern: [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0], weight: 0.9 },
      'D#m': { pattern: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0], weight: 0.9 },
      'Em': { pattern: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1], weight: 0.9 },
      'Fm': { pattern: [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0], weight: 0.9 },
      'F#m': { pattern: [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0], weight: 0.9 },
      'Gm': { pattern: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0], weight: 0.9 },
      'G#m': { pattern: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1], weight: 0.9 },
      'Am': { pattern: [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0], weight: 0.9 },
      'A#m': { pattern: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0], weight: 0.9 },
      'Bm': { pattern: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1], weight: 0.9 },
    }

    let bestMatch = 'N/A'
    let bestScore = 0
    const scores: { chord: string; score: number }[] = []

    // Calculate similarity scores for all chord templates
    for (const [chord, template] of Object.entries(chordTemplates)) {
      let score = 0
      let matchCount = 0
      
      for (let i = 0; i < 12; i++) {
        if (template.pattern[i] > 0) {
          // Chord note should be present
          score += chroma[i] * template.pattern[i] * template.weight
          matchCount++
        } else {
          // Non-chord notes should be minimal
          score -= chroma[i] * 0.1
        }
      }
      
      // Normalize by number of chord notes
      score = score / matchCount
      
      scores.push({ chord, score })
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = chord
      }
    }

    // Calculate confidence based on score difference
    scores.sort((a, b) => b.score - a.score)
    const topScore = scores[0]?.score || 0
    const secondScore = scores[1]?.score || 0
    const scoreDiff = topScore - secondScore
    
    // Confidence is based on absolute score and difference from second best
    const confidence = Math.min(100, Math.round((topScore * 70) + (scoreDiff * 30)))

    return {
      chord: bestMatch,
      conf: confidence,
    }
  }

  if (!user) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="text-muted">Please log in to use Live Chord Detection</p>
        </div>
      </div>
    )
  }

  if (!canUseLiveDetection) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h5>Live Chord Detection - Premium + Toolkit Required</h5>
          <p className="text-muted">Upgrade to Premium + Toolkit to detect chords in real-time</p>
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
        <h5 className="mb-0">Live Chord Detection</h5>
      </div>
      <div className="card-body">
        <div className="text-center mb-4">
          <button
            className={`btn ${isListening ? 'btn-danger' : 'btn-one'} btn-lg rounded-circle`}
            onClick={isListening ? stopListening : startListening}
            style={{ width: '100px', height: '100px' }}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          <p className="mt-3">
            {isListening ? 'Listening for chords...' : 'Click to start detecting chords'}
          </p>
        </div>

        {/* Detected Chord Display */}
        {isListening && (
          <div className="chord-display text-center">
            {detectedChord && detectedChord !== 'N/A' ? (
              <>
                <div className="display-1 fw-bold mb-3" style={{ color: 'var(--color-two)' }}>
                  {detectedChord}
                </div>
                <div className="progress mb-3" style={{ height: '20px' }}>
                  <div
                    className="progress-bar bg-color-one"
                    role="progressbar"
                    style={{ width: `${confidence}%` }}
                  >
                    {confidence}%
                  </div>
                </div>
                <p className="text-muted">Confidence: {confidence}%</p>
              </>
            ) : (
              <div className="text-muted">
                <p>No chord detected</p>
                <p className="small">Play a chord into your microphone</p>
              </div>
            )}
          </div>
        )}

        {!isListening && (
          <div className="alert alert-info">
            <strong>How to use:</strong>
            <ul className="mb-0 mt-2">
              <li>Click the microphone button to start</li>
              <li>Point your device's microphone toward the music source</li>
              <li>Chords will be detected in real-time</li>
              <li>Works with live performances, recordings, or any audio source</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveChordDetection

