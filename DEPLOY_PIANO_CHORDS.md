# Deploy Piano Chords Database to Supabase

This guide will help you populate the `piano_chords` table with comprehensive chord data including root positions, first inversions, second inversions, and third inversions.

## Generated Data

- **Total Chords**: 935
  - Root positions: 272
  - First inversions: 272
  - Second inversions: 272
  - Third inversions: 119 (for 7th chords)

## Step 1: Update Table Schema

First, run the schema update to support inversions:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/update-piano-chords-schema.sql`
4. Click **Run** to execute

This will:
- Remove the UNIQUE constraint on `chord_name` (to allow multiple inversions)
- Add `inversion` column (0 = root, 1 = first, 2 = second, 3 = third)
- Add `root_name` column (base chord name without inversion)
- Create indexes for better performance

## Step 2: Populate Chords Database

1. In Supabase SQL Editor
2. Copy and paste the contents of `supabase/populate-piano-chords.sql`
3. Click **Run** to execute

This will:
- Clear existing chords (if any)
- Insert all 935 chords with their notes, finger positions, and descriptions

## Step 3: Verify Installation

Run this query to verify the data was inserted correctly:

```sql
-- Count chords by type
SELECT 
  root_name,
  COUNT(*) as inversion_count,
  STRING_AGG(DISTINCT inversion::text, ', ' ORDER BY inversion::text) as inversions
FROM public.piano_chords
GROUP BY root_name
ORDER BY root_name
LIMIT 20;

-- Check total count
SELECT COUNT(*) as total_chords FROM public.piano_chords;
-- Should return 935

-- Check inversions distribution
SELECT 
  inversion,
  COUNT(*) as count
FROM public.piano_chords
GROUP BY inversion
ORDER BY inversion;
-- Should show: 0=272, 1=272, 2=272, 3=119
```

## Chord Types Included

The database includes all these chord types for each root note:

- Major (C, D, E, etc.)
- Minor (Cm, Dm, Em, etc.)
- Diminished (Cdim, Ddim, etc.)
- Augmented (Caug, etc.)
- Suspended 2nd (Csus2, etc.)
- Suspended 4th (Csus4, etc.)
- Dominant 7th (C7, D7, etc.)
- Major 7th (Cmaj7, etc.)
- Minor 7th (Cm7, etc.)
- Major 9th (Cmaj9, etc.)
- Dominant 9th (C9, etc.)
- Minor 9th (Cm9, etc.)
- Add 9th (Cadd9, etc.)
- Major 6th (C6, etc.)
- Minor 6th (Cm6, etc.)
- Diminished 7th (Cdim7, etc.)

## Root Notes

All root notes are included:
- Natural notes: C, D, E, F, G, A, B
- Sharps: C#, D#, F#, G#, A#
- Flats: Db, Eb, Gb, Ab, Bb

## Usage in Application

The API endpoint `/api/piano-chords?chordName=C` will return all variations of C chord including:
- C (root position)
- C/firstinversion (first inversion)
- C/secondinversion (second inversion)

The application automatically fetches chord data from the database when displaying chord diagrams.

## Regenerating the Database

If you need to regenerate the chord database:

```bash
node scripts/generate-all-piano-chords.js
```

This will regenerate:
- `supabase/populate-piano-chords.sql` - SQL insert statements
- `supabase/piano-chords-data.json` - JSON reference file

