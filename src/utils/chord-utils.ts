// Note names in different formats
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const NOTE_NAMES_FR = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

// Chord type intervals (in semitones)
const CHORD_INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7], // Major triad
  m: [0, 3, 7], // Minor triad
  '5': [0, 7], // Power chord
  dim: [0, 3, 6], // Diminished
  aug: [0, 4, 8], // Augmented
  sus2: [0, 2, 7], // Suspended 2nd
  sus4: [0, 5, 7], // Suspended 4th
  '6': [0, 4, 7, 9], // Major 6th
  m6: [0, 3, 7, 9], // Minor 6th
  '7': [0, 4, 7, 10], // Dominant 7th
  maj7: [0, 4, 7, 11], // Major 7th
  m7: [0, 3, 7, 10], // Minor 7th
  '7sus4': [0, 5, 7, 10], // 7th suspended 4th
  '9': [0, 4, 7, 10, 14], // 9th
  m9: [0, 3, 7, 10, 14], // Minor 9th
  add9: [0, 4, 7, 14], // Add 9th
  '11': [0, 4, 7, 10, 14, 17], // 11th
  '13': [0, 4, 7, 10, 14, 17, 21], // 13th
}

export interface ChordNotes {
  root: string
  notes: string[]
  intervals: number[]
}

export const extractNotesFromChord = (chordName: string): ChordNotes => {
  // Parse chord name (e.g., "Cmaj7", "Am", "F#sus4")
  const match = chordName.match(/^([A-G][#b]?)(.*)/)
  if (!match) {
    throw new Error(`Invalid chord name: ${chordName}`)
  }

  const root = match[1]
  const chordType = match[2] || ''

  // Get root note index
  const rootIndex = NOTE_NAMES.indexOf(root)
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${root}`)
  }

  // Get intervals for chord type
  const intervals = CHORD_INTERVALS[chordType] || CHORD_INTERVALS['']
  if (!intervals) {
    throw new Error(`Unknown chord type: ${chordType}`)
  }

  // Calculate notes from intervals
  const notes = intervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12
    return NOTE_NAMES[noteIndex]
  })

  return {
    root,
    notes,
    intervals,
  }
}

export const getNoteAtInterval = (rootNote: string, interval: number): string => {
  const rootIndex = NOTE_NAMES.indexOf(rootNote)
  if (rootIndex === -1) return rootNote

  const noteIndex = (rootIndex + interval) % 12
  return NOTE_NAMES[noteIndex]
}

export const getNoteName = (note: string, language: 'en' | 'fr' = 'en'): string => {
  const index = NOTE_NAMES.indexOf(note)
  if (index === -1) return note

  if (language === 'fr') {
    return NOTE_NAMES_FR[index]
  }

  return NOTE_NAMES[index]
}

export const getChordInversion = (
  chordNotes: string[],
  inversion: number
): string[] => {
  if (inversion === 0) return chordNotes

  const inverted = [...chordNotes]
  for (let i = 0; i < inversion; i++) {
    const note = inverted.shift()
    if (note) {
      // Move note up an octave
      const noteIndex = NOTE_NAMES.indexOf(note)
      const nextOctaveNote = NOTE_NAMES[noteIndex] // Same note, next octave
      inverted.push(nextOctaveNote)
    }
  }

  return inverted
}

export const formatChordName = (root: string, chordType: string): string => {
  if (!chordType) return root
  return `${root}${chordType}`
}

