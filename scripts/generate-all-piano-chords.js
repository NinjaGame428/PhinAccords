/**
 * Generate comprehensive piano chords database with root position, 
 * first inversion, and second inversion for all chord types
 */

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatToSharp = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

// Chord type definitions with intervals
const chordTypes = [
  { suffix: '', intervals: [0, 4, 7], difficulty: 'easy', description: 'Major triad' },
  { suffix: 'm', intervals: [0, 3, 7], difficulty: 'easy', description: 'Minor triad' },
  { suffix: 'dim', intervals: [0, 3, 6], difficulty: 'medium', description: 'Diminished triad' },
  { suffix: 'aug', intervals: [0, 4, 8], difficulty: 'medium', description: 'Augmented triad' },
  { suffix: 'sus2', intervals: [0, 2, 7], difficulty: 'medium', description: 'Suspended 2nd' },
  { suffix: 'sus4', intervals: [0, 5, 7], difficulty: 'medium', description: 'Suspended 4th' },
  { suffix: '7', intervals: [0, 4, 7, 10], difficulty: 'medium', description: 'Dominant 7th' },
  { suffix: 'maj7', intervals: [0, 4, 7, 11], difficulty: 'medium', description: 'Major 7th' },
  { suffix: 'm7', intervals: [0, 3, 7, 10], difficulty: 'medium', description: 'Minor 7th' },
  { suffix: 'maj9', intervals: [0, 4, 7, 11, 14], difficulty: 'hard', description: 'Major 9th' },
  { suffix: '9', intervals: [0, 4, 7, 10, 14], difficulty: 'hard', description: 'Dominant 9th' },
  { suffix: 'm9', intervals: [0, 3, 7, 10, 14], difficulty: 'hard', description: 'Minor 9th' },
  { suffix: 'add9', intervals: [0, 4, 7, 14], difficulty: 'medium', description: 'Add 9th' },
  { suffix: '6', intervals: [0, 4, 7, 9], difficulty: 'easy', description: 'Major 6th' },
  { suffix: 'm6', intervals: [0, 3, 7, 9], difficulty: 'medium', description: 'Minor 6th' },
  { suffix: 'dim7', intervals: [0, 3, 6, 9], difficulty: 'hard', description: 'Diminished 7th' },
];

// Root notes (all variations)
const roots = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

// Convert note to sharp notation
function toSharp(note) {
  return flatToSharp[note] || note;
}

// Get note index
function getNoteIndex(note) {
  const sharpNote = toSharp(note);
  return noteNames.indexOf(sharpNote);
}

// Generate notes for a chord
function generateChordNotes(root, intervals) {
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return [];
  
  const notes = [];
  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    notes.push(noteNames[noteIndex]);
  });
  
  return notes;
}

// Generate finger positions (default for each inversion)
function generateFingerPositions(notes, inversion = 0) {
  // Default finger positions based on number of notes and inversion
  const numNotes = notes.length;
  
  if (numNotes === 3) {
    // Triads
    if (inversion === 0) {
      return [1, 3, 5]; // Root position
    } else if (inversion === 1) {
      return [1, 2, 5]; // First inversion
    } else {
      return [1, 3, 5]; // Second inversion
    }
  } else if (numNotes === 4) {
    // 7th chords
    if (inversion === 0) {
      return [1, 2, 3, 5]; // Root position
    } else if (inversion === 1) {
      return [1, 2, 4, 5]; // First inversion
    } else if (inversion === 2) {
      return [1, 2, 3, 5]; // Second inversion
    } else {
      return [1, 2, 3, 5]; // Third inversion
    }
  } else if (numNotes === 5) {
    // 9th chords
    return [1, 2, 3, 4, 5]; // Use all fingers
  }
  
  // Default
  return Array(numNotes).fill(0).map((_, i) => i + 1);
}

// Generate inversions
function generateInversions(notes) {
  const inversions = [];
  
  // Root position (0th inversion)
  inversions.push({ notes: [...notes], inversion: 0, name: 'Root Position' });
  
  // First inversion - move root up one octave
  if (notes.length > 0) {
    const firstInv = [...notes.slice(1), notes[0]];
    inversions.push({ notes: firstInv, inversion: 1, name: 'First Inversion' });
  }
  
  // Second inversion - move first two notes up one octave
  if (notes.length > 1) {
    const secondInv = [...notes.slice(2), notes[0], notes[1]];
    inversions.push({ notes: secondInv, inversion: 2, name: 'Second Inversion' });
  }
  
  // Third inversion (for 7th chords)
  if (notes.length > 2) {
    const thirdInv = [...notes.slice(3), notes[0], notes[1], notes[2]];
    if (notes.length === 4) {
      inversions.push({ notes: thirdInv, inversion: 3, name: 'Third Inversion' });
    }
  }
  
  return inversions;
}

// Generate all chords
function generateAllChords() {
  const chords = [];
  
  for (const root of roots) {
    for (const chordType of chordTypes) {
      const chordName = root + chordType.suffix;
      const rootNotes = generateChordNotes(root, chordType.intervals);
      
      if (rootNotes.length === 0) continue;
      
      // Get key signature (root note without accidental, or closest)
      const keySignature = root.replace(/[#b]/, '');
      
      const inversions = generateInversions(rootNotes);
      
      inversions.forEach((inv, idx) => {
        const fullChordName = idx === 0 
          ? chordName 
          : `${chordName}/${inv.name.replace(' ', '').toLowerCase()}`;
        
        chords.push({
          chord_name: fullChordName,
          key_signature: keySignature,
          difficulty: chordType.difficulty.charAt(0).toUpperCase() + chordType.difficulty.slice(1), // Capitalize: 'easy' -> 'Easy'
          notes: inv.notes,
          finger_positions: generateFingerPositions(inv.notes, inv.inversion),
          description: `${chordType.description} - ${inv.name}`,
          inversion: inv.inversion,
          root_name: chordName,
          intervals: chordType.intervals
        });
      });
    }
  }
  
  return chords;
}

// Extract chord type from description
function extractChordType(description) {
  if (description.includes('Major triad')) return 'major';
  if (description.includes('Minor triad')) return 'minor';
  if (description.includes('Diminished triad')) return 'diminished';
  if (description.includes('Augmented triad')) return 'augmented';
  if (description.includes('Suspended 2nd')) return 'sus2';
  if (description.includes('Suspended 4th')) return 'sus4';
  if (description.includes('Dominant 7th')) return 'dominant7';
  if (description.includes('Major 7th')) return 'major7';
  if (description.includes('Minor 7th')) return 'minor7';
  if (description.includes('Major 9th')) return 'major9';
  if (description.includes('Dominant 9th')) return 'dominant9';
  if (description.includes('Minor 9th')) return 'minor9';
  if (description.includes('Add 9th')) return 'add9';
  if (description.includes('Major 6th')) return 'major6';
  if (description.includes('Minor 6th')) return 'minor6';
  if (description.includes('Diminished 7th')) return 'diminished7';
  return null;
}

// Extract root note from root_name (e.g., 'C' from 'C', 'Cm', 'C#maj7')
function extractRootNote(rootName) {
  if (!rootName) return null;
  
  // Match the base note (C, C#, D, D#, etc.) at the start
  const match = rootName.match(/^([A-G][#b]?)/);
  if (match) {
    return match[1];
  }
  
  return rootName.charAt(0); // Fallback to first character
}

// Generate SQL insert statements
function generateSQL(chords) {
  const sqlStatements = [];
  
  sqlStatements.push('-- Clear existing chords');
  sqlStatements.push('DELETE FROM public.piano_chords;');
  sqlStatements.push('');
  sqlStatements.push('-- Insert all piano chords with inversions');
  sqlStatements.push('INSERT INTO public.piano_chords (chord_name, key_signature, difficulty, notes, finger_positions, description, inversion, root_name, chord_type, root_note, intervals) VALUES');
  
  const values = chords.map((chord, index) => {
    const notesArray = `ARRAY[${chord.notes.map(n => `'${n}'`).join(', ')}]`;
    const fingerPositions = JSON.stringify(chord.finger_positions);
    const chordType = extractChordType(chord.description);
    const chordTypeValue = chordType ? `'${chordType}'` : 'NULL';
    const rootNote = extractRootNote(chord.root_name);
    const rootNoteValue = rootNote ? `'${rootNote.replace(/'/g, "''")}'` : 'NULL';
    const intervalsArray = chord.intervals ? `ARRAY[${chord.intervals.join(', ')}]::integer[]` : 'NULL';
    
    return `  ('${chord.chord_name.replace(/'/g, "''")}', '${chord.key_signature}', '${chord.difficulty}', ${notesArray}, '${fingerPositions}'::jsonb, '${chord.description.replace(/'/g, "''")}', ${chord.inversion}, '${chord.root_name.replace(/'/g, "''")}', ${chordTypeValue}, ${rootNoteValue}, ${intervalsArray})${index < chords.length - 1 ? ',' : ';'}`;
  });
  
  sqlStatements.push(...values);
  
  return sqlStatements.join('\n');
}

// Main execution
const allChords = generateAllChords();
console.log(`Generated ${allChords.length} chords with inversions`);
console.log(`\nBreakdown:`);
console.log(`- Root positions: ${allChords.filter(c => c.inversion === 0).length}`);
console.log(`- First inversions: ${allChords.filter(c => c.inversion === 1).length}`);
console.log(`- Second inversions: ${allChords.filter(c => c.inversion === 2).length}`);
console.log(`- Third inversions: ${allChords.filter(c => c.inversion === 3).length}`);

// Generate SQL
const sql = generateSQL(allChords);

// Write to file
const fs = require('fs');
const path = require('path');
const outputPath = path.join(__dirname, '..', 'supabase', 'populate-piano-chords.sql');

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`\n✅ SQL file generated: ${outputPath}`);
console.log(`\nTo deploy to Supabase:`);
console.log(`1. Open Supabase SQL Editor`);
console.log(`2. Copy and paste the contents of ${outputPath}`);
console.log(`3. Run the SQL script`);

// Also generate a JSON file for reference
const jsonOutput = {
  total: allChords.length,
  chords: allChords
};
const jsonPath = path.join(__dirname, '..', 'supabase', 'piano-chords-data.json');
fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
console.log(`\n✅ JSON reference file generated: ${jsonPath}`);

