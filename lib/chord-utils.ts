/**
 * Utility functions for chord name conversion between languages
 * and chord transposition
 */

// Convert English chord name to French
export const englishToFrenchChord = (chordName: string): string => {
  // French note names mapping
  const noteMap: { [key: string]: string } = {
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
  };

  // Extract root note and suffix
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chordName;

  const rootNote = match[1];
  const suffix = match[2];

  // Convert root note to French
  const frenchRoot = noteMap[rootNote] || rootNote;

  return frenchRoot + suffix;
};

// Convert French chord name to English
export const frenchToEnglishChord = (chordName: string): string => {
  // French to English note names mapping
  const noteMap: { [key: string]: string } = {
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

  // Check if it starts with a French note name
  for (const [french, english] of Object.entries(noteMap)) {
    if (chordName.startsWith(french)) {
      const suffix = chordName.substring(french.length);
      return english + suffix;
    }
  }

  // If no French note found, return as-is (already English or unrecognized)
  return chordName;
};

// Get chord name in the specified language
export const getChordName = (chordName: string, language: 'en' | 'fr'): string => {
  if (language === 'fr') {
    // Check if already in French format
    const frenchNotes = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
    const isFrench = frenchNotes.some(note => chordName.startsWith(note));
    
    if (isFrench) {
      return chordName; // Already French
    }
    
    return englishToFrenchChord(chordName);
  } else {
    // Check if it's French and convert to English
    const frenchNotes = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
    const isFrench = frenchNotes.some(note => chordName.startsWith(note));
    
    if (isFrench) {
      return frenchToEnglishChord(chordName);
    }
    
    return chordName; // Already English
  }
};

// Convert array of chord names to specified language
export const convertChordArray = (chords: string[], language: 'en' | 'fr'): string[] => {
  return chords.map(chord => getChordName(chord, language));
};

/**
 * Get semitone index for a key (handles both sharp and flat notation)
 */
export const getSemitoneIndex = (key: string): number => {
  const keyMap: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
    // French note names
    'Do': 0, 'Do#': 1, 'Ré♭': 1, 'Ré': 2, 'Ré#': 3, 'Mi♭': 3,
    'Mi': 4, 'Fa': 5, 'Fa#': 6, 'Sol♭': 6, 'Sol': 7, 'Sol#': 8,
    'La♭': 8, 'La': 9, 'La#': 10, 'Si♭': 10, 'Si': 11,
  };
  
  // Remove any modifiers like 'm' for minor
  const cleanKey = key.replace(/m$/, '').trim();
  return keyMap[cleanKey] ?? 0;
};

/**
 * Get key name from semitone index
 */
export const getKeyFromIndex = (index: number, preferSharp: boolean = true): string => {
  const keysSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keysFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  return preferSharp ? keysSharp[index % 12] : keysFlat[index % 12];
};

/**
 * Transpose a chord name by a certain number of semitones
 */
export const transposeChord = (chordName: string, semitones: number): string => {
  // Extract root note and suffix
  const chordMatch = chordName.match(/^([A-G][#b]?|Do|Ré|Mi|Fa|Sol|La|Si|Do#|Ré#|Fa#|Sol#|La#|Ré♭|Mi♭|Sol♭|La♭|Si♭)(.*)$/);
  if (!chordMatch) return chordName;
  
  const rootNote = chordMatch[1];
  const suffix = chordMatch[2];
  
  // Convert French to English if needed for calculation
  let englishRoot = rootNote;
  const frenchToEnglish: { [key: string]: string } = {
    'Do': 'C', 'Do#': 'C#', 'Ré♭': 'Db', 'Ré': 'D', 'Ré#': 'D#',
    'Mi♭': 'Eb', 'Mi': 'E', 'Fa': 'F', 'Fa#': 'F#', 'Sol♭': 'Gb',
    'Sol': 'G', 'Sol#': 'G#', 'La♭': 'Ab', 'La': 'A', 'La#': 'A#',
    'Si♭': 'Bb', 'Si': 'B',
  };
  
  if (frenchToEnglish[rootNote]) {
    englishRoot = frenchToEnglish[rootNote];
  }
  
  // Get current index
  const currentIndex = getSemitoneIndex(englishRoot);
  if (currentIndex === undefined) return chordName;
  
  // Calculate new index
  const newIndex = (currentIndex + semitones + 12) % 12;
  
  // Determine if we should use sharp or flat based on original
  const preferSharp = englishRoot.includes('#');
  const preferFlat = englishRoot.includes('b') || englishRoot === 'Db' || englishRoot === 'Eb' || englishRoot === 'Gb' || englishRoot === 'Ab' || englishRoot === 'Bb';
  
  // Get new root note (in same language as original)
  let newRoot: string;
  if (preferFlat && !preferSharp) {
    newRoot = getKeyFromIndex(newIndex, false);
  } else {
    newRoot = getKeyFromIndex(newIndex, true);
  }
  
  // If original was French, convert back to French
  if (frenchToEnglish[rootNote]) {
    const englishToFrench: { [key: string]: string } = {
      'C': 'Do', 'C#': 'Do#', 'Db': 'Ré♭', 'D': 'Ré', 'D#': 'Ré#',
      'Eb': 'Mi♭', 'E': 'Mi', 'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Sol♭',
      'G': 'Sol', 'G#': 'Sol#', 'Ab': 'La♭', 'A': 'La', 'A#': 'La#',
      'Bb': 'Si♭', 'B': 'Si',
    };
    newRoot = englishToFrench[newRoot] || newRoot;
  }
  
  return newRoot + suffix;
};

