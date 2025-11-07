/**
 * PhinAccords Tuner Component
 * Heavenkeys Ltd
 * 
 * Polyphonic tuner for guitar, ukulele, mandolin
 * Supports all Toolkit features
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { hasFeature } from '@/lib/subscription'

interface TunerProps {
  instrument?: 'guitar' | 'ukulele' | 'mandolin' | 'piano'
}

const Tuner: React.FC<TunerProps> = ({ instrument = 'guitar' }) => {
  const { t } = useLanguage()
  const { user, subscription } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [detectedNotes, setDetectedNotes] = useState<string[]>([])
  const [frequencies, setFrequencies] = useState<{ [note: string]: number }>({})
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)

  const tier = subscription?.tier || 'free'
  const canUseTuner = hasFeature(tier, 'tuner')

  // Standard tuning frequencies
  const standardTunings: { [key: string]: { [note: string]: number } } = {
    guitar: {
      'E2': 82.41,
      'A2': 110.00,
      'D3': 146.83,
      'G3': 196.00,
      'B3': 246.94,
      'E4': 329.63,
    },
    ukulele: {
      'G4': 392.00,
      'C4': 261.63,
      'E4': 329.63,
      'A4': 440.00,
    },
    mandolin: {
      'G3': 196.00,
      'D4': 293.66,
      'A4': 440.00,
      'E5': 659.25,
    },
    piano: {
      'A4': 440.00, // Concert pitch
    },
  }

  const targetFrequencies = standardTunings[instrument] || standardTunings.guitar

  useEffect(() => {
    return () => {
      // Cleanup
      if (microphoneRef.current) {
        microphoneRef.current.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startListening = async () => {
    if (!canUseTuner) {
      alert('Tuner requires Premium + Toolkit subscription')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 2048
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
    setDetectedNotes([])
    setFrequencies({})
  }

  const analyzeAudio = () => {
    if (!analyserRef.current || !isListening) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Find peak frequencies
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const detected: string[] = []
    const freqData: { [note: string]: number } = {}

    for (let i = 0; i < bufferLength; i++) {
      const magnitude = dataArray[i]
      if (magnitude > 100) { // Threshold
        const frequency = (i * sampleRate) / (bufferLength * 2)
        
        // Find closest note
        for (const [note, targetFreq] of Object.entries(targetFrequencies)) {
          if (Math.abs(frequency - targetFreq) < 5) {
            detected.push(note)
            freqData[note] = frequency
          }
        }
      }
    }

    setDetectedNotes([...new Set(detected)])
    setFrequencies(freqData)

    if (isListening) {
      requestAnimationFrame(analyzeAudio)
    }
  }

  const getCentsOff = (detectedFreq: number, targetFreq: number): number => {
    return 1200 * Math.log2(detectedFreq / targetFreq)
  }

  if (!user) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="text-muted">Please log in to use the tuner</p>
        </div>
      </div>
    )
  }

  if (!canUseTuner) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h5>Tuner - Premium + Toolkit Required</h5>
          <p className="text-muted">Upgrade to Premium + Toolkit to access the advanced tuner</p>
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
        <h5 className="mb-0">Tuner - {instrument.charAt(0).toUpperCase() + instrument.slice(1)}</h5>
      </div>
      <div className="card-body">
        <div className="text-center mb-4">
          <button
            className={`btn ${isListening ? 'btn-danger' : 'btn-one'} btn-lg rounded-circle`}
            onClick={isListening ? stopListening : startListening}
            style={{ width: '80px', height: '80px' }}
          >
            {isListening ? (
              <i className="bi bi-stop-fill fs-3"></i>
            ) : (
              <i className="bi bi-mic-fill fs-3"></i>
            )}
          </button>
          <p className="mt-3">
            {isListening ? 'Listening...' : 'Click to start tuning'}
          </p>
        </div>

        {/* Detected Notes */}
        {isListening && (
          <div className="tuner-display">
            {Object.entries(targetFrequencies).map(([note, targetFreq]) => {
              const detectedFreq = frequencies[note]
              const isDetected = detectedNotes.includes(note)
              const centsOff = detectedFreq ? getCentsOff(detectedFreq, targetFreq) : 0
              const isInTune = Math.abs(centsOff) < 5

              return (
                <div key={note} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold fs-5">{note}</span>
                    <span className={`badge ${isInTune ? 'bg-success' : 'bg-warning'}`}>
                      {isDetected ? (isInTune ? 'In Tune' : `${centsOff > 0 ? '+' : ''}${centsOff.toFixed(1)} cents`) : 'Not Detected'}
                    </span>
                  </div>
                  
                  {/* Visual Tuner */}
                  <div className="tuner-needle-container position-relative" style={{ height: '60px', background: '#f0f0f0', borderRadius: '4px' }}>
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '2px', height: '100%', background: '#333' }}></div>
                    {isDetected && (
                      <div
                        className="position-absolute top-50"
                        style={{
                          left: `${50 + (centsOff * 2)}%`,
                          width: '2px',
                          height: '100%',
                          background: isInTune ? '#28a745' : '#ffc107',
                          transform: 'translateY(-50%)',
                        }}
                      ></div>
                    )}
                  </div>

                  {detectedFreq && (
                    <div className="text-muted small mt-2">
                      Detected: {detectedFreq.toFixed(2)} Hz (Target: {targetFreq.toFixed(2)} Hz)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tuner

