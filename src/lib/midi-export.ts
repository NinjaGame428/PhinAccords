/**
 * PhinAccords MIDI Export Utility
 * Heavenkeys Ltd
 * 
 * Export chord progressions to MIDI files
 * Two versions: Quantized (for sheet music) and Time-aligned (for DAWs)
 */

import { MidiWriter } from 'midi-writer-js'

export interface ChordSegment {
  startTime: number
  endTime: number
  chord: string
  confidence?: number
}

export interface BeatPosition {
  time: number
  beat: number
  downbeat: boolean
}

export interface MIDIExportOptions {
  tempo?: number
  timeSignature?: string
  quantized?: boolean
  includeBass?: boolean
}

/**
 * Convert chord name to MIDI note numbers
 */
function chordToNotes(chord: string, rootOctave: number = 4): number[] {
  const rootMatch = chord.match(/^([A-G][#b]?)/)
  if (!rootMatch) return []

  const root = rootMatch[1]
  const chordType = chord.substring(root.length)

  // MIDI note numbers (C4 = 60)
  const noteMap: { [key: string]: number } = {
    'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
    'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
    'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71,
  }

  const baseNote = noteMap[root] || 60

  // Determine intervals based on chord type
  let intervals: number[] = [0] // Root

  if (chordType.includes('m') || chordType.includes('min')) {
    intervals = [0, 3, 7] // Minor
  } else if (chordType.includes('dim')) {
    intervals = [0, 3, 6] // Diminished
  } else if (chordType.includes('aug')) {
    intervals = [0, 4, 8] // Augmented
  } else {
    intervals = [0, 4, 7] // Major
  }

  // Add extensions
  if (chordType.includes('7')) intervals.push(10) // Dominant 7th
  if (chordType.includes('maj7')) intervals.push(11) // Major 7th
  if (chordType.includes('9')) intervals.push(14) // 9th

  return intervals.map(interval => baseNote + interval)
}

/**
 * Convert seconds to MIDI duration
 */
function secondsToDuration(seconds: number, tempo: number): string {
  const beats = (seconds * tempo) / 60
  if (beats >= 4) return '1'
  if (beats >= 2) return '2'
  if (beats >= 1) return '4'
  if (beats >= 0.5) return '8'
  if (beats >= 0.25) return '16'
  return '32'
}

/**
 * Export chords to MIDI file (Quantized version)
 */
export async function exportMIDIQuantized(
  chords: ChordSegment[],
  beats: BeatPosition[],
  options: MIDIExportOptions = {}
): Promise<Blob> {
  const tempo = options.tempo || 120
  const track = new MidiWriter.Track()
  
  track.setTempo(tempo)

  // Add chords quantized to beats
  for (const chord of chords) {
    const startBeat = Math.round(chord.startTime * tempo / 60)
    const duration = Math.round((chord.endTime - chord.startTime) * tempo / 60)
    const durationStr = secondsToDuration(chord.endTime - chord.startTime, tempo)

    const notes = chordToNotes(chord.chord)
    
    track.addEvent(new MidiWriter.NoteEvent({
      pitch: notes,
      duration: durationStr,
      velocity: 100,
    }))
  }

  const write = new MidiWriter.Writer(track)
  const base64 = write.buildFile()
  
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return new Blob([bytes], { type: 'audio/midi' })
}

/**
 * Export chords to MIDI file (Time-aligned version)
 */
export async function exportMIDITimeAligned(
  chords: ChordSegment[],
  beats: BeatPosition[],
  options: MIDIExportOptions = {}
): Promise<Blob> {
  const tempo = options.tempo || 120
  const track = new MidiWriter.Track()
  
  track.setTempo(tempo)

  // Add chords with exact timing
  for (const chord of chords) {
    const duration = chord.endTime - chord.startTime
    const durationStr = secondsToDuration(duration, tempo)
    const waitTicks = Math.round((chord.startTime - (chords.indexOf(chord) > 0 ? chords[chords.indexOf(chord) - 1].endTime : 0)) * tempo / 60 * 4))

    const notes = chordToNotes(chord.chord)
    
    if (waitTicks > 0) {
      track.addEvent(new MidiWriter.NoteEvent({
        pitch: [60], // Rest
        duration: '1',
        wait: waitTicks,
        velocity: 0,
      }))
    }

    track.addEvent(new MidiWriter.NoteEvent({
      pitch: notes,
      duration: durationStr,
      velocity: 100,
    }))
  }

  // Add bass line if requested
  if (options.includeBass) {
    const bassTrack = new MidiWriter.Track()
    
    for (const chord of chords) {
      const rootMatch = chord.chord.match(/^([A-G][#b]?)/)
      if (rootMatch) {
        const root = rootMatch[1]
        const noteMap: { [key: string]: number } = {
          'C': 48, 'C#': 49, 'Db': 49, 'D': 50, 'D#': 51, 'Eb': 51,
          'E': 52, 'F': 53, 'F#': 54, 'Gb': 54, 'G': 55, 'G#': 56,
          'Ab': 56, 'A': 57, 'A#': 58, 'Bb': 58, 'B': 59,
        }
        const bassNote = noteMap[root] || 48
        const durationStr = secondsToDuration(chord.endTime - chord.startTime, tempo)

        bassTrack.addEvent(new MidiWriter.NoteEvent({
          pitch: [bassNote],
          duration: durationStr,
          velocity: 100,
        }))
      }
    }
    
    track.addTrack(bassTrack)
  }

  const write = new MidiWriter.Writer(track)
  const base64 = write.buildFile()
  
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return new Blob([bytes], { type: 'audio/midi' })
}

/**
 * Download MIDI file
 */
export function downloadMIDI(blob: Blob, filename: string = 'chords.mid') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
