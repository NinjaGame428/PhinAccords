'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { frenchToEnglishChord } from '@/lib/chord-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Save, Loader2, Plus, Search, CheckCircle2, XCircle, ExternalLink, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimpleSongEditorProps {
  songSlug?: string;
  songId?: string; // Keep for backward compatibility
}

interface SongData {
  title: string;
  artist_id: string;
  artist_name?: string;
  key_signature: string;
  tempo: number | string;
  lyrics: string;
}

// Helper function to create slug from title
const createSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const SimpleSongEditor: React.FC<SimpleSongEditorProps> = ({ songSlug, songId }) => {
  // Use slug if provided, otherwise fall back to ID
  const identifier = songSlug || songId || '';
  const router = useRouter();
  const [currentSongId, setCurrentSongId] = useState<string>(''); // Track actual song ID after loading
  const [currentSongSlug, setCurrentSongSlug] = useState<string>(''); // Track current song slug
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [filteredArtists, setFilteredArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [isAddArtistModalOpen, setIsAddArtistModalOpen] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [songData, setSongData] = useState<SongData>({
    title: '',
    artist_id: '',
    artist_name: '',
    key_signature: '',
    tempo: '',
    lyrics: '',
  });
  
  // Track the ORIGINAL artist_id from when song was first loaded
  // This allows us to detect when artist actually changes
  const [originalArtistId, setOriginalArtistId] = useState<string | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadSongData = async () => {
    if (!identifier || identifier === 'null' || identifier === 'undefined' || identifier === '{songId}') {
      setLoadError('Invalid song identifier');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      // Use slug-based API if we have a slug (non-UUID), otherwise use ID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      const apiUrl = isUUID ? `/api/songs/${identifier}` : `/api/songs/slug/${identifier}`;
      
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`${apiUrl}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to load song');

      const data = await response.json();
      const song = data.song || data;

      let lyricsText = song.lyrics || '';
      if (typeof song.lyrics === 'string' && song.lyrics.startsWith('[')) {
        try {
          const sections = JSON.parse(song.lyrics);
          if (Array.isArray(sections)) {
            lyricsText = sections
              .map((section: any) => `[${section.label || section.type}]\n${section.content}`)
              .join('\n\n');
          }
        } catch (e) {
          // Keep original
        }
      }

      console.log('📝 Admin: Loaded song data:', {
        id: song.id,
        title: song.title,
        slug: song.slug,
        lyricsLength: lyricsText.length,
        lyricsPreview: lyricsText.substring(0, 100) + '...',
        hasArtist: !!song.artist_id
      });

      // Store the actual song ID and slug for API calls
      setCurrentSongId(song.id);
      const loadedSongSlug = song.slug || createSlug(song.title || '');
      setCurrentSongSlug(loadedSongSlug);
      const loadedArtistId = song.artist_id || '';
      
      setSongData({
        title: song.title || '',
        artist_id: loadedArtistId,
        artist_name: song.artists?.name || song.artist_name || '',
        key_signature: song.key_signature || '',
        tempo: song.tempo || '',
        lyrics: lyricsText,
      });
      
      // Store the ORIGINAL artist_id when song is first loaded
      // This will be used to detect actual artist changes
      setOriginalArtistId(loadedArtistId);

      if (song.artists?.name) {
        setArtistSearchQuery(song.artists.name);
      }
    } catch (error) {
      console.error('Error loading song:', error);
      setLoadError('Failed to load song data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadArtists = async () => {
    try {
      const response = await fetch('/api/artists');
      if (response.ok) {
        const data = await response.json();
        const artistsList = data.artists || [];
        setArtists(artistsList);
        setFilteredArtists(artistsList);
        console.log('✅ Loaded artists:', artistsList.length);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to load artists:', response.status, errorData);
        showNotification('Failed to load artists from database', 'error');
      }
    } catch (error) {
      console.error('❌ Error loading artists:', error);
      showNotification('Failed to load artists from database', 'error');
    }
  };

  useEffect(() => {
    loadSongData();
    loadArtists();
  }, [identifier]);

  useEffect(() => {
    if (artistSearchQuery.trim() === '') {
      // Show all artists when search is empty
      setFilteredArtists(artists);
    } else {
      const filtered = artists.filter((artist) =>
        artist.name.toLowerCase().includes(artistSearchQuery.toLowerCase())
      );
      setFilteredArtists(filtered);
    }
  }, [artistSearchQuery, artists]);

  // Initialize search query with artist name when song loads
  useEffect(() => {
    if (songData.artist_name && !artistSearchQuery) {
      setArtistSearchQuery(songData.artist_name);
    }
  }, [songData.artist_name]);

  const handleAddArtist = async () => {
    if (!newArtistName.trim()) return;

    try {
      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newArtistName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add artist');
      }

      const data = await response.json();
      const newArtist = data.artist;

      // Refresh artists list to ensure we have the latest data
      await loadArtists();
      
      setSongData({ ...songData, artist_id: newArtist.id, artist_name: newArtist.name });
      setArtistSearchQuery(newArtist.name);
      setNewArtistName('');
      setIsAddArtistModalOpen(false);
      showNotification('Artist added successfully!', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Failed to add artist', 'error');
    }
  };

  const handleSave = async () => {
    // Validate required fields - only title is required
    if (!songData.title || !songData.title.trim()) {
      showNotification('Title is required', 'error');
      return;
    }

    try {
      setIsSaving(true);

      // CRITICAL: Use the ORIGINAL artist_id from when song was first loaded
      // This is the artist_id that was in the database before any edits
      const oldArtistId = originalArtistId || songData.artist_id;
      const newArtistId = songData.artist_id; // This is the artist_id the user selected/kept

      // Ensure artist_id is a valid non-empty string
      if (!newArtistId || !newArtistId.trim()) {
        console.error('❌ Invalid artist_id before save:', newArtistId);
        showNotification('Please select a valid artist before saving', 'error');
        return;
      }

      // Generate slug from title
      const generatedSlug = createSlug(songData.title.trim());

      // Normalize chords in lyrics to English before saving
      // This ensures all chords are stored in English format in the database
      const normalizeChordsInLyrics = (htmlContent: string): string => {
        if (!htmlContent) return htmlContent;
        
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Find all chord markers and normalize their data-chord attributes to English
        const chordElements = tempDiv.querySelectorAll('[data-chord], .chord-marker');
        chordElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          const chordAttr = htmlElement.getAttribute('data-chord');
          const chordText = htmlElement.textContent || '';
          
          if (chordAttr) {
            // If chord is already in English format, keep it
            // If it's in French, convert to English
            const englishChord = chordAttr.match(/^(Do|Ré|Mi|Fa|Sol|La|Si)/) 
              ? frenchToEnglishChord(chordAttr) 
              : chordAttr;
            
            // Ensure data-chord is set to English version
            htmlElement.setAttribute('data-chord', englishChord);
          } else if (chordText) {
            // If no data-chord but has chord text, extract and convert
            const chordMatch = chordText.match(/\[([^\]]+)\]/);
            if (chordMatch) {
              const chordName = chordMatch[1];
              const englishChord = chordName.match(/^(Do|Ré|Mi|Fa|Sol|La|Si)/) 
                ? frenchToEnglishChord(chordName) 
                : chordName;
              
              // Set data-chord attribute if element doesn't have class="chord-marker"
              if (!htmlElement.classList.contains('chord-marker')) {
                htmlElement.classList.add('chord-marker');
              }
              htmlElement.setAttribute('data-chord', englishChord);
            }
          }
        });
        
        return tempDiv.innerHTML;
      };

      // Normalize lyrics content before saving
      const normalizedLyrics = normalizeChordsInLyrics(songData.lyrics || '');
      
      // Build payload with all fields - ensure everything is saved to database
      const payload: {
        title: string;
        artist_id: string;
        key_signature: string | null;
        tempo: number | null;
        lyrics: string;
        slug: string;
      } = {
        title: songData.title.trim(),
        artist_id: newArtistId.trim(), // Ensure trimmed and valid
        key_signature: songData.key_signature && songData.key_signature.trim() !== '' ? songData.key_signature.trim() : null,
        tempo: songData.tempo && songData.tempo.toString().trim() !== '' ? parseInt(songData.tempo.toString()) : null,
        lyrics: normalizedLyrics.trim() || '', // Use normalized lyrics with chords in English
        slug: generatedSlug, // Always generate slug from title
      };

      // Validate tempo is a valid number if provided
      if (payload.tempo !== null && isNaN(payload.tempo)) {
        payload.tempo = null;
      }

      // Double-check payload before sending
      if (!payload.artist_id || payload.artist_id.trim() === '') {
        console.error('❌ Invalid artist_id in payload:', payload);
        showNotification('Artist ID is missing. Please select an artist.', 'error');
        return;
      }

      console.log('🎨 Artist change tracking:', {
        originalArtistId: originalArtistId,
        oldArtistId: oldArtistId,
        newArtistId: newArtistId,
        changed: oldArtistId && newArtistId && oldArtistId !== newArtistId
      });

      console.log('💾 Admin: Saving song with payload:', {
        title: payload.title,
        artist_id: payload.artist_id,
        key_signature: payload.key_signature,
        tempo: payload.tempo,
        lyricsLength: payload.lyrics.length,
        lyricsPreview: payload.lyrics.substring(0, 100) + '...',
        lyricsType: typeof payload.lyrics,
        allFields: '✅ All fields included in payload'
      });

      // Use the actual song ID for API calls
      if (!currentSongId) {
        showNotification('Song ID not available', 'error');
        return;
      }

      // Add cache-busting and ensure fresh request
      const response = await fetch(`/api/songs/${currentSongId}?t=${Date.now()}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save song';
        let errorDetails: any = null;
        
        try {
          const errorText = await response.text();
          
          // Try to parse as JSON
          try {
            errorDetails = JSON.parse(errorText);
            errorMessage = errorDetails.error || errorDetails.details || errorDetails.message || errorMessage;
          } catch {
            // If not JSON, use text as error message
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          }
          
          console.error('❌ API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorDetails || errorText,
            url: response.url
          });
        } catch (e) {
          console.error('❌ Error parsing API error response:', e);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Verify we got song data back
      if (!data.song) {
        console.error('❌ API returned success but no song data:', data);
        throw new Error('Server returned success but no song data. Please refresh and try again.');
      }
      
      // CRITICAL: Verify the saved data matches what we sent
      if (data.song.title !== payload.title.trim()) {
        console.warn('⚠️ Title mismatch! Expected:', payload.title.trim(), 'Got:', data.song.title);
        // Force update local state with what we sent
        data.song.title = payload.title.trim();
      }
      
      if (data.song.artist_id !== payload.artist_id.trim()) {
        console.warn('⚠️ Artist ID mismatch! Expected:', payload.artist_id.trim(), 'Got:', data.song.artist_id);
        // Force update local state with what we sent
        data.song.artist_id = payload.artist_id.trim();
      }
      
      const savedArtistId = data.song.artist_id;
      
      // Use the saved artist_id from database as the final newArtistId
      const finalNewArtistId = savedArtistId || newArtistId;
      
      console.log('✅ Admin: Song saved successfully, response:', {
        songId: data.song?.id,
        title: data.song?.title,
        originalArtistId: originalArtistId,
        oldArtistId: oldArtistId,
        newArtistId: finalNewArtistId,
        artistChanged: oldArtistId && finalNewArtistId && oldArtistId !== finalNewArtistId,
        lyricsLength: data.song?.lyrics?.length || 0,
        lyricsType: typeof data.song?.lyrics,
        hasLyrics: !!data.song?.lyrics
      });

      // Verify the saved data matches what we sent
      if (data.song) {
        console.log('✅ Verification - Saved song data:', {
          title: data.song.title,
          artist_id: data.song.artist_id,
          artist_name: data.song.artists?.name,
          key_signature: data.song.key_signature,
          tempo: data.song.tempo,
          lyricsLength: data.song.lyrics?.length || 0,
          updated_at: data.song.updated_at
        });
        
        // Verify critical fields were saved
        if (data.song.title !== payload.title.trim()) {
          console.warn('⚠️ Warning: Title mismatch!');
        }
        if (data.song.artist_id !== payload.artist_id) {
          console.warn('⚠️ Warning: Artist ID mismatch!');
        }
        if (data.song.lyrics !== payload.lyrics) {
          console.warn('⚠️ Warning: Lyrics mismatch!', {
            savedLength: data.song.lyrics?.length || 0,
            sentLength: payload.lyrics.length
          });
        }
      }

      // Use slug for public URL, fall back to ID if slug not available
      const publicUrl = `${window.location.origin}/songs/${currentSongSlug || currentSongId}`;
      console.log('🔗 Public page:', publicUrl);

      // Check if artist was actually changed (use API response data if available)
      const apiArtistChanged = data.artistChanged || data.artistUpdated;
      const apiOldArtistId = data.oldArtistId;
      const apiNewArtistId = data.newArtistId || finalNewArtistId;
      
      const artistChanged = apiArtistChanged || (oldArtistId && apiNewArtistId && oldArtistId !== apiNewArtistId);
      const confirmedOldArtistId = apiOldArtistId || oldArtistId;
      
      if (artistChanged) {
        console.log('🎨 ARTIST CHANGED:', {
          from: confirmedOldArtistId,
          to: apiNewArtistId,
          songId: currentSongId,
          message: `Song moved from artist ${confirmedOldArtistId} to ${apiNewArtistId}`
        });
        showNotification(`Song artist changed successfully! Song moved from old artist to new artist.`, 'success');
      } else {
        showNotification('Song saved successfully! Changes will be visible on the public page.', 'success');
      }

      console.log('🔄 Reloading song data from database...');
      
      // CRITICAL: Update originalArtistId BEFORE reloading, so it's set correctly
      // This ensures that if loadSongData fails, we don't lose track of the save state
      setOriginalArtistId(finalNewArtistId);
      
      // Force update local state immediately with the data we know was saved
      // This ensures UI shows updated values immediately, even before reload
      setSongData(prev => ({
        ...prev,
        title: payload.title.trim(), // Use the exact title we saved
        artist_id: finalNewArtistId, // Use the confirmed artist ID
        artist_name: data.song?.artists?.name || data.newArtistName || prev.artist_name, // Use API response artist name
        key_signature: payload.key_signature || prev.key_signature,
        tempo: payload.tempo?.toString() || prev.tempo,
        lyrics: payload.lyrics || prev.lyrics // Always use the lyrics we just saved
      }));
      
      // Update slug if title changed (slug is generated from title)
      if (data.song?.slug) {
        setCurrentSongSlug(data.song.slug);
      } else if (payload.slug) {
        setCurrentSongSlug(payload.slug);
      }
      
      console.log('✅ Local state updated with saved data:', {
        title: payload.title.trim(),
        artist_id: finalNewArtistId,
        artist_name: data.song?.artists?.name || data.newArtistName,
        lyricsLength: payload.lyrics.length,
        slug: data.song?.slug || payload.slug
      });
      
      // Reload song data to verify the save and get latest state (with cache-busting)
      try {
        // Add timestamp to force fresh fetch - use ID for API calls with aggressive cache-busting
        const reloadUrl = `/api/songs/${currentSongId}?t=${Date.now()}&_nocache=true`;
        const reloadResponse = await fetch(reloadUrl, {
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          if (reloadData.song) {
            await loadSongData(); // Use existing function but it will get fresh data
          }
        } else {
          await loadSongData(); // Fallback to existing function
        }
      } catch (reloadError) {
        console.warn('⚠️ Failed to reload song data after save (but save was successful):', reloadError);
        // State is already updated above, so we're good
      }
      
      // Notify other pages that a song was updated (so artist pages can refresh song counts)
      // Include both old and new artist IDs so both artist pages can update
      const finalOldArtistId = confirmedOldArtistId || oldArtistId;
      // Use the confirmed new artist ID from API, or fall back to the one we saved earlier
      const confirmedNewArtistId = apiNewArtistId || finalNewArtistId;
      
      if (artistChanged && finalOldArtistId && confirmedNewArtistId) {
        // Artist changed - notify with both IDs so BOTH artist pages update their counts
        console.log('📢 Broadcasting artist change event to update both artists...');
        console.log(`   → Old artist ${finalOldArtistId} should DECREASE count by 1`);
        console.log(`   → New artist ${confirmedNewArtistId} should INCREASE count by 1`);
        
        window.dispatchEvent(new CustomEvent('songUpdated', { 
          detail: { 
            artistId: confirmedNewArtistId,
            oldArtistId: finalOldArtistId,
            songId: currentSongId,
            action: 'artistChanged',
            artistChanged: true,
            newArtistName: data.song?.artists?.name || data.newArtistName,
            timestamp: Date.now()
          } 
        }));
        
        // Also use localStorage for cross-tab communication
        localStorage.setItem('songUpdated', JSON.stringify({
          artistId: confirmedNewArtistId,
          oldArtistId: finalOldArtistId,
          songId: currentSongId,
          action: 'artistChanged',
          artistChanged: true,
          newArtistName: data.song?.artists?.name || data.newArtistName,
          timestamp: Date.now()
        }));
        
        // Also notify artist pages specifically
        window.dispatchEvent(new CustomEvent('artistSongCountChanged', { 
          detail: { 
            oldArtistId: finalOldArtistId,
            newArtistId: confirmedNewArtistId,
            songId: currentSongId,
            timestamp: Date.now()
          } 
        }));
        
        console.log('📢 Event broadcast complete. Both artists should update their counts now.');
      } else {
        // Just a regular update - notify with current song
        window.dispatchEvent(new CustomEvent('songUpdated', { 
          detail: { 
            artistId: confirmedNewArtistId,
            songId: currentSongId,
            action: 'updated',
            timestamp: Date.now()
          } 
        }));
        
        localStorage.setItem('songUpdated', JSON.stringify({
          artistId: confirmedNewArtistId,
          songId: songId,
          action: 'updated',
          timestamp: Date.now()
        }));
      }
      
      // Refresh artists list in case a new artist was just added
      await loadArtists();
      
      // Force a small delay to ensure database write is complete and cache clears
      setTimeout(() => {
        console.log('✅ Song update complete. Changes should now be visible across the site.');
        // Trigger a hard refresh notification for all pages
        window.dispatchEvent(new CustomEvent('forceRefresh', { 
          detail: { type: 'song', id: currentSongId } 
        }));
      }, 500);
    } catch (error: any) {
      console.error('❌ Save error:', error);
      const errorMessage = error?.message || 'Failed to save song';
      
      // Show detailed error to user
      showNotification(errorMessage, 'error');
      
      // DON'T clear form state or redirect - let user fix and retry
      // The error is already logged and displayed
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewPublicPage = () => {
    // Use slug for public URL, fall back to ID if slug not available
    const publicUrl = `${window.location.origin}/songs/${currentSongSlug || currentSongId}`;
    window.open(publicUrl, '_blank');
  };

  const lineCount = songData.lyrics.split('\n').length;
  const charCount = songData.lyrics.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Song</h2>
              <p className="text-muted-foreground mb-4">{loadError}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-4 z-50 animate-in slide-in-from-top-2">
          <Alert className={`${toastType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertDescription className={toastType === 'success' ? 'text-green-800' : 'text-red-800'}>
                {toastMessage}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Song</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewPublicPage}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview Public Page
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Song Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={songData.title}
                onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                placeholder="Enter song title"
              />
            </div>

            {/* Artist */}
            <div>
              <Label htmlFor="artist">Artist</Label>
              {songData.artist_id && songData.artist_name && (
                <p className="text-xs text-muted-foreground mb-2">
                  Selected: <span className="font-medium">{songData.artist_name}</span>
                </p>
              )}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="artist"
                    value={artistSearchQuery}
                    onChange={(e) => {
                      setArtistSearchQuery(e.target.value);
                      setShowArtistDropdown(true); // Show dropdown when typing
                    }}
                    onFocus={() => {
                      // Show dropdown when input is focused
                      setShowArtistDropdown(true);
                      if (artistSearchQuery.trim() === '' && artists.length > 0) {
                        setFilteredArtists(artists);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding dropdown to allow clicks
                      setTimeout(() => setShowArtistDropdown(false), 200);
                    }}
                    placeholder={songData.artist_name || "Search for an artist..."}
                    className="pl-9"
                  />
                  {showArtistDropdown && (filteredArtists.length > 0 || artists.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {(artistSearchQuery.trim() === '' ? artists : filteredArtists).map((artist) => (
                        <div
                          key={artist.id}
                          className={`px-4 py-2 hover:bg-muted cursor-pointer ${
                            songData.artist_id === artist.id ? 'bg-muted font-medium' : ''
                          }`}
                          onMouseDown={(e) => {
                            // Prevent input blur when clicking
                            e.preventDefault();
                          }}
                          onClick={() => {
                            setSongData({ ...songData, artist_id: artist.id, artist_name: artist.name });
                            setArtistSearchQuery(artist.name);
                            setFilteredArtists(artists); // Reset filtered list
                            setShowArtistDropdown(false); // Hide dropdown after selection
                          }}
                        >
                          {artist.name}
                          {songData.artist_id === artist.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(selected)</span>
                          )}
                        </div>
                      ))}
                      {artistSearchQuery.trim() !== '' && filteredArtists.length === 0 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                          No artists found matching "{artistSearchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                  {!showArtistDropdown && artists.length === 0 && !artistSearchQuery && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No artists found. Click + to add one.
                    </p>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddArtistModalOpen(true)}
                  title="Add new artist"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Key & Tempo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="key">Key Signature</Label>
                <Select
                  value={songData.key_signature && songData.key_signature.trim() !== '' ? songData.key_signature : '__none__'}
                  onValueChange={(value) => {
                    // Handle special "none" value
                    if (value === '__none__') {
                      setSongData({ ...songData, key_signature: '' });
                    } else {
                      setSongData({ ...songData, key_signature: value });
                    }
                  }}
                >
                  <SelectTrigger id="key">
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C#">C#</SelectItem>
                    <SelectItem value="Db">Db</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D#">D#</SelectItem>
                    <SelectItem value="Eb">Eb</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="F#">F#</SelectItem>
                    <SelectItem value="Gb">Gb</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="G#">G#</SelectItem>
                    <SelectItem value="Ab">Ab</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A#">A#</SelectItem>
                    <SelectItem value="Bb">Bb</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="Am">Am</SelectItem>
                    <SelectItem value="Bm">Bm</SelectItem>
                    <SelectItem value="Cm">Cm</SelectItem>
                    <SelectItem value="Dm">Dm</SelectItem>
                    <SelectItem value="Em">Em</SelectItem>
                    <SelectItem value="Fm">Fm</SelectItem>
                    <SelectItem value="Gm">Gm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tempo">Tempo (BPM)</Label>
                <Input
                  id="tempo"
                  type="number"
                  value={songData.tempo}
                  onChange={(e) => setSongData({ ...songData, tempo: e.target.value })}
                  placeholder="e.g., 120"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lyrics Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lyrics & Chords</CardTitle>
              <div className="text-sm text-muted-foreground">
                {lineCount} lines • {charCount} characters
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formatting Guide */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Text Editor Features:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Use the toolbar to format text (bold, italic, underline)</li>
                  <li>Click the Music icon to insert chord markers</li>
                  <li>Use <code>[Section Name]</code> for sections (e.g., [Verse 1], [Chorus])</li>
                  <li>Write chords on their own line (e.g., C G Am F)</li>
                  <li>Use spaces to align chords with lyrics</li>
                  <li>Leave blank lines between sections for better readability</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <RichTextEditor
                content={songData.lyrics || ''}
                onChange={(content) => setSongData({ ...songData, lyrics: content })}
                placeholder={`[Verse 1]\nC        G        Am       F\nAmazing grace, how sweet the sound\n\n[Chorus]\nC        G        Am       F\nHow great is our God`}
                className="min-h-[500px]"
              />
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Changes will be visible on the public page after saving. Use the toolbar above to format your lyrics and insert chord markers.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Artist Modal */}
      <Dialog open={isAddArtistModalOpen} onOpenChange={setIsAddArtistModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Artist</DialogTitle>
            <DialogDescription>Enter the name of the artist to add to the database.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newArtistName">Artist Name</Label>
            <Input
              id="newArtistName"
              value={newArtistName}
              onChange={(e) => setNewArtistName(e.target.value)}
              placeholder="Enter artist name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddArtist();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddArtistModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddArtist} disabled={!newArtistName.trim()}>
              Add Artist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
