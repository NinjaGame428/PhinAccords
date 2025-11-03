-- Add French chord name and description columns to piano_chords table
-- This script adds chord_name_fr and description_fr columns

-- Add chord_name_fr column if it doesn't exist
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS chord_name_fr TEXT;

-- Add description_fr column if it doesn't exist
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS description_fr TEXT;

-- Function to convert English chord name to French
-- This will be used to populate chord_name_fr
CREATE OR REPLACE FUNCTION convert_chord_to_french(chord_name_en TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Replace English root notes with French equivalents
  result := chord_name_en;
  
  -- Order matters: longer patterns first
  result := REPLACE(result, 'C#', 'Do#');
  result := REPLACE(result, 'C', 'Do');
  result := REPLACE(result, 'Db', 'Ré♭');
  result := REPLACE(result, 'D#', 'Ré#');
  result := REPLACE(result, 'D', 'Ré');
  result := REPLACE(result, 'Eb', 'Mi♭');
  result := REPLACE(result, 'E', 'Mi');
  result := REPLACE(result, 'F#', 'Fa#');
  result := REPLACE(result, 'F', 'Fa');
  result := REPLACE(result, 'Gb', 'Sol♭');
  result := REPLACE(result, 'G#', 'Sol#');
  result := REPLACE(result, 'G', 'Sol');
  result := REPLACE(result, 'Ab', 'La♭');
  result := REPLACE(result, 'A#', 'La#');
  result := REPLACE(result, 'A', 'La');
  result := REPLACE(result, 'Bb', 'Si♭');
  result := REPLACE(result, 'B', 'Si');
  
  -- But wait, we need to be more careful - we should only replace at the start
  -- Let's use a regex approach instead
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Better approach: Use regex to match only at the beginning
-- Handles cases like "Dbm6", "C#7", "Abmaj7", etc.
CREATE OR REPLACE FUNCTION convert_chord_to_french_v2(chord_name_en TEXT) RETURNS TEXT AS $$
DECLARE
  root_note TEXT;
  suffix TEXT;
  french_root TEXT;
  match_result TEXT[];
BEGIN
  -- Handle NULL or empty
  IF chord_name_en IS NULL OR chord_name_en = '' THEN
    RETURN chord_name_en;
  END IF;
  
  -- Extract root note and suffix using regex
  -- Pattern matches: Note (A-G) optionally followed by # or b, then everything else
  -- Examples: "C" -> ["C", "C", ""], "Db" -> ["Db", "D", "b"], "Dbm6" -> ["Db", "D", "b"], "C#7" -> ["C#", "C", "#"]
  match_result := regexp_match(chord_name_en, '^([A-G])([#b]?)(.*)$');
  
  IF match_result IS NULL OR array_length(match_result, 1) < 2 THEN
    -- If regex doesn't match, return as-is
    RETURN chord_name_en;
  END IF;
  
  -- Reconstruct root note from match result
  root_note := match_result[1] || COALESCE(match_result[2], '');
  suffix := COALESCE(match_result[3], '');
  
  -- Convert root note to French
  CASE root_note
    WHEN 'C' THEN french_root := 'Do';
    WHEN 'C#' THEN french_root := 'Do#';
    WHEN 'Db' THEN french_root := 'Ré♭';
    WHEN 'D' THEN french_root := 'Ré';
    WHEN 'D#' THEN french_root := 'Ré#';
    WHEN 'Eb' THEN french_root := 'Mi♭';
    WHEN 'E' THEN french_root := 'Mi';
    WHEN 'F' THEN french_root := 'Fa';
    WHEN 'F#' THEN french_root := 'Fa#';
    WHEN 'Gb' THEN french_root := 'Sol♭';
    WHEN 'G' THEN french_root := 'Sol';
    WHEN 'G#' THEN french_root := 'Sol#';
    WHEN 'Ab' THEN french_root := 'La♭';
    WHEN 'A' THEN french_root := 'La';
    WHEN 'A#' THEN french_root := 'La#';
    WHEN 'Bb' THEN french_root := 'Si♭';
    WHEN 'B' THEN french_root := 'Si';
    ELSE french_root := root_note;
  END CASE;
  
  RETURN french_root || suffix;
END;
$$ LANGUAGE plpgsql;

-- Function to convert English description to French
CREATE OR REPLACE FUNCTION convert_description_to_french(description_en TEXT) RETURNS TEXT AS $$
BEGIN
  IF description_en IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Translate chord type descriptions
  description_en := REPLACE(description_en, 'Major triad - Root Position', 'Triade majeure - Position fondamentale');
  description_en := REPLACE(description_en, 'Major triad - First Inversion', 'Triade majeure - Premier renversement');
  description_en := REPLACE(description_en, 'Major triad - Second Inversion', 'Triade majeure - Second renversement');
  description_en := REPLACE(description_en, 'Major triad - Third Inversion', 'Triade majeure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Minor triad - Root Position', 'Triade mineure - Position fondamentale');
  description_en := REPLACE(description_en, 'Minor triad - First Inversion', 'Triade mineure - Premier renversement');
  description_en := REPLACE(description_en, 'Minor triad - Second Inversion', 'Triade mineure - Second renversement');
  description_en := REPLACE(description_en, 'Minor triad - Third Inversion', 'Triade mineure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Diminished triad - Root Position', 'Triade diminuée - Position fondamentale');
  description_en := REPLACE(description_en, 'Diminished triad - First Inversion', 'Triade diminuée - Premier renversement');
  description_en := REPLACE(description_en, 'Diminished triad - Second Inversion', 'Triade diminuée - Second renversement');
  description_en := REPLACE(description_en, 'Diminished triad - Third Inversion', 'Triade diminuée - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Augmented triad - Root Position', 'Triade augmentée - Position fondamentale');
  description_en := REPLACE(description_en, 'Augmented triad - First Inversion', 'Triade augmentée - Premier renversement');
  description_en := REPLACE(description_en, 'Augmented triad - Second Inversion', 'Triade augmentée - Second renversement');
  description_en := REPLACE(description_en, 'Augmented triad - Third Inversion', 'Triade augmentée - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Dominant 7th - Root Position', 'Septième dominante - Position fondamentale');
  description_en := REPLACE(description_en, 'Dominant 7th - First Inversion', 'Septième dominante - Premier renversement');
  description_en := REPLACE(description_en, 'Dominant 7th - Second Inversion', 'Septième dominante - Second renversement');
  description_en := REPLACE(description_en, 'Dominant 7th - Third Inversion', 'Septième dominante - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Major 7th - Root Position', 'Septième majeure - Position fondamentale');
  description_en := REPLACE(description_en, 'Major 7th - First Inversion', 'Septième majeure - Premier renversement');
  description_en := REPLACE(description_en, 'Major 7th - Second Inversion', 'Septième majeure - Second renversement');
  description_en := REPLACE(description_en, 'Major 7th - Third Inversion', 'Septième majeure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Minor 7th - Root Position', 'Septième mineure - Position fondamentale');
  description_en := REPLACE(description_en, 'Minor 7th - First Inversion', 'Septième mineure - Premier renversement');
  description_en := REPLACE(description_en, 'Minor 7th - Second Inversion', 'Septième mineure - Second renversement');
  description_en := REPLACE(description_en, 'Minor 7th - Third Inversion', 'Septième mineure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Diminished 7th - Root Position', 'Septième diminuée - Position fondamentale');
  description_en := REPLACE(description_en, 'Diminished 7th - First Inversion', 'Septième diminuée - Premier renversement');
  description_en := REPLACE(description_en, 'Diminished 7th - Second Inversion', 'Septième diminuée - Second renversement');
  description_en := REPLACE(description_en, 'Diminished 7th - Third Inversion', 'Septième diminuée - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Dominant 9th - Root Position', 'Neuvième dominante - Position fondamentale');
  description_en := REPLACE(description_en, 'Dominant 9th - First Inversion', 'Neuvième dominante - Premier renversement');
  description_en := REPLACE(description_en, 'Dominant 9th - Second Inversion', 'Neuvième dominante - Second renversement');
  description_en := REPLACE(description_en, 'Dominant 9th - Third Inversion', 'Neuvième dominante - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Major 9th - Root Position', 'Neuvième majeure - Position fondamentale');
  description_en := REPLACE(description_en, 'Major 9th - First Inversion', 'Neuvième majeure - Premier renversement');
  description_en := REPLACE(description_en, 'Major 9th - Second Inversion', 'Neuvième majeure - Second renversement');
  description_en := REPLACE(description_en, 'Major 9th - Third Inversion', 'Neuvième majeure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Minor 9th - Root Position', 'Neuvième mineure - Position fondamentale');
  description_en := REPLACE(description_en, 'Minor 9th - First Inversion', 'Neuvième mineure - Premier renversement');
  description_en := REPLACE(description_en, 'Minor 9th - Second Inversion', 'Neuvième mineure - Second renversement');
  description_en := REPLACE(description_en, 'Minor 9th - Third Inversion', 'Neuvième mineure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Major 6th - Root Position', 'Sixième majeure - Position fondamentale');
  description_en := REPLACE(description_en, 'Major 6th - First Inversion', 'Sixième majeure - Premier renversement');
  description_en := REPLACE(description_en, 'Major 6th - Second Inversion', 'Sixième majeure - Second renversement');
  description_en := REPLACE(description_en, 'Major 6th - Third Inversion', 'Sixième majeure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Minor 6th - Root Position', 'Sixième mineure - Position fondamentale');
  description_en := REPLACE(description_en, 'Minor 6th - First Inversion', 'Sixième mineure - Premier renversement');
  description_en := REPLACE(description_en, 'Minor 6th - Second Inversion', 'Sixième mineure - Second renversement');
  description_en := REPLACE(description_en, 'Minor 6th - Third Inversion', 'Sixième mineure - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Suspended 2nd - Root Position', 'Suspendue 2de - Position fondamentale');
  description_en := REPLACE(description_en, 'Suspended 2nd - First Inversion', 'Suspendue 2de - Premier renversement');
  description_en := REPLACE(description_en, 'Suspended 2nd - Second Inversion', 'Suspendue 2de - Second renversement');
  description_en := REPLACE(description_en, 'Suspended 2nd - Third Inversion', 'Suspendue 2de - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Suspended 4th - Root Position', 'Suspendue 4e - Position fondamentale');
  description_en := REPLACE(description_en, 'Suspended 4th - First Inversion', 'Suspendue 4e - Premier renversement');
  description_en := REPLACE(description_en, 'Suspended 4th - Second Inversion', 'Suspendue 4e - Second renversement');
  description_en := REPLACE(description_en, 'Suspended 4th - Third Inversion', 'Suspendue 4e - Troisième renversement');
  
  description_en := REPLACE(description_en, 'Add 9th - Root Position', 'Ajout de 9e - Position fondamentale');
  description_en := REPLACE(description_en, 'Add 9th - First Inversion', 'Ajout de 9e - Premier renversement');
  description_en := REPLACE(description_en, 'Add 9th - Second Inversion', 'Ajout de 9e - Second renversement');
  description_en := REPLACE(description_en, 'Add 9th - Third Inversion', 'Ajout de 9e - Troisième renversement');
  
  RETURN description_en;
END;
$$ LANGUAGE plpgsql;

-- Populate French chord names and descriptions
-- Update ALL rows to ensure consistency
UPDATE public.piano_chords
SET 
  chord_name_fr = convert_chord_to_french_v2(chord_name),
  description_fr = convert_description_to_french(description);

-- Verify the conversion worked correctly (test query - can be removed after verification)
-- Uncomment to test:
-- SELECT chord_name, chord_name_fr, description, description_fr 
-- FROM public.piano_chords 
-- WHERE chord_name LIKE 'Db%' OR chord_name LIKE 'C#%' OR chord_name LIKE 'Ab%'
-- LIMIT 10;

-- Create index on chord_name_fr for performance
CREATE INDEX IF NOT EXISTS idx_piano_chords_chord_name_fr ON public.piano_chords(chord_name_fr);

-- Add comments
COMMENT ON COLUMN public.piano_chords.chord_name_fr IS 'French name of the chord (e.g., "Do" for "C")';
COMMENT ON COLUMN public.piano_chords.description_fr IS 'French description of the chord type and inversion';

