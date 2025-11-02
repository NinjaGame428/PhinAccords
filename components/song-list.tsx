"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, User, ExternalLink, Grid3X3, List, Heart, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";
import { ViewToggle } from "@/components/view-toggle";

interface Song {
  id: string | number;
  title: string;
  artist: string;
  key: string;
  difficulty: string;
  category: string;
  slug?: string;
  year?: string | number;
}

const SongList = () => {
  const { t, language } = useLanguage();
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch 12 songs from API
  useEffect(() => {
    async function fetchSongs() {
      console.log('🏠 Fetching songs for home page...');

      try {
        setIsLoading(true);
        // Add timestamp to ensure fresh data
        const timestamp = Date.now();
        const response = await fetch(`/api/songs?limit=12&_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error fetching songs:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          setIsLoading(false);
          setPopularSongs([]);
          return;
        }

        const data = await response.json();
        const songsData = data.songs || [];
        
        console.log('📊 Raw API response:', {
          hasData: !!data,
          hasSongs: !!data.songs,
          songsCount: songsData.length,
          firstSong: songsData[0]
        });

        console.log('📊 Home page API response:', {
          totalSongs: songsData.length,
          sampleSong: songsData[0],
          pagination: data.pagination
        });

        if (songsData && songsData.length > 0) {
          const formattedSongs: Song[] = songsData
            .filter((song: any) => {
              // Only filter out songs that are completely invalid (no title)
              if (!song || !song.title) {
                console.warn('⚠️ Skipping song without title:', song);
                return false;
              }
              return true;
            })
            .map((song: any) => {
              // Extract artist name from various possible structures
              // Prioritize actual artist names, avoid "Unknown Artist" when possible
              let artistName = null;
              
              if (song.artists) {
                // Handle different artist object structures
                if (typeof song.artists === 'string' && song.artists.trim() !== '') {
                  artistName = song.artists.trim();
                } else if (song.artists.name && song.artists.name.trim() !== '' && song.artists.name !== 'Unknown Artist') {
                  artistName = song.artists.name.trim();
                } else if (Array.isArray(song.artists) && song.artists.length > 0 && song.artists[0]?.name) {
                  artistName = song.artists[0].name.trim();
                }
              }
              
              // Fallback to song.artist field if artists object doesn't have valid name
              if (!artistName && song.artist) {
                if (typeof song.artist === 'string' && song.artist.trim() !== '' && song.artist !== 'Unknown Artist') {
                  artistName = song.artist.trim();
                } else if (song.artist.name && song.artist.name.trim() !== '' && song.artist.name !== 'Unknown Artist') {
                  artistName = song.artist.name.trim();
                }
              }
              
              // Try to extract from title if no artist found (format: "Artist - Song Title")
              if (!artistName && song.title) {
                const titleParts = song.title.split(' - ');
                if (titleParts.length > 1 && titleParts[0]?.trim()) {
                  artistName = titleParts[0].trim();
                }
              }
              
              // Only use "Unknown Artist" as absolute last resort
              if (!artistName) {
                artistName = 'Unknown Artist';
              }
              
              return {
                id: song.id,
                title: song.title,
                artist: artistName,
                key: song.key_signature || song.key || 'C',
                difficulty: song.difficulty || 'Medium',
                category: song.genre || song.category || 'Gospel',
                slug: song.slug || song.id,
                year: song.year || (song.created_at ? new Date(song.created_at).getFullYear() : new Date().getFullYear()),
                // Include updated_at for tracking changes
                updated_at: song.updated_at,
              };
            });

          console.log(`✅ Loaded ${formattedSongs.length} songs for home page`, {
            total: formattedSongs.length,
            sample: formattedSongs[0],
            songsWithArtist: formattedSongs.filter(s => s.artist !== 'Unknown Artist').length,
            lastUpdated: formattedSongs[0]?.updated_at
          });
          
          if (formattedSongs.length > 0) {
            // Only update state if songs actually changed (prevents unnecessary re-renders)
            setPopularSongs(prevSongs => {
              const hasChanged = prevSongs.length !== formattedSongs.length ||
                prevSongs.some((prevSong, index) => {
                  const newSong = formattedSongs[index];
                  return !newSong || 
                    prevSong.id !== newSong.id ||
                    prevSong.title !== newSong.title ||
                    prevSong.artist !== newSong.artist ||
                    prevSong.key !== newSong.key ||
                    (prevSong.updated_at !== newSong.updated_at);
                });
              
              if (hasChanged) {
                console.log('🔄 Songs updated - refreshing display');
                return formattedSongs;
              }
              return prevSongs;
            });
          } else {
            console.warn('⚠️ All songs were filtered out');
            setPopularSongs([]);
          }
        } else {
          console.warn('⚠️ No songs in API response:', data);
          setPopularSongs([]);
        }
      } catch (error) {
        console.error('❌ Error fetching songs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSongs();
    
    // Set up periodic refresh to check for updates (every 30 seconds when page is visible)
    const refreshInterval = setInterval(() => {
      // Only refresh if page is visible
      if (!document.hidden) {
        fetchSongs();
      }
    }, 30000); // 30 seconds
    
    // Also listen for focus events to refresh when user returns to the page
    const handleFocus = () => {
      fetchSongs();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [language]); // Re-fetch if language changes, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (popularSongs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{t('songs.noSongsFound')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with count and view toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {popularSongs.length} {t('songs.songsFound')}
        </div>
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popularSongs.map((song) => {
            const songSlug = song.slug || song.id;
            const songUrl = getTranslatedRoute(`/songs/${songSlug}`, language);

            return (
              <Card key={song.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold mb-2 line-clamp-2 leading-tight">
                        {song.title}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{song.artist}</span>
                      </div>
                      {song.year && (
                        <div className="text-xs text-muted-foreground mb-2">
                          {song.year}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        {song.key}
                      </Badge>
                      <Heart className="h-4 w-4 text-muted-foreground mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        className={`text-xs ${getDifficultyColor(song.difficulty)}`}
                      >
                        {song.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {song.category}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="h-8 text-xs"
                    >
                      <Link href={songUrl}>
                        <BookOpen className="h-3 w-3 mr-1.5" />
                        {t('song.viewChords')}
                        <ExternalLink className="h-3 w-3 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {popularSongs.map((song) => {
            const songSlug = song.slug || song.id;
            const songUrl = getTranslatedRoute(`/songs/${songSlug}`, language);

            return (
              <Card key={song.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1 line-clamp-1">
                            {song.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>{song.artist}</span>
                            {song.year && (
                              <>
                                <span>•</span>
                                <span>{song.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap mt-2">
                        <Badge variant="outline" className="text-xs">
                          {song.key}
                        </Badge>
                        <Badge
                          className={`text-xs ${getDifficultyColor(song.difficulty)}`}
                        >
                          {song.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {song.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-8"
                      >
                        <Link href={songUrl}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          {t('song.viewChords')}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SongList;
