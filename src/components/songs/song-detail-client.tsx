'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Song } from '@/types/song'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useLanguage } from '@/contexts/LanguageContext'
import PremiumToolbar from '@/components/premium/toolbar'
import { exportMIDIQuantized, exportMIDITimeAligned, downloadMIDI } from '@/lib/midi-export'
import { exportPDF } from '@/lib/pdf-export'
import type { ChordSegment, BeatPosition } from '@/lib/midi-export'

interface SongDetailClientProps {
  song: Song
}

const SongDetailClient: React.FC<SongDetailClientProps> = ({ song }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { user } = useAuth()
  const { success, error: notifyError } = useNotification()
  const { t } = useLanguage()
  const [currentKey, setCurrentKey] = useState(song.key_signature || 'C')
  const [capo, setCapo] = useState(0)
  const [tempo, setTempo] = useState(song.tempo ? parseInt(song.tempo.toString()) : 120)
  const [isLooping, setIsLooping] = useState(false)
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(0)
  const [songVolume, setSongVolume] = useState(100)
  const [chordsVolume, setChordsVolume] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const isFav = isFavorite(song.id)

  const handleFavoriteToggle = async () => {
    if (!user) {
      notifyError('Please log in to add favorites')
      return
    }

    if (isFav) {
      const { error } = await removeFavorite(song.id)
      if (error) {
        notifyError('Failed to remove favorite')
      } else {
        success('Removed from favorites')
      }
    } else {
      const { error } = await addFavorite(song.id)
      if (error) {
        notifyError('Failed to add favorite')
      } else {
        success('Added to favorites')
      }
    }
  }

  const transposeKey = (key: string, semitones: number) => {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const currentIndex = keys.indexOf(key)
    if (currentIndex === -1) return key
    const newIndex = (currentIndex + semitones + 12) % 12
    return keys[newIndex]
  }

  const handleTranspose = (semitones: number) => {
    setCurrentKey(transposeKey(currentKey, semitones))
  }

  const handleExportMIDI = async () => {
    try {
      // Parse chord progression if available
      let chords: ChordSegment[] = []
      let beats: BeatPosition[] = []

      if (song.chord_progression) {
        try {
          const parsed = typeof song.chord_progression === 'string' 
            ? JSON.parse(song.chord_progression)
            : song.chord_progression
          chords = parsed.chords || []
          beats = parsed.beats || []
        } catch {
          // Fallback: create simple chord segments
          chords = [{ startTime: 0, endTime: 4, chord: currentKey }]
        }
      }

      const blob = await exportMIDIQuantized(chords, beats, {
        tempo,
        timeSignature: song.time_signature || '4/4',
        quantized: true,
        includeBass: true,
      })

      downloadMIDI(blob, `${song.title.replace(/[^a-z0-9]/gi, '_')}.mid`)
      success('MIDI file downloaded successfully')
    } catch (error: any) {
      notifyError(error.message || 'Failed to export MIDI')
    }
  }

  const handleExportPDF = async () => {
    try {
      let chords: ChordSegment[] = []

      if (song.chord_progression) {
        try {
          const parsed = typeof song.chord_progression === 'string'
            ? JSON.parse(song.chord_progression)
            : song.chord_progression
          chords = parsed.chords || []
        } catch {
          chords = [{ startTime: 0, endTime: 4, chord: currentKey }]
        }
      }

      await exportPDF(chords, {
        title: song.title,
        artist: song.artist || song.artist_data?.name || 'Unknown',
        key: currentKey,
        tempo,
        timeSignature: song.time_signature || '4/4',
        includeChords: true,
        includeLyrics: !!song.lyrics,
        lyrics: song.lyrics || undefined,
      })

      success('PDF exported successfully')
    } catch (error: any) {
      notifyError(error.message || 'Failed to export PDF')
    }
  }

  const handleCountOff = () => {
    // Play count-off sound (1, 2, 3, 4)
    // Implementation would use Tone.js or Web Audio API
    success('Count-off: 1, 2, 3, 4')
  }

  return (
    <div className="song-detail">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div>
              <h1 className="mb-2">{song.title}</h1>
              <p className="text-muted mb-2">
                {song.artist || song.artist_data?.name || 'Unknown Artist'}
                {song.genre && ` • ${song.genre}`}
                {song.year && ` • ${song.year}`}
              </p>
            </div>
            <button
              className="btn-six tran3s"
              onClick={handleFavoriteToggle}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <i className={`bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
            </button>
          </div>

          {/* Metadata */}
          <div className="d-flex flex-wrap gap-3 mb-3">
            {song.key_signature && (
              <div>
                <span className="badge bg-secondary">{t('song.key')}: {currentKey}</span>
              </div>
            )}
            {song.difficulty && (
              <div>
                <span className="badge bg-info">{t('song.difficulty')}: {song.difficulty}</span>
              </div>
            )}
            {song.tempo && (
              <div>
                <span className="badge bg-success">Tempo: {song.tempo}</span>
              </div>
            )}
            {song.time_signature && (
              <div>
                <span className="badge bg-warning">Time: {song.time_signature}</span>
              </div>
            )}
          </div>

          {/* Premium Toolbar */}
          <PremiumToolbar
            currentKey={currentKey}
            onTranspose={handleTranspose}
            onCapoChange={setCapo}
            onTempoChange={setTempo}
            onLoopToggle={() => setIsLooping(!isLooping)}
            onLoopSet={(start, end) => {
              setLoopStart(start)
              setLoopEnd(end)
            }}
            onVolumeChange={(type, volume) => {
              if (type === 'song') setSongVolume(volume)
              else setChordsVolume(volume)
            }}
            onExportMIDI={handleExportMIDI}
            onExportPDF={handleExportPDF}
            onCountOff={handleCountOff}
            songVolume={songVolume}
            chordsVolume={chordsVolume}
            tempo={tempo}
            isLooping={isLooping}
            loopStart={loopStart}
            loopEnd={loopEnd}
            capo={capo}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onSeek={(seconds) => setCurrentTime(seconds)}
            currentTime={currentTime}
            duration={0} // Would be set from audio player
          />

          {/* Stats */}
          <div className="d-flex gap-4 text-muted small">
            {song.rating !== undefined && (
              <div>
                <i className="bi bi-star-fill text-warning"></i> {song.rating.toFixed(1)}
              </div>
            )}
            {song.downloads !== undefined && (
              <div>
                <i className="bi bi-download"></i> {song.downloads} {t('song.downloads')}
              </div>
            )}
          </div>
        </div>

        {song.thumbnail_url && (
          <div className="col-md-4">
            <Image
              src={song.thumbnail_url}
              alt={song.title}
              width={400}
              height={300}
              className="img-fluid rounded"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
      </div>

      {/* Description */}
      {song.description && (
        <div className="mb-4">
          <p>{song.description}</p>
        </div>
      )}

      {/* YouTube Video */}
      {song.youtube_url && (
        <div className="mb-4">
          <h3>Video</h3>
          <div className="ratio ratio-16x9">
            <iframe
              src={`https://www.youtube.com/embed/${song.youtube_id || song.youtube_url.split('/').pop()}`}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Lyrics and Chords */}
      {song.lyrics && (
        <div className="mb-4">
          <h3>Lyrics & Chords</h3>
          <div className="card">
            <div className="card-body">
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {song.lyrics}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Chord Chart */}
      {song.chord_chart && (
        <div className="mb-4">
          <h3>Chord Chart</h3>
          <div className="card">
            <div className="card-body">
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {song.chord_chart}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Chord Progression */}
      {song.chord_progression && (
        <div className="mb-4">
          <h3>Chord Progression</h3>
          <div className="card">
            <div className="card-body">
              <p className="mb-0">{song.chord_progression}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {song.tags && song.tags.length > 0 && (
        <div className="mb-4">
          <h3>Tags</h3>
          <div>
            {song.tags.map((tag, index) => (
              <span key={index} className="badge bg-secondary me-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-4">
        <Link href="/" className="btn-six tran3s">
          <i className="bi bi-arrow-left"></i> Back to Songs
        </Link>
      </div>
    </div>
  )
}

export default SongDetailClient

