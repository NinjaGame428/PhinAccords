"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";

interface Song {
  id: string | number;
  title: string;
  artist: string;
  key: string;
  difficulty: string;
  category: string;
  slug?: string;
}

const SongList = () => {
  const { t, language } = useLanguage();
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch 12 songs from API
  useEffect(() => {
    async function fetchSongs() {
      console.log('🏠 Fetching songs for home page...');

      try {
        setIsLoading(true);
        const response = await fetch('/api/songs?limit=12', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
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
            .map((song: any) => ({
              id: song.id,
              title: song.title,
              artist: song.artists?.name || song.artist || 'Unknown Artist',
              key: song.key_signature || 'C',
              difficulty: 'Medium',
              category: song.genre || 'Gospel',
              slug: song.slug || song.id,
            }));

          console.log(`✅ Loaded ${formattedSongs.length} songs for home page`, {
            sample: formattedSongs[0]
          });
          setPopularSongs(formattedSongs);
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
  }, []);

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {popularSongs.map((song) => {
        const songSlug = song.slug || song.id;
        const songUrl = getTranslatedRoute(`/songs/${songSlug}`, language);

        return (
          <Card key={song.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {song.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="line-clamp-1">{song.artist}</span>
                  </div>
                </div>
                <Music className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
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
                <Link href={songUrl}>
                  <Button variant="ghost" size="sm" className="h-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SongList;
