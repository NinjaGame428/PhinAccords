/**
 * Script to remove duplicate piano chords from the database
 * Removes duplicates based on root_name + inversion combination
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const removeDuplicateChords = async () => {
  try {
    console.log('🔄 Fetching all piano chords from database...');
    
    // Fetch all chords
    const { data: chords, error: fetchError } = await supabase
      .from('piano_chords')
      .select('*')
      .order('inversion', { ascending: true })
      .order('chord_name', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching chords:', fetchError);
      throw fetchError;
    }

    if (!chords || chords.length === 0) {
      console.log('⚠️  No chords found in database');
      return;
    }

    console.log(`✅ Found ${chords.length} total chords\n`);

    // Identify duplicates based on root_name + inversion
    const uniqueChordsMap = new Map();
    const duplicates = [];

    chords.forEach((chord) => {
      const rootName = chord.root_name || chord.chord_name;
      const inversion = chord.inversion ?? 0;
      const uniqueKey = `${rootName}_${inversion}`;

      if (!uniqueChordsMap.has(uniqueKey)) {
        // First occurrence - keep it
        uniqueChordsMap.set(uniqueKey, chord);
      } else {
        // Duplicate found
        const existing = uniqueChordsMap.get(uniqueKey);
        duplicates.push(chord);
        
        // Prefer root position if one is root and the other isn't
        if (chord.inversion === 0 && existing.inversion !== 0) {
          duplicates.pop(); // Remove current from duplicates
          duplicates.push(existing); // Add existing to duplicates
          uniqueChordsMap.set(uniqueKey, chord); // Keep current
        }
      }
    });

    console.log(`📊 Analysis:`);
    console.log(`   - Unique chords: ${uniqueChordsMap.size}`);
    console.log(`   - Duplicates to remove: ${duplicates.length}`);
    console.log(`   - Total will remain: ${uniqueChordsMap.size}\n`);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    // Show some examples
    console.log('📝 Example duplicates to remove:');
    duplicates.slice(0, 10).forEach((dup) => {
      console.log(`   - ID: ${dup.id}, Name: ${dup.chord_name}, Root: ${dup.root_name}, Inversion: ${dup.inversion}`);
    });
    if (duplicates.length > 10) {
      console.log(`   ... and ${duplicates.length - 10} more`);
    }
    console.log('');

    // Ask for confirmation (for safety, you can modify this to auto-confirm)
    console.log('⚠️  Ready to delete duplicates. This cannot be undone.');
    console.log(`   Will delete ${duplicates.length} duplicate chord(s).\n`);

    // Delete duplicates
    const duplicateIds = duplicates.map(d => d.id);
    
    console.log('🗑️  Deleting duplicates...');
    const { error: deleteError } = await supabase
      .from('piano_chords')
      .delete()
      .in('id', duplicateIds);

    if (deleteError) {
      console.error('❌ Error deleting duplicates:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Successfully deleted ${duplicates.length} duplicate chord(s)`);

    // Verify final count
    const { data: finalChords, error: finalError } = await supabase
      .from('piano_chords')
      .select('id', { count: 'exact', head: true });

    if (!finalError) {
      console.log(`\n📊 Final count: ${finalChords?.length || 0} chords remaining`);
    }

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    process.exit(1);
  }
};

// Run the script
removeDuplicateChords()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

