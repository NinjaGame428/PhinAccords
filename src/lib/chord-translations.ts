/**
 * French Chord Name Translations
 * Convert English chord names to French solfège notation
 */

type Language = 'en' | 'fr'

/**
 * Note to French solfège mapping
 */
const noteToFrench: Record<string, string> = {
  'C': 'Do',
  'C#': 'Do#',
  'Db': 'Ré♭',
  'D': 'Ré',
  'D#': 'Ré#',
  'Eb': 'Mi♭',
  'E': 'Mi',
  'F': 'Fa',
  'F#': 'Fa#',
  'Gb': 'Sol♭',
  'G': 'Sol',
  'G#': 'Sol#',
  'Ab': 'La♭',
  'A': 'La',
  'A#': 'La#',
  'Bb': 'Si♭',
  'B': 'Si',
}

/**
 * French to English note mapping (reverse)
 */
const frenchToNote: Record<string, string> = {
  'Do': 'C',
  'Do#': 'C#',
  'Ré♭': 'Db',
  'Ré': 'D',
  'Ré#': 'D#',
  'Mi♭': 'Eb',
  'Mi': 'E',
  'Fa': 'F',
  'Fa#': 'F#',
  'Sol♭': 'Gb',
  'Sol': 'G',
  'Sol#': 'G#',
  'La♭': 'Ab',
  'La': 'A',
  'La#': 'A#',
  'Si♭': 'Bb',
  'Si': 'B',
}

/**
 * Chord type translations
 */
const chordTypeTranslations: Record<string, string> = {
  'maj': 'maj',
  'min': 'm',
  'dim': 'dim',
  'aug': 'aug',
  'sus': 'sus',
  'add': 'add',
  '7': '7',
  '9': '9',
  '11': '11',
  '13': '13',
}

/**
 * Convert English chord name to French
 */
export function translateChordToFrench(chord: string): string {
  if (!chord) return chord

  // Handle common chord patterns
  // Examples: C, Cm, C7, Cmaj7, Cm7, C#m, Bb, etc.

  // Extract root note (first 1-2 characters)
  const rootMatch = chord.match(/^([A-G][#b]?)/i)
  if (!rootMatch) return chord

  const rootNote = rootMatch[1]
  const rootUpper = rootNote.charAt(0).toUpperCase() + rootNote.slice(1)
  
  // Get French root note
  const frenchRoot = noteToFrench[rootUpper] || rootNote
  
  // Get the rest of the chord (type, extensions, etc.)
  const restOfChord = chord.slice(rootNote.length)
  
  // Return French root + rest of chord
  return frenchRoot + restOfChord
}

/**
 * Convert French chord name to English
 */
export function translateChordToEnglish(chord: string): string {
  if (!chord) return chord

  // Try to match French note names
  for (const [french, english] of Object.entries(frenchToNote)) {
    if (chord.startsWith(french)) {
      const restOfChord = chord.slice(french.length)
      return english + restOfChord
    }
  }

  return chord
}

/**
 * Translate chord based on language
 */
export function translateChord(chord: string, language: Language): string {
  if (language === 'fr') {
    return translateChordToFrench(chord)
  }
  return chord
}

/**
 * Translate array of chords
 */
export function translateChords(chords: string[], language: Language): string[] {
  return chords.map((chord) => translateChord(chord, language))
}

/**
 * Translate chord progression string
 */
export function translateChordProgression(progression: string, language: Language): string {
  if (!progression) return progression

  // Split by common separators (space, comma, dash, pipe)
  const chords = progression.split(/[\s,\-|]+/).filter(Boolean)
  const translated = translateChords(chords, language)
  
  // Try to preserve original separators
  const separators = progression.match(/[\s,\-|]+/g) || []
  let result = translated[0] || ''
  
  for (let i = 0; i < separators.length && i < translated.length - 1; i++) {
    result += separators[i] + translated[i + 1]
  }

  return result
}

