/**
 * Tone.js Sampler utility for piano chord playback
 * Uses Tone.Sampler with piano samples to play chords
 */

// Dynamic import for Tone.js (client-side only)
let Tone: any = null;

const loadTone = async () => {
  if (typeof window === 'undefined') return null;
  if (Tone) return Tone;
  
  try {
    // Use dynamic import with webpack chunk name for better code splitting
    Tone = await import(/* webpackChunkName: "tone" */ 'tone');
    return Tone.default || Tone;
  } catch (error) {
    console.error('Failed to load Tone.js:', error);
    return null;
  }
};

// Map note names to Tone.js note format (e.g., "C" -> "C4", "D#" -> "D#4")
const noteToToneNote = (note: string, octave: number = 4): string => {
  // Handle French notation
  const frenchToEnglish: { [key: string]: string } = {
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
  };

  // Convert French to English if needed
  let englishNote = note;
  for (const [french, english] of Object.entries(frenchToEnglish)) {
    if (note.startsWith(french)) {
      englishNote = english + note.substring(french.length);
      break;
    }
  }

  // Extract base note (remove any suffixes like 'm', '7', etc.)
  const baseNoteMatch = englishNote.match(/^([A-G][#b]?)/);
  if (!baseNoteMatch) {
    return `${englishNote}${octave}`;
  }

  const baseNote = baseNoteMatch[1];
  
  // Convert flat to sharp for Tone.js compatibility
  const flatToSharp: { [key: string]: string } = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };

  const normalizedNote = flatToSharp[baseNote] || baseNote;
  
  return `${normalizedNote}${octave}`;
};

// Piano sampler instance (singleton)
let pianoSampler: any = null;
let isInitialized = false;

/**
 * Initialize the piano sampler
 * Uses the Salamander piano samples from Tone.js examples
 */
export const initializePianoSampler = async () => {
  if (pianoSampler && isInitialized) {
    return pianoSampler;
  }

  // Load Tone.js
  const ToneModule = await loadTone();
  if (!ToneModule) {
    throw new Error('Tone.js is not available');
  }

  // Use Salamander piano samples (free, high quality)
  // These are sparse samples that Tone.Sampler will pitch shift to fill gaps
  const ToneClass = ToneModule.default || ToneModule;
  pianoSampler = new ToneClass.Sampler({
    urls: {
      C4: 'C4.mp3',
      'D#4': 'Ds4.mp3',
      'F#4': 'Fs4.mp3',
      A4: 'A4.mp3',
    },
    release: 1,
    baseUrl: 'https://tonejs.github.io/audio/salamander/',
  }).toDestination();

  // Wait for samples to load
  await ToneClass.loaded();
  isInitialized = true;

  return pianoSampler;
};

/**
 * Play a chord using the notes from the database
 * @param notes Array of note names (e.g., ['C', 'E', 'G'])
 * @param duration Duration in seconds (default: 2)
 * @param octave Base octave for the notes (default: 4)
 */
export const playChord = async (
  notes: string[],
  duration: number = 2,
  octave: number = 4
): Promise<void> => {
  try {
    // Load Tone.js
    const ToneModule = await loadTone();
    if (!ToneModule) {
      throw new Error('Tone.js is not available');
    }

    // Initialize Tone.js context if not already started
    const ToneClass = ToneModule.default || ToneModule;
    if (ToneClass.context && ToneClass.context.state !== 'running') {
      await ToneClass.start();
    }

    // Initialize sampler if not already done
    const sampler = await initializePianoSampler();

    // Convert notes to Tone.js format
    const toneNotes = notes.map(note => noteToToneNote(note, octave));

    // Play the chord (sampler should already be initialized with ToneClass)
    sampler.triggerAttackRelease(toneNotes, duration);
  } catch (error) {
    console.error('Error playing chord:', error);
    throw error;
  }
};

/**
 * Stop all currently playing notes
 */
export const stopAll = (): void => {
  if (pianoSampler) {
    pianoSampler.releaseAll();
  }
};

/**
 * Cleanup sampler
 */
export const disposeSampler = (): void => {
  if (pianoSampler) {
    pianoSampler.dispose();
    pianoSampler = null;
    isInitialized = false;
  }
};

