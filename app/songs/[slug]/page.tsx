'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, Music, Guitar, Piano, ExternalLink, Heart, RefreshCw, Clock, Edit } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedRoute } from '@/lib/url-translations';
import { PianoChordTooltip } from '@/components/ui/piano-chord-tooltip';
import '@/components/ui/rich-text-editor.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PianoChordDiagram from '@/components/piano-chord-diagram';

// Component to fetch and display individual chord with database data
const ChordPreviewItem = ({ chordName }: { chordName: string }) => {
  const [chordData, setChordData] = useState<any>(null);

  useEffect(() => {
    const fetchChordData = async () => {
      try {
        const response = await fetch(`/api/piano-chords?chordName=${encodeURIComponent(chordName)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.chords && data.chords.length > 0) {
            // Use first matching chord
            const chord = data.chords[0];
            setChordData({
              notes: chord.notes || [],
              fingers: chord.finger_positions || [],
              description: chord.description || '',
              difficulty: chord.difficulty || 'Medium'
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch chord data for', chordName);
      }
    };
    fetchChordData();
  }, [chordName]);

  return (
    <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
      <PianoChordDiagram
        chordName={chordName}
        notes={chordData?.notes || []}
        fingers={chordData?.fingers || []}
        description={chordData?.description || ''}
        difficulty={chordData?.difficulty || 'Medium'}
      />
    </div>
  );
};

const SongDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const songSlug = params.slug;
  const { t, language } = useLanguage();
  const [song, setSong] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedChord, setSelectedChord] = useState<{ name: string; position: { x: number; y: number } } | null>(null);
  const [transposeKey, setTransposeKey] = useState<string | null>(null);
  const [transposedLyrics, setTransposedLyrics] = useState<string | null>(null);
  const [uniqueChords, setUniqueChords] = useState<Set<string>>(new Set()); // Always stores ORIGINAL chords

  // Helper function to create slug from title
  const createSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  // Chord transposition logic
  const getSemitoneIndex = (key: string): number => {
    const keyMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    // Remove any modifiers like 'm' for minor
    const cleanKey = key.replace(/m$/, '').trim();
    return keyMap[cleanKey] ?? 0;
  };

  const getKeyFromIndex = (index: number, preferSharp: boolean = true): string => {
    const keysSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keysFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    return preferSharp ? keysSharp[index % 12] : keysFlat[index % 12];
  };

  const transposeChord = (chordName: string, semitones: number): string => {
    // Extract root note and suffix
    const chordMatch = chordName.match(/^([A-G][#b]?)(.*)$/);
    if (!chordMatch) return chordName;
    
    const rootNote = chordMatch[1];
    const suffix = chordMatch[2];
    
    // Get current index
    const currentIndex = getSemitoneIndex(rootNote);
    if (currentIndex === undefined) return chordName;
    
    // Calculate new index
    const newIndex = (currentIndex + semitones + 12) % 12;
    
    // Determine if we should use sharp or flat based on original
    const preferSharp = rootNote.includes('#');
    const preferFlat = rootNote.includes('b');
    
    // Get new root note
    let newRoot: string;
    if (preferFlat) {
      newRoot = getKeyFromIndex(newIndex, false);
    } else {
      newRoot = getKeyFromIndex(newIndex, true);
    }
    
    return newRoot + suffix;
  };

  const transposeChordsInLyrics = (targetKey: string) => {
    if (!song || !song.lyrics) return;
    
    const originalKey = song.key_signature || 'C';
    const originalIndex = getSemitoneIndex(originalKey);
    const targetIndex = getSemitoneIndex(targetKey);
    const semitones = targetIndex - originalIndex;
    
    console.log('🎹 Transposing:', {
      originalKey,
      originalIndex,
      targetKey,
      targetIndex,
      semitones,
      calculatedTarget: getKeyFromIndex(targetIndex, true)
    });
    
    if (semitones === 0) {
      setTransposedLyrics(null);
      return;
    }
    
    // Replace chords in HTML format: <span class="chord">[ChordName]</span>
    let transposedHtml = song.lyrics;
    
    // Pattern to match chord spans: <span class="chord" ...>[ChordName]</span>
    const chordSpanPattern = /<span\s+class="chord"[^>]*>\[([^\]]+)\]<\/span>/gi;
    
    transposedHtml = transposedHtml.replace(chordSpanPattern, (match: string, chordName: string) => {
      const transposed = transposeChord(chordName.trim(), semitones);
      // Preserve the original span attributes
      return match.replace(/\[([^\]]+)\]/, `[${transposed}]`);
    });
    
    // Also handle any standalone chord patterns in brackets
    const standaloneChordPattern = /\[([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13)?(?:\/[A-G][#b]?)?)\]/gi;
    transposedHtml = transposedHtml.replace(standaloneChordPattern, (match: string, chordName: string) => {
      // Only replace if not already inside a chord span
      if (!match.includes('class="chord"')) {
        const transposed = transposeChord(chordName, semitones);
        return `[${transposed}]`;
      }
      return match;
    });
    
    setTransposedLyrics(transposedHtml);
    // DO NOT update uniqueChords here - keep original chords displayed
  };

  // Extract unique chords from lyrics
  const extractChords = (lyricsHtml: string) => {
    if (!lyricsHtml) return;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = lyricsHtml;
    
    const chordSet = new Set<string>();
    
    // Find all chord spans
    const chordElements = tempDiv.querySelectorAll('.chord');
    chordElements.forEach((element) => {
      const chordText = element.textContent || '';
      const chordName = chordText.replace(/\[|\]/g, '').trim();
      if (chordName) {
        chordSet.add(chordName);
      }
    });
    
    // Also find standalone chord patterns
    const chordPattern = /\[([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13)?(?:\/[A-G][#b]?)?)\]/gi;
    let match;
    while ((match = chordPattern.exec(lyricsHtml)) !== null) {
      if (!match[0].includes('class="chord"')) {
        chordSet.add(match[1]);
      }
    }
    
    setUniqueChords(chordSet);
  };

  // Reset transpose when song changes
  useEffect(() => {
    if (song) {
      setTransposeKey(null);
      setTransposedLyrics(null);
      extractChords(song.lyrics);
    }
  }, [song?.id]);

  const fetchSong = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('🔍 Fetching song with slug:', songSlug);

      // Fetch song by slug using API
      const encodedSlug = encodeURIComponent(songSlug as string);
      const response = await fetch(`/api/songs/slug/${encodedSlug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Song not found');
        }
        throw new Error(`Failed to fetch song: ${response.statusText}`);
      }

      const data = await response.json();
      const songsData = data.song ? [data.song] : null;

      if (songsData && songsData.length > 0) {
        const foundSong = songsData[0];
        const previousUpdatedAt = song?.updated_at;
        const newUpdatedAt = foundSong.updated_at;
        
        console.log('✅ Song loaded:', {
          id: foundSong.id,
          title: foundSong.title,
          artist: foundSong.artists?.name,
          hasLyrics: !!foundSong.lyrics,
          lyricsLength: foundSong.lyrics?.length || 0,
          updated_at: foundSong.updated_at,
          created_at: foundSong.created_at
        });
        
        setSong(foundSong);
        
        // Track if song was updated
        if (previousUpdatedAt && newUpdatedAt && previousUpdatedAt !== newUpdatedAt) {
          setLastUpdated(newUpdatedAt);
          console.log('🔄 Song was updated:', {
            previous: previousUpdatedAt,
            current: newUpdatedAt
          });
        } else if (!previousUpdatedAt) {
          setLastUpdated(foundSong.updated_at || foundSong.created_at);
        }
      } else {
        console.error('❌ Song not found for slug:', songSlug);
        setError(t('songDetail.notFound'));
      }
    } catch (err) {
      console.error('❌ Error fetching song:', err);
      setError(err instanceof Error ? err.message : 'Failed to load song');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (songSlug) {
      fetchSong();
    } else {
      setIsLoading(false);
      setError('No song specified');
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [songSlug, t]);

  // Listen for song update and deletion events from admin panel
  useEffect(() => {
    if (!song?.id) return;

    const handleSongUpdate = (event: CustomEvent) => {
      const detail = event.detail;
      // Check if this update is for the current song
      // Also refresh if artist was changed (affects all songs)
      if (detail.songId === song.id || detail.artistChanged) {
        console.log('🔄 Song update detected, refreshing...', {
          detail,
          currentSongId: song.id,
          matches: detail.songId === song.id
        });
        fetchSong(true);
        router.refresh();
      }
    };

    const handleSongDeleted = (event: CustomEvent) => {
      const detail = event.detail;
      // If this song was deleted, redirect to songs list
      if (detail.songId === song.id) {
        console.log('🗑️ Song deleted, redirecting to songs list...', {
          detail,
          currentSongId: song.id
        });
        router.push(getTranslatedRoute('/songs', language));
      }
    };

    // Listen for CustomEvent updates and deletions
    window.addEventListener('songUpdated', handleSongUpdate as EventListener);
    window.addEventListener('songDeleted', handleSongDeleted as EventListener);
    
    // Also check localStorage for cross-tab updates
    const checkLocalStorage = () => {
      try {
        // Check for song updates
        const updateData = localStorage.getItem('songUpdated');
        if (updateData) {
          const parsed = JSON.parse(updateData);
          // Only process recent updates (within last 30 seconds)
          if (Date.now() - parsed.timestamp < 30000) {
            if (parsed.songId === song.id || parsed.artistChanged) {
              if (parsed.action === 'deleted') {
                // Song was deleted, redirect
                router.push(getTranslatedRoute('/songs', language));
                localStorage.removeItem('songUpdated');
              } else {
                console.log('🔄 Cross-tab song update detected, refreshing...', {
                  parsed,
                  currentSongId: song.id
                });
                fetchSong(true);
                router.refresh();
                // Clear the update flag
                localStorage.removeItem('songUpdated');
              }
            }
          }
        }
        
        // Check for song deletions
        const deleteData = localStorage.getItem('songDeleted');
        if (deleteData) {
          const parsed = JSON.parse(deleteData);
          if (Date.now() - parsed.timestamp < 30000) {
            if (parsed.songId === song.id) {
              console.log('🗑️ Cross-tab song deletion detected, redirecting...', {
                parsed,
                currentSongId: song.id
              });
              router.push(getTranslatedRoute('/songs', language));
              localStorage.removeItem('songDeleted');
            }
          }
        }
      } catch (error) {
        // Ignore errors
      }
    };

    // Check localStorage on mount and periodically
    checkLocalStorage();
    const localStorageInterval = setInterval(checkLocalStorage, 2000);

    return () => {
      window.removeEventListener('songUpdated', handleSongUpdate as EventListener);
      window.removeEventListener('songDeleted', handleSongDeleted as EventListener);
      clearInterval(localStorageInterval);
    };
  }, [song?.id, router, language]);

  // Set up auto-refresh when song is loaded
  useEffect(() => {
    if (!song?.id) return;

    // Set up auto-refresh every 30 seconds to check for updates
    refreshIntervalRef.current = setInterval(() => {
      fetchSong(true);
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [song?.id, songSlug]);

  const handleManualRefresh = () => {
    fetchSong(true);
    router.refresh();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKeyColor = (key: string) => {
    const majorKeys = ['C', 'G', 'D', 'A', 'E', 'F'];
    const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'Dm'];
    
    if (majorKeys.some(k => key.includes(k))) return 'bg-blue-100 text-blue-800';
    if (minorKeys.some(k => key.includes(k))) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{t('songDetail.loading')}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!song && !isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('songDetail.notFound')}</h1>
            <p className="text-muted-foreground mb-4">{t('songDetail.slug')}: {songSlug}</p>
            {error && (
              <p className="text-red-500 mb-4">{t('songDetail.error')}: {error}</p>
            )}
            <Link href={getTranslatedRoute('/songs', language)}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('songDetail.backToSongs')}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen w-full">
        <div className="w-full px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href={getTranslatedRoute('/songs', language)}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('songDetail.backToSongs')}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-full">
            {/* Song Info - Moved to Top Left */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-3xl">{song.title}</CardTitle>
                      </div>
                      {song.english_title && (
                        <CardDescription className="text-lg">{song.english_title}</CardDescription>
                      )}
                      {/* Modification Info */}
                      {(song.updated_at || song.created_at) && (
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {song.updated_at && (
                            <div className="flex items-center gap-1">
                              <Edit className="h-3 w-3" />
                              <span>Updated {formatDate(song.updated_at)}</span>
                            </div>
                          )}
                          {song.created_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Created {formatDate(song.created_at)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFavorite(!isFavorite)}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('songDetail.artist')}</p>
                      <div className="flex items-center gap-2">
                        {song.artists?.image_url && (
                          <img 
                            src={song.artists.image_url} 
                            alt={song.artists.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        {song.artists?.id ? (
                          <Link 
                            href={`/artists/${song.artists.id}`}
                            className="text-lg font-semibold hover:underline flex items-center gap-1"
                          >
                            {song.artists.name}
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </Link>
                        ) : (
                          <p className="text-lg font-semibold">{song.artists?.name || song.artist || 'Unknown Artist'}</p>
                        )}
                      </div>
                      {song.artists?.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{song.artists.bio}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('songDetail.language')}</p>
                      <p className="text-lg">English</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('songDetail.difficulty')}</p>
                      <Badge className={getDifficultyColor(song.difficulty || 'Medium')}>
                        {song.difficulty === 'Easy' ? t('chord.easy') : 
                         song.difficulty === 'Medium' ? t('chord.medium') : 
                         song.difficulty === 'Hard' ? t('chord.hard') : 
                         song.difficulty || t('chord.medium')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('songDetail.key')}</p>
                      <Badge className={getKeyColor(song.key_signature || song.key || 'C')}>
                        {song.key_signature || song.key || 'C'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('songDetail.tempo')}</p>
                      <p className="text-lg">{song.tempo || song.bpm || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('songDetail.year')}</p>
                      <p className="text-lg">{song.year || 'N/A'}</p>
                    </div>
                  </div>

                  {song.album && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Album</p>
                      <p className="text-lg">{song.album}</p>
                    </div>
                  )}

                  {/* Show update notification if recently updated */}
                  {lastUpdated && song.updated_at === lastUpdated && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                        <Edit className="h-4 w-4" />
                        <span>This song was recently updated. Data is current.</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Lyrics & Chords */}
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="flex items-center">
                      <Guitar className="h-5 w-5 mr-2" />
                      {t('songDetail.lyrics')} & {t('songDetail.chords')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {song.key_signature && (
                        <Badge variant="outline" className="text-sm">
                          {t('songDetail.key')}: {transposeKey || song.key_signature}
                        </Badge>
                      )}
                      <Select
                        value={transposeKey || song.key_signature || 'C'}
                        onValueChange={(newKey) => {
                          const originalKey = song.key_signature || 'C';
                          if (newKey === originalKey) {
                            // Reset to original
                            setTransposeKey(null);
                            setTransposedLyrics(null);
                            // Chords already show original, no need to reset
                          } else {
                            // Transpose to new key
                            setTransposeKey(newKey);
                            transposeChordsInLyrics(newKey);
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select key" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={song.key_signature || 'C'}>Original ({song.key_signature || 'C'})</SelectItem>
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardDescription>
                    {t('songDetail.followAlong')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                  {song.lyrics && song.lyrics.trim().length > 0 ? (
                    <div className="space-y-6">
                      {/* Render lyrics with proper formatting */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 w-full">
                        <div 
                          className="font-mono text-base leading-loose whitespace-pre-wrap prose prose-sm max-w-none w-full"
                          dangerouslySetInnerHTML={{ __html: transposedLyrics || song.lyrics }}
                          onClick={(e) => {
                            // Handle chord clicks from HTML content
                            const target = e.target as HTMLElement;
                            const chordElement = target.closest('.chord');
                            
                            if (chordElement) {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Extract chord name from the element
                              const chordText = chordElement.textContent || '';
                              const chordName = chordText.replace(/\[|\]/g, '').trim();
                              
                              if (chordName) {
                                const rect = chordElement.getBoundingClientRect();
                                setSelectedChord({
                                  name: chordName,
                                  position: {
                                    x: rect.left + rect.width / 2,
                                    y: rect.bottom + 10
                                  }
                                });
                              }
                            }
                          }}
                          style={{
                            // Ensure chords are styled and clickable
                          }}
                        />
                      </div>
                      
                      {/* Legacy rendering for plain text (fallback) */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hidden">
                        <div className="font-mono text-base leading-loose whitespace-pre-wrap">
                          {song.lyrics.split('\n').map((line: string, index: number) => {
                            // Check if line is a section header (e.g., [Verse 1], [Chorus])
                            const isSectionHeader = line.trim().match(/^\[.*\]$/);
                            // Check if line contains chords (typically uppercase letters and symbols)
                            const isChordLine = line.trim().match(/^[A-G#b/\s]+$/) && line.trim().length > 0 && !isSectionHeader;
                            
                            if (isSectionHeader) {
                              return (
                                <div key={index} className="mt-6 mb-3 first:mt-0">
                                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-md font-semibold text-sm">
                                    {line.trim().replace(/[\[\]]/g, '')}
                                  </span>
                                </div>
                              );
                            } else if (isChordLine) {
                              // Parse chord names from the line
                              const chordPattern = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13)?(?:\/[A-G][#b]?)?)/gi;
                              const chords: string[] = [];
                              const parts: Array<{ text: string; isChord: boolean }> = [];
                              let lastIndex = 0;
                              let match;
                              
                              while ((match = chordPattern.exec(line)) !== null) {
                                // Add text before chord
                                if (match.index > lastIndex) {
                                  parts.push({ text: line.substring(lastIndex, match.index), isChord: false });
                                }
                                // Add chord
                                const chordName = match[0];
                                chords.push(chordName);
                                parts.push({ text: chordName, isChord: true });
                                lastIndex = match.index + match[0].length;
                              }
                              
                              // Add remaining text
                              if (lastIndex < line.length) {
                                parts.push({ text: line.substring(lastIndex), isChord: false });
                              }
                              
                              return (
                                <div 
                                  key={index} 
                                  className="text-blue-600 dark:text-blue-400 font-bold tracking-wide cursor-default"
                                  onClick={(e) => {
                                    // Handle chord click
                                    const target = e.target as HTMLElement;
                                    if (target.classList.contains('chord-clickable')) {
                                      const chordName = target.textContent?.trim() || '';
                                      const rect = target.getBoundingClientRect();
                                      setSelectedChord({
                                        name: chordName,
                                        position: {
                                          x: rect.left + rect.width / 2,
                                          y: rect.bottom + 10
                                        }
                                      });
                                    }
                                  }}
                                >
                                  {parts.length > 0 ? (
                                    parts.map((part, partIndex) => (
                                      part.isChord ? (
                                        <span
                                          key={partIndex}
                                          className="chord-clickable hover:bg-blue-100 dark:hover:bg-blue-900 px-1 rounded cursor-pointer transition-colors"
                                          title={`Click to view ${part.text} piano chord`}
                                        >
                                          {part.text}
                                        </span>
                                      ) : (
                                        <span key={partIndex}>{part.text}</span>
                                      )
                                    ))
                                  ) : (
                                    line
                                  )}
                                </div>
                              );
                            } else if (line.trim() === '') {
                              return <div key={index} className="h-4" />;
                            } else {
                              return (
                                <div key={index} className="text-slate-700 dark:text-slate-300">
                                  {line}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                      
                      {/* End legacy rendering */}

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t">
                        {song.tempo && (
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {t('songDetail.tempo')}: <span className="font-semibold text-foreground">{song.tempo} BPM</span>
                            </span>
                          </div>
                        )}
                        {song.key_signature && (
                          <div className="flex items-center gap-2">
                            <Piano className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {t('songDetail.key')}: <span className="font-semibold text-foreground">{song.key_signature}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                      <Guitar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">
                        {t('songDetail.noLyrics')}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('songDetail.adminNeedsToAdd')}
                      </p>
                      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <Music className="h-3 w-3" />
                        <span>{t('songDetail.adminDashboard')}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Piano Chord Tooltip */}
                  {selectedChord && (
                    <PianoChordTooltip
                      chordName={selectedChord.name}
                      position={selectedChord.position}
                      onClose={() => setSelectedChord(null)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chord Preview Panel - Right Side */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Piano className="h-5 w-5" />
                    {t('songDetail.chords')} Preview
                  </CardTitle>
                  <CardDescription>
                    Root Chords ({song.key_signature || 'C'})
                    {transposeKey && ` • Song transposed to ${transposeKey}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uniqueChords.size > 0 ? (
                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                      {Array.from(uniqueChords).sort((a, b) => {
                        // Sort chords in musical order
                        const musicalOrder = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
                        const aRoot = a.match(/^([A-G][#b]?)/)?.[1] || '';
                        const bRoot = b.match(/^([A-G][#b]?)/)?.[1] || '';
                        const aIndex = musicalOrder.indexOf(aRoot);
                        const bIndex = musicalOrder.indexOf(bRoot);
                        if (aIndex !== -1 && bIndex !== -1) {
                          if (aIndex !== bIndex) return aIndex - bIndex;
                        }
                        return a.localeCompare(b);
                      }).map((chordName) => (
                        <ChordPreviewItem key={chordName} chordName={chordName} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Piano className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No chords found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SongDetailsPage;