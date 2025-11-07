<!-- 26103396-cafe-416e-a85e-979a42899da0 ee6c4d5d-7d1c-4cab-9424-7e250a118d89 -->
# Fix Song Editor and Lyrics Display

## Problem Analysis

From the logs, we see:

- Lyrics are sent with 214 characters but return as 0 after save
- This indicates the database update is failing silently or the column type is incompatible
- The public page already has proper lyrics rendering logic, but no lyrics are being saved

## Changes Required

### 1. Fix Database Save Issue in API Route

**File**: `app/api/songs/[id]/route.ts`

The issue is likely that lyrics are being saved but not retrieved correctly. Need to:

- Add more detailed logging after the update to see what's actually saved
- Verify the lyrics field is being included in the response
- Check if there's a data type mismatch (TEXT vs JSON)

**Changes**:

- Line 97-102: Add logging to show exact payload being sent to Supabase
- Line 131-139: Add logging after fetch to verify lyrics were saved
- Line 145: Log the returned song data to verify lyrics field

### 2. Verify SimpleSongEditor Payload

**File**: `components/admin/SimpleSongEditor.tsx`

Current payload at line 186-192 looks correct, but need to ensure:

- Lyrics are being sent as plain text string (not JSON)
- Empty strings are handled correctly
- Artist selection is working

**Changes**:

- Line 194: Enhance logging to show exact lyrics being sent
- Line 208: Log the response data to verify what was saved
- Line 215: Reload should fetch fresh data from database

### 3. Artist Selection Enhancement

**File**: `components/admin/SimpleSongEditor.tsx`

Current implementation at lines 140-170 for adding artists looks functional, but needs verification:

- Ensure new artist is added to database via POST `/api/artists`
- Ensure artist dropdown updates after adding new artist
- Ensure selected artist_id is included in save payload

**Already implemented correctly** - no changes needed here.

### 4. Verify Public Page Display

**File**: `app/songs/[slug]/page.tsx`

Lines 293-337 already have excellent lyrics rendering:

- Section headers styled as badges
- Chord lines in blue
- Proper spacing and formatting

**No changes needed** - display logic is already perfect. Once lyrics save correctly, they will display