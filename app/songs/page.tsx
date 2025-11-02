"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, User, ExternalLink, Filter, BookOpen, Zap, Star, Heart, Play } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import EnhancedSearch from "@/components/enhanced-search";
import LazyLoad from "@/components/lazy-load";
import { ViewToggle } from "@/components/view-toggle";
import Link from "next/link";
import { Song } from "@/lib/song-data";
import { getTranslatedRoute } from "@/lib/url-translations";
import { useState, useEffect, useMemo } from "react";

const SongsPage = () => {
  const { t, language } = useLanguage();
  const { addSongToFavorites, removeSongFromFavorites, isSongFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t('songs.allCategories'));
  
  // Update selectedCategory when language changes
  useEffect(() => {
    setSelectedCategory(t('songs.allCategories'));
  }, [language, t]);
  const [displayedSongs, setDisplayedSongs] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [highlightedSong, setHighlightedSong] = useState<string | null>(null);
  const [supabaseSongs, setSupabaseSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch songs from API with pagination and caching
  useEffect(() => {
    async function fetchSongs() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/songs?limit=1000');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error fetching songs:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const songsData = data.songs || [];

        console.log('📊 Songs API Response:', {
          totalSongs: songsData.length,
          sampleSong: songsData[0],
          pagination: data.pagination,
          message: data.message
        });

        if (!songsData || songsData.length === 0) {
          console.warn('⚠️ No songs found in response. Check database and RLS policies.');
          setSupabaseSongs([]);
          setIsLoading(false);
          return;
        }

        if (songsData && songsData.length > 0) {
          const formattedSongs: Song[] = songsData
            .filter((song: any) => {
              // Include songs that have either artist name or artist text field
              // Allow songs with "Unknown" artist as well
              const hasArtist = song.artists?.name || song.artist;
              const artistName = song.artists?.name || song.artist || '';
              // Only filter out if artist is completely missing, not if it's "Unknown"
              if (!hasArtist) {
                console.warn('⚠️ Song without artist:', song.title, song.id);
                return false;
              }
              return true;
            })
            .map((song: any) => ({
              id: song.id,
              title: song.title,
              artist: song.artists?.name || song.artist || 'Unknown Artist',
              key: song.key_signature || 'C',
            difficulty: 'Medium',
            category: 'Gospel',
            year: new Date(song.created_at).getFullYear().toString(),
            tempo: song.tempo ? `${song.tempo} BPM` : '120 BPM',
            timeSignature: '4/4',
            genre: 'Gospel',
            chords: [],
            chordProgression: '',
            lyrics: '',
            chordChart: '',
            capo: '',
            strummingPattern: '',
            tags: [],
            downloads: song.downloads || 0,
            rating: song.rating || 0,
            description: '',
            slug: song.slug || song.id,
            language: 'en',
            captions_available: false
          }));

          setSupabaseSongs(formattedSongs);
        }
      } catch (error) {
        console.error('❌ Exception while fetching songs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSongs();
  }, []);

  // Use memoized songs to prevent unnecessary re-renders
  const allSongs: Song[] = useMemo(() => supabaseSongs, [supabaseSongs]);

  const categories = [
    { name: t('songs.allCategories'), icon: Music, key: 'all' },
    { name: t('songs.classicHymn'), icon: BookOpen, key: 'classic' },
    { name: t('songs.contemporary'), icon: Zap, key: 'contemporary' },
    { name: t('songs.modernHymn'), icon: Star, key: 'modern' }
  ];

  // Handle URL parameters for highlighting songs
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlight = urlParams.get('highlight');
    if (highlight) {
      setHighlightedSong(highlight);
      // Scroll to the highlighted song after a short delay
      setTimeout(() => {
        const element = document.getElementById(`song-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }
      }, 500);
    }
  }, []);

  // Initialize selectedCategory based on language
  useEffect(() => {
    setSelectedCategory(t('songs.allCategories'));
  }, [language, t]);

  // Optimized: Use useMemo for filtering to prevent unnecessary recalculations
  const filteredSongs = useMemo(() => {
    let filtered = [...allSongs];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.key.toLowerCase().includes(query)
      );
    }

    // Filter by category (map translated names back to English)
    const categoryMap: { [key: string]: string } = {
      [t('songs.allCategories')]: 'all',
      [t('songs.classicHymn')]: 'Classic Hymn',
      [t('songs.contemporary')]: 'Contemporary',
      [t('songs.modernHymn')]: 'Modern Hymn',
      // Legacy support
      'All Songs': 'all',
      'Classic Hymn': 'Classic Hymn',
      'Contemporary': 'Contemporary',
      'Modern Hymn': 'Modern Hymn',
    };
    
    const mappedCategory = categoryMap[selectedCategory] || selectedCategory;
    if (mappedCategory !== 'all' && mappedCategory !== t('songs.allCategories')) {
      filtered = filtered.filter(song => song.category === mappedCategory || song.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory, allSongs, t]);

  // Reset displayed songs when filters change
  useEffect(() => {
    setDisplayedSongs(12);
  }, [searchQuery, selectedCategory]);

  const handleLoadMore = () => {
    setDisplayedSongs(prev => Math.min(prev + 12, filteredSongs.length));
  };

  const handleToggleFavorite = (song: any) => {
    if (isSongFavorite(song.id)) {
      removeSongFromFavorites(song.id);
    } else {
      addSongToFavorites({
        id: song.id,
        title: song.title,
        artist: song.artist,
        key: song.key,
        difficulty: song.difficulty,
        category: song.category
      });
    }
  };

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

  const getDifficultyText = (difficulty: string) => {
    if (difficulty === 'Easy') return t('chord.easy');
    if (difficulty === 'Medium') return t('chord.medium');
    if (difficulty === 'Hard') return t('chord.hard');
    return difficulty;
  };

  // Memoize visible songs to prevent unnecessary recalculations
  const visibleSongs = useMemo(() => filteredSongs.slice(0, displayedSongs), [filteredSongs, displayedSongs]);
  const hasMoreSongs = displayedSongs < filteredSongs.length;

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-6 bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              {t('songs.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              {t('songs.subtitle')}
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <EnhancedSearch
                placeholder={t('songs.searchPlaceholder')}
                onSearch={(query) => setSearchQuery(query)}
                onResultSelect={(result) => {
                  // Navigate to the selected song using ID (fastest and most reliable)
                  window.location.href = getTranslatedRoute(`/songs/${result.id}`, language);
                }}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.key || category.name}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Songs Display */}
        <section className="pt-12 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl xs:text-4xl font-bold tracking-tight mb-4">
                {searchQuery || selectedCategory !== t('songs.allCategories') 
                  ? `${t('songs.searchResults')} (${filteredSongs.length} ${t('songs.songsFound')})` 
                  : t('songs.allSongs')
                }
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {t('songs.browseCollection')}
              </p>
              {!isLoading && supabaseSongs.length > 0 && (
                <div className="flex justify-center gap-3 flex-wrap">
                  <Badge variant="default" className="text-sm">
                    🎵 {allSongs.length} {t('songs.songsAvailable')}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    📀 {t('songs.fromDatabase')}
                  </Badge>
                </div>
              )}
            </div>

            {/* View Toggle and Controls */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {filteredSongs.length} {t('songs.songsFound')}
                </span>
              </div>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">{t('songs.loading')}</h3>
                <p className="text-muted-foreground">
                  {t('songs.fetching')}
                </p>
              </div>
            ) : visibleSongs.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleSongs.map((song) => (
                      <LazyLoad key={song.id}>
                        <Card 
                            id={`song-${song.id}`}
                            className={`group hover:shadow-lg transition-all duration-300 ${
                              highlightedSong === song.id.toString() ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                            }`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    {song.title}
                                  </CardTitle>
                                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                    <User className="h-4 w-4 mr-1" />
                                    {song.artist}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {song.year}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge variant="outline" className="ml-2">
                                    {song.key}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => handleToggleFavorite(song)}
                                  >
                                    <Heart className={`h-4 w-4 ${isSongFavorite(song.id) ? 'fill-current text-red-500' : ''}`} />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between mb-4">
                                <Badge className={getDifficultyColor(song.difficulty)}>
                                  {getDifficultyText(song.difficulty)}
                                </Badge>
                                <Badge variant="secondary">
                                  {song.category}
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <Button 
                                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                  variant="outline"
                                  asChild
                                >
                                   <Link href={getTranslatedRoute(`/songs/${song.id}`, language)}>
                                    <Music className="mr-2 h-4 w-4" />
                                    {t('song.viewChords')}
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                      </LazyLoad>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleSongs.map((song) => (
                      <LazyLoad key={song.id}>
                        <Card 
                          id={`song-${song.id}`}
                          className={`hover:shadow-md transition-shadow ${
                            highlightedSong === song.id.toString() ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <h3 className="font-semibold text-lg">{song.title}</h3>
                                  {song.artist && (
                                    <span className="text-muted-foreground">by {song.artist}</span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center space-x-1">
                                    <span className="font-medium">Artist:</span>
                                    {song.artist ? <span>{song.artist}</span> : null}
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <span className="font-medium">Language:</span>
                                    <span>{song.language || 'en'}</span>
                                  </span>
                                  <Badge variant="secondary">
                                    {getDifficultyText(song.difficulty)}
                                  </Badge>
                                  <Badge variant="outline">
                                    {song.key}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    <span className="font-medium">Chords:</span>
                                    <div className="flex space-x-1">
                                      {song.chords.slice(0, 4).map((chord: string, index: number) => (
                                        <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                                          {chord}
                                        </span>
                                      ))}
                                      {song.chords.length > 4 && (
                                        <span className="text-xs bg-muted px-2 py-1 rounded">
                                          +{song.chords.length - 4}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                >
                                  <Link href={getTranslatedRoute(`/songs/${song.id}`, language)}>
                                    <Music className="h-4 w-4 mr-2" />
                                    {t('song.viewChords')}
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleFavorite(song)}
                                >
                                  <Heart className={`h-4 w-4 ${isSongFavorite(song.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                                {song.url && (
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(song.url, '_blank')}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Play
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </LazyLoad>
                    ))}
                  </div>
                )}

                {hasMoreSongs && (
                  <div className="text-center mt-12">
                    <Button 
                      size="lg" 
                      className="rounded-full"
                      onClick={handleLoadMore}
                    >
                      {t('songs.loadMore')} ({filteredSongs.length - displayedSongs} {t('songs.remaining')})
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </>
            ) : supabaseSongs.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t('songs.noSongs')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('songs.adminNeedsToAdd')}
                </p>
                <Link href={getTranslatedRoute('/admin/songs', language)}>
                  <Button variant="outline" className="rounded-full">
                    {t('nav.admin')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t('songs.noSongsFound')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('songs.tryAdjusting')}
                </p>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(t('songs.allCategories'));
                  }}
                >
                  {t('songs.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SongsPage;