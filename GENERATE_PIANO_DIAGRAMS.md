# Generate Piano Chord Diagrams

This guide explains how to generate `diagram_data` and `diagram_svg` for all piano chords in the database.

## Overview

The script `scripts/generate-piano-chord-diagrams.js`:
1. Fetches all piano chords from the Supabase database
2. Generates `diagram_data` (JSONB) containing chord configuration, key positions, and metadata
3. Generates `diagram_svg` (SVG string) for visual piano keyboard diagrams
4. Updates the database with the generated data
5. Prioritizes root position chords (inversion = 0) first

## Prerequisites

1. Ensure your `.env.local` file contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Ensure the `piano_chords` table has the required columns:
   - `diagram_data` (JSONB) - for storing diagram configuration
   - `diagram_svg` (TEXT) - for storing SVG strings
   - `inversion` (INTEGER) - 0 for root position, 1-3 for inversions
   - `notes` (TEXT[]) - array of note names
   - `intervals` (INTEGER[]) - semitone intervals for the chord

## Running the Script

### Option 1: Using npm script (Recommended)

```bash
npm run generate-piano-diagrams
```

### Option 2: Direct Node execution

```bash
node scripts/generate-piano-chord-diagrams.js
```

## What the Script Does

1. **Fetches Chords**: Retrieves all chords from `piano_chords` table, ordered by inversion (root position first)

2. **Generates diagram_data**: Creates a JSONB object containing:
   ```json
   {
     "notes": ["C", "E", "G"],
     "intervals": [0, 4, 7],
     "keyPositions": {
       "white": [{"note": "C", "x": 0, "isHighlighted": true}, ...],
       "black": [...]
     },
     "chordName": "C",
     "inversion": 0,
     "isRootPosition": true,
     "whiteKeys": ["C", "E", "G"],
     "blackKeys": [],
     "generatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

3. **Generates diagram_svg**: Creates an SVG string representing the piano keyboard with highlighted keys:
   - White keys are drawn at positions: C(0), D(50), E(100), F(150), G(200), A(250), B(300)
   - Black keys are drawn at positions: C#(35), D#(85), F#(185), G#(235), A#(285)
   - Pressed keys are highlighted in red (#dc2626 for white, #991b1b for black)

4. **Updates Database**: Updates each chord record with the generated `diagram_data` and `diagram_svg`

5. **Verification**: Outputs statistics and sample root position chords

## Root Position Priority

- Chords with `inversion = 0` are root position chords
- The script processes root positions first
- The API route (`app/api/piano-chords/route.ts`) orders results by inversion (root position first)
- Root position is mentioned in the `description` field (e.g., "Major triad - Root Position")

## Example Output

```
🔄 Fetching all piano chords from database...
✅ Found 935 chords
   - Root positions: 272
   - First inversions: 272
   - Second inversions: 272
   - Third inversions: 119

🔄 Generating diagram_data and diagram_svg...
   ✓ Processed 50 chords...
   ✓ Processed 100 chords...
   ...

✅ Generation complete!
   ✓ Successfully processed: 935
   ⚠️  Skipped: 0
   ❌ Errors: 0

📊 Sample root position chords:
   C: ✓ (inversion: 0)
   Cm: ✓ (inversion: 0)
   Cdim: ✓ (inversion: 0)
   ...
```

## Troubleshooting

### Error: Missing Supabase environment variables
- Ensure `.env.local` exists and contains both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- The service role key is required to update the database

### Error: No chords found
- Verify that chords exist in the `piano_chords` table
- Run `supabase/populate-piano-chords.sql` if the table is empty

### Chords missing notes
- The script will skip chords that don't have a `notes` array
- Verify that all chords in the database have valid `notes` arrays

### SVG not displaying correctly
- Verify the SVG string is valid XML
- Check that note names match the expected format (C, C#, D, D#, etc.)
- Ensure black key positions match the expected coordinates

## Database Schema Requirements

The `piano_chords` table must have:
- `id` (UUID) - Primary key
- `chord_name` (TEXT) - Chord name
- `notes` (TEXT[]) - Array of note names
- `intervals` (INTEGER[]) - Semitone intervals
- `inversion` (INTEGER) - Inversion number (0 = root position)
- `diagram_data` (JSONB) - Will be populated by script
- `diagram_svg` (TEXT) - Will be populated by script

Run `supabase/update-piano-chords-schema.sql` if these columns don't exist.

## Using the Generated Data

Once diagrams are generated, you can use them in your application:

```typescript
// Fetch chord with diagram data
const { data } = await supabase
  .from('piano_chords')
  .select('*, diagram_data, diagram_svg')
  .eq('chord_name', 'C')
  .eq('inversion', 0) // Root position
  .single();

// Use diagram_svg directly
<div dangerouslySetInnerHTML={{ __html: data.diagram_svg }} />

// Or use diagram_data to render custom UI
const diagramData = data.diagram_data;
// Access keyPositions.white, keyPositions.black, etc.
```

