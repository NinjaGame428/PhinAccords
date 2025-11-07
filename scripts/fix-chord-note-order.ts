import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { extractNotesFromChord } from '@/utils/chord-utils'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Function to reorder notes based on inversion
function reorderNotesForInversion(notes: string[], inversion: number): string[] {
  if (inversion === 0) {
    // Root position: keep original order
    return [...notes]
  } else if (inversion > 0 && inversion < notes.length) {
    // Move first 'inversion' notes to the end
    const notesToMove = notes.slice(0, inversion)
    const remainingNotes = notes.slice(inversion)
    return [...remainingNotes, ...notesToMove]
  }
  return notes
}

async function fixChordNoteOrder() {
  console.log('🔧 Starting to fix chord note order...\n')
  console.log(`📡 Connecting to: ${supabaseUrl}\n`)

  try {
    // Fetch all chords
    const { data: chords, error: fetchError } = await supabase
      .from('piano_chords')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching chords:', fetchError.message)
      process.exit(1)
    }

    if (!chords || chords.length === 0) {
      console.log('⚠️ No chords found in database')
      process.exit(0)
    }

    console.log(`📊 Found ${chords.length} chords to process\n`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const chord of chords) {
      try {
        const inversion = chord.inversion || 0
        let notes = chord.notes || []

        // Ensure notes is an array
        if (!Array.isArray(notes) || notes.length === 0) {
          // Try to extract notes from chord name if needed
          try {
            const parsed = extractNotesFromChord(chord.chord_name || '')
            notes = parsed.notes
          } catch (e) {
            console.warn(`⚠️ Could not parse chord "${chord.chord_name}", skipping`)
            skippedCount++
            continue
          }
        }

        // Reorder notes based on inversion
        const reorderedNotes = reorderNotesForInversion(notes, inversion)

        // Check if reordering is needed
        const currentNotes = Array.isArray(chord.notes) ? chord.notes : []
        const needsUpdate = JSON.stringify(currentNotes) !== JSON.stringify(reorderedNotes)

        if (needsUpdate) {
          // Update the chord with reordered notes
          const { error: updateError } = await supabase
            .from('piano_chords')
            .update({
              notes: reorderedNotes,
              updated_at: new Date().toISOString(),
            })
            .eq('id', chord.id)

          if (updateError) {
            console.error(`❌ Error updating chord "${chord.chord_name}":`, updateError.message)
            errorCount++
          } else {
            console.log(`✅ Updated: ${chord.chord_name} (inversion ${inversion})`)
            console.log(`   Old order: ${currentNotes.join(' ')}`)
            console.log(`   New order: ${reorderedNotes.join(' ')}`)
            updatedCount++
          }
        } else {
          console.log(`✓ Already correct: ${chord.chord_name} (inversion ${inversion}) - ${reorderedNotes.join(' ')}`)
          skippedCount++
        }
      } catch (error: any) {
        console.error(`❌ Exception processing chord "${chord.chord_name}":`, error.message)
        errorCount++
      }
    }

    console.log('\n✨ Fix completed!')
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Successfully updated: ${updatedCount}`)
    console.log(`   ✓ Already correct/skipped: ${skippedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📦 Total processed: ${chords.length}`)
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

fixChordNoteOrder()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

