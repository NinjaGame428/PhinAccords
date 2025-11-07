/**
 * Generate diagram_data and diagram_svg for all piano chords in the database
 * This script:
 * 1. Fetches all chords from the database
 * 2. Generates diagram_data (JSONB) based on notes and intervals
 * 3. Generates diagram_svg (SVG string) for piano keyboard visualization
 * 4. Updates the database with generated data
 * 5. Prioritizes root position chords (inversion = 0)
 */

// Try to load environment variables from multiple possible locations
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Try .env.local first, then .env
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else {
  // Try to load from .env.local anyway (might be in parent directory)
  dotenv.config({ path: '.env.local' });
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please ensure your .env.local file contains:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('');
  console.error('The service role key can be found in your Supabase Dashboard:');
  console.error('  Settings > API > service_role key (secret)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Note names in order (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Flat to sharp conversion
const flatToSharp = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

// Normalize note to sharp notation
const normalizeNote = (note) => {
  return flatToSharp[note] || note;
};

// Get note index in chromatic scale
const getNoteIndex = (note) => {
  const normalized = normalizeNote(note);
  return noteNames.indexOf(normalized);
};

// Check if a note is a black key
const isBlackKey = (note) => {
  const normalized = normalizeNote(note);
  return normalized.includes('#');
};

// Black key positions (x coordinates)
const blackKeyPositions = {
  'C#': 35,
  'D#': 85,
  'F#': 185,
  'G#': 235,
  'A#': 285
};

// White key positions (x coordinates)
const whiteKeyPositions = {
  'C': 0,
  'D': 50,
  'E': 100,
  'F': 150,
  'G': 200,
  'A': 250,
  'B': 300
};

// Generate diagram_data JSONB object
const generateDiagramData = (notes, intervals, chordName, inversion) => {
  const normalizedNotes = notes.map(note => normalizeNote(note));
  const whiteKeys = normalizedNotes.filter(note => !isBlackKey(note));
  const blackKeys = normalizedNotes.filter(note => isBlackKey(note));

  // Key positions for highlighting
  const keyPositions = {
    white: whiteKeys.map(note => {
      const baseNote = note.replace('#', '');
      return {
        note: note,
        x: whiteKeyPositions[baseNote] || 0,
        isHighlighted: true
      };
    }),
    black: blackKeys.map(note => {
      return {
        note: note,
        x: blackKeyPositions[note] || 0,
        isHighlighted: true
      };
    })
  };

  return {
    notes: normalizedNotes,
    intervals: intervals || [],
    keyPositions: keyPositions,
    chordName: chordName,
    inversion: inversion || 0,
    isRootPosition: (inversion || 0) === 0,
    whiteKeys: whiteKeys,
    blackKeys: blackKeys,
    generatedAt: new Date().toISOString()
  };
};

// Generate SVG string for piano keyboard diagram
const generateDiagramSVG = (notes, chordName) => {
  const normalizedNotes = notes.map(note => normalizeNote(note));
  
  // White keys in octave
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  
  // Black keys in octave
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  
  // Check if note is pressed
  const isKeyPressed = (note) => {
    return normalizedNotes.some(n => normalizeNote(n) === note);
  };

  // Generate SVG elements
  let svgElements = [];
  
  // White keys
  whiteKeys.forEach((note, idx) => {
    const x = idx * 50;
    const isHighlighted = isKeyPressed(note);
    
    svgElements.push(`
      <g>
        <rect
          x="${x}"
          y="20"
          width="48"
          height="150"
          fill="${isHighlighted ? '#dc2626' : '#ffffff'}"
          stroke="${isHighlighted ? '#991b1b' : '#d1d5db'}"
          stroke-width="${isHighlighted ? '3' : '1.5'}"
          rx="3"
          ry="3"
        />
        <text
          x="${x + 24}"
          y="165"
          text-anchor="middle"
          font-size="16"
          font-weight="bold"
          fill="${isHighlighted ? 'white' : '#1f2937'}"
        >${note}</text>
        ${isHighlighted ? `
        <circle
          cx="${x + 24}"
          cy="85"
          r="8"
          fill="#991b1b"
          opacity="0.9"
        />` : ''}
      </g>
    `);
  });
  
  // Black keys
  blackKeys.forEach((note) => {
    const x = blackKeyPositions[note] || 0;
    const isHighlighted = isKeyPressed(note);
    
    svgElements.push(`
      <g>
        <rect
          x="${x}"
          y="20"
          width="32"
          height="100"
          fill="${isHighlighted ? '#991b1b' : '#1f2937'}"
          stroke="${isHighlighted ? '#7f1d1d' : '#111827'}"
          stroke-width="${isHighlighted ? '2.5' : '1.5'}"
          rx="2"
          ry="2"
        />
        <text
          x="${x + 16}"
          y="105"
          text-anchor="middle"
          font-size="11"
          font-weight="bold"
          fill="white"
        >${note}</text>
        ${isHighlighted ? `
        <circle
          cx="${x + 16}"
          cy="60"
          r="6"
          fill="#dc2626"
          opacity="0.95"
        />` : ''}
      </g>
    `);
  });
  
  const svg = `<svg width="100%" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
    ${svgElements.join('\n')}
  </svg>`;
  
  return svg;
};

// Main function to process all chords
const generateDiagramsForAllChords = async () => {
  try {
    console.log('🔄 Fetching all piano chords from database...');
    
    // Fetch all chords, prioritizing root position (inversion = 0)
    const { data: chords, error: fetchError } = await supabase
      .from('piano_chords')
      .select('*')
      .order('inversion', { ascending: true }) // Root position first
      .order('chord_name', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching chords:', fetchError);
      throw fetchError;
    }

    if (!chords || chords.length === 0) {
      console.log('⚠️  No chords found in database');
      return;
    }

    console.log(`✅ Found ${chords.length} chords`);
    console.log(`   - Root positions: ${chords.filter(c => c.inversion === 0).length}`);
    console.log(`   - First inversions: ${chords.filter(c => c.inversion === 1).length}`);
    console.log(`   - Second inversions: ${chords.filter(c => c.inversion === 2).length}`);
    console.log(`   - Third inversions: ${chords.filter(c => c.inversion === 3).length}`);
    console.log('\n🔄 Generating diagram_data and diagram_svg...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process chords in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < chords.length; i += batchSize) {
      const batch = chords.slice(i, i + batchSize);
      
      for (const chord of batch) {
        try {
          // Skip if already has diagram data (optional - remove if you want to regenerate)
          // if (chord.diagram_data && chord.diagram_svg) {
          //   skippedCount++;
          //   continue;
          // }

          const notes = chord.notes || [];
          const intervals = chord.intervals || [];
          const inversion = chord.inversion || 0;
          const chordName = chord.chord_name || '';

          if (!notes || notes.length === 0) {
            console.warn(`⚠️  Skipping chord ${chordName}: no notes`);
            skippedCount++;
            continue;
          }

          // Generate diagram_data
          const diagramData = generateDiagramData(notes, intervals, chordName, inversion);

          // Generate diagram_svg
          const diagramSVG = generateDiagramSVG(notes, chordName);

          // Update database
          const { error: updateError } = await supabase
            .from('piano_chords')
            .update({
              diagram_data: diagramData,
              diagram_svg: diagramSVG,
              updated_at: new Date().toISOString()
            })
            .eq('id', chord.id);

          if (updateError) {
            console.error(`❌ Error updating chord ${chordName} (${chord.id}):`, updateError.message);
            errorCount++;
          } else {
            successCount++;
            if (successCount % 50 === 0) {
              console.log(`   ✓ Processed ${successCount} chords...`);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing chord ${chord.chord_name}:`, error.message);
          errorCount++;
        }
      }

      // Small delay between batches
      if (i + batchSize < chords.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n✅ Generation complete!');
    console.log(`   ✓ Successfully processed: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    // Verify root position chords
    const { data: rootChords } = await supabase
      .from('piano_chords')
      .select('id, chord_name, inversion, diagram_data, diagram_svg')
      .eq('inversion', 0)
      .limit(10);

    console.log('\n📊 Sample root position chords:');
    rootChords?.forEach(chord => {
      const hasData = !!(chord.diagram_data && chord.diagram_svg);
      console.log(`   ${chord.chord_name}: ${hasData ? '✓' : '✗'} (inversion: ${chord.inversion})`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  generateDiagramsForAllChords()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { generateDiagramsForAllChords, generateDiagramData, generateDiagramSVG };

