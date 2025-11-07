"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Music, 
  Clock,
  Search,
  Filter
} from "lucide-react";
import { fetchFavoriteSongs, type FavoriteSong } from "@/lib/user-stats";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadFavoriteSongs();
    }
  }, [user]);

  const loadFavoriteSongs = async () => {
    if (!user) return;
    
    try {
      setIsLoadingData(true);
      const favorites = await fetchFavoriteSongs(user.id);
      setFavoriteSongs(favorites);
    } catch (error) {
      console.error('Error loading favorite songs:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const filteredSongs = favoriteSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.yourFavorites')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.songsSavedForAccess')}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={t('dashboard.searchFavorites')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('common.filter')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{favoriteSongs.length}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalFavorites')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(favoriteSongs.map(song => song.genre)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.genres')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {favoriteSongs.filter(song => {
                        const songDate = new Date(song.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return songDate > weekAgo;
                      }).length}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.addedThisWeek')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Songs List */}
          {isLoadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t('dashboard.loadingFavorites')}</p>
            </div>
          ) : filteredSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSongs.map((song) => (
                <Card key={song.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{song.title}</CardTitle>
                        <CardDescription className="mt-1">{song.artist}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{song.genre}</Badge>
                        <Badge variant="outline">{song.key_signature}</Badge>
                      </div>
                        <p className="text-sm text-muted-foreground">
                        {t('dashboard.added')} {new Date(song.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">
                          {t('dashboard.viewChords')}
                        </Button>
                        <Button size="sm" variant="outline">
                          {t('dashboard.play')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.noFavoritesYet')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.startExploringSongs')}
                </p>
                <Button onClick={() => router.push("/songs")}>
                  {t('dashboard.browseSongs')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}