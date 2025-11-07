"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Music, Calendar, MapPin, ArrowLeft, Search, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";

interface Artist {
  id: string;
  name: string;
  bio?: string;
  image_url?: string;
  website?: string;
}

interface Song {
  id: string;
  title: string;
  key_signature?: string;
  tempo?: number;
  year?: number;
  genre?: string;
  difficulty?: string;
  slug?: string;
}

const ArtistDetailPage = () => {
  const params = useParams();
  const artistId = params.id as string;
  const { t, language } = useLanguage();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/artists/${artistId}`);
        
        if (!response.ok) {
          console.error('❌ Error fetching artist');
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (data.artist) {
          const cleanName = data.artist.name?.replace(/\s*Artist from YouTube channel\s*/i, '').trim() || data.artist.name;
          setArtist({ ...data.artist, name: cleanName });
        }
      } catch (error) {
        console.error('❌ Exception while fetching artist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSongs = async () => {
      if (!artistId) {
        setIsLoadingSongs(false);
        return;
      }

      try {
        setIsLoadingSongs(true);
        const response = await fetch('/api/songs?limit=1000');
        
        if (!response.ok) {
          setIsLoadingSongs(false);
          return;
        }

        const data = await response.json();
        const songsData = data.songs?.filter((song: any) => song.artist_id === artistId) || [];

        if (!songsData) {
          console.error('❌ Error fetching songs');
          setIsLoadingSongs(false);
          return;
        }

        if (songsData && songsData.length > 0) {
          const formattedSongs: Song[] = songsData.map((song: any) => ({
            id: song.id,
            title: song.title,
            key_signature: song.key_signature || 'C',
            tempo: song.tempo || 120,
            year: song.created_at ? new Date(song.created_at).getFullYear() : new Date().getFullYear(),
            genre: song.genre || 'Gospel',
            difficulty: 'Medium', // Default difficulty, can be enhanced later
            slug: song.slug || song.id,
          }));
          setSongs(formattedSongs);
        }
      } catch (error) {
        console.error('❌ Exception while fetching songs:', error);
      } finally {
        setIsLoadingSongs(false);
      }
    };

    fetchArtist();
    fetchSongs();
    
    // Listen for song updates and deletions and refresh the songs list
    const handleSongUpdate = (event: any) => {
      console.log('🔄 Song updated, refreshing songs list...', event?.detail);
      const detail = event?.detail;
      
      // If song was deleted and belongs to this artist, refresh immediately
      if (detail?.action === 'deleted' && detail?.artistId === artistId) {
        console.log('🗑️ Song deleted from this artist, refreshing...');
        fetchSongs();
        return;
      }
      
      // If artist was changed, check if it affects this artist page
      if (detail?.action === 'artistChanged') {
        // Refresh if the song moved to or from this artist
        const newArtistId = detail.artistId || detail.newArtistId;
        const oldArtistId = detail.oldArtistId;
        if (newArtistId === artistId || oldArtistId === artistId) {
          console.log('🎨 Artist changed - song moved to/from this artist, refreshing...');
          fetchSongs();
        }
      } else if (detail?.artistId === artistId) {
        // Song was updated for this artist
        fetchSongs();
      }
    };
    
    const handleSongDeleted = (event: any) => {
      const detail = event?.detail;
      // If a song from this artist was deleted, refresh the list
      if (detail?.artistId === artistId) {
        console.log('🗑️ Song deleted from this artist, refreshing...', detail);
        fetchSongs();
      }
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'songUpdated' || e.key === 'songDeleted') {
        try {
          const updateData = JSON.parse(e.newValue || '{}');
          
          // If song was deleted and belongs to this artist, refresh
          if (updateData.action === 'deleted' && updateData.artistId === artistId) {
            fetchSongs();
            return;
          }
          
          // Refresh if this update affects the current artist
          if (updateData.action === 'artistChanged') {
            // Check if song moved to or from this artist
            if (updateData.artistId === artistId || updateData.oldArtistId === artistId) {
              fetchSongs();
            }
          } else if (!updateData.artistId || updateData.artistId === artistId) {
            fetchSongs();
          }
        } catch (err) {
          console.error('Error parsing song update data:', err);
        }
      }
    };
    
    window.addEventListener('songUpdated', handleSongUpdate);
    window.addEventListener('songDeleted', handleSongDeleted);
    window.addEventListener('storage', handleStorageChange);
    
    // Refresh on window focus
    const handleFocus = () => {
      fetchSongs();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('songUpdated', handleSongUpdate);
      window.removeEventListener('songDeleted', handleSongDeleted);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [artistId]);

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (song.key_signature && song.key_signature.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
          <div className="py-20 px-6 text-center">
            <p className="text-muted-foreground">{t('artists.loading')}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Navbar />
        <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
          <div className="py-20 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">{t('artists.artistNotFound')}</h1>
            <p className="text-muted-foreground mb-8">{t('artists.artistNotFoundDesc')}</p>
            <Button asChild className="rounded-full">
              <Link href={getTranslatedRoute('/artists', language)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('artists.backToArtists')}
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24 min-h-screen">
        {/* Artist Header */}
        <section className="py-20 px-6 bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-8">
              <Button variant="outline" asChild className="rounded-full">
                <Link href={getTranslatedRoute('/artists', language)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('artists.backToArtists')}
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-2">
                <h1 className="text-4xl xs:text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                  {artist.name}
                </h1>
                {artist.bio && (
                  <p className="text-lg text-muted-foreground mb-6">
                    {artist.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {t('artists.songsCount')}: {songs.length}
                  </Badge>
                  {artist.website && (
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <a 
                        href={artist.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        {t('common.website')}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                {artist.image_url ? (
                  <div className="w-48 h-48 rounded-full overflow-hidden mx-auto lg:mx-0 mb-6">
                    <img 
                      src={artist.image_url} 
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                    <Music className="h-24 w-24 text-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Songs Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl xs:text-4xl font-bold tracking-tight mb-4">
                {t('artists.songsBy')} {artist.name}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('artists.exploreSongs')}
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder={t('artists.searchSongs')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {isLoadingSongs ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('artists.loadingSongs')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSongs.map((song) => (
                    <Card key={song.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {song.title}
                            </CardTitle>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <Music className="h-4 w-4 mr-1" />
                              {song.year} • {song.tempo} {t('common.bpm')}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {song.key_signature}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className={getDifficultyColor(song.difficulty || 'Medium')}>
                              {getDifficultyText(song.difficulty || 'Medium')}
                            </Badge>
                            {song.genre && (
                              <span className="text-xs text-muted-foreground">
                                {song.genre}
                              </span>
                            )}
                          </div>
                          
                          <Button 
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            variant="outline"
                            asChild
                          >
                            <Link href={getTranslatedRoute(`/songs/${song.slug}`, language)}>
                              <Music className="mr-2 h-4 w-4" />
                              {t('artists.viewFullSong')}
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredSongs.length === 0 && (
                  <div className="text-center py-12">
                    <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">{t('artists.noSongsFound')}</h3>
                    <p className="text-muted-foreground">
                      {t('artists.tryAdjustingSearch')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ArtistDetailPage;
