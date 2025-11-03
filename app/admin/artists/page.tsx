'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Users, 
  Search,
  Plus,
  Edit,
  Trash2,
  Music,
  TrendingUp,
  Star,
  Grid3x3,
  List,
  Loader2,
  Image as ImageIcon,
  Globe,
  MapPin,
  Calendar
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface Artist {
  id: string;
  name: string;
  bio?: string;
  image_url?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  song_count?: number;
}

const ArtistsPage = () => {
  const { t } = useLanguage();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form state
  const [artistForm, setArtistForm] = useState({
    name: '',
    bio: '',
    image_url: '',
    website: '',
  });

  // Fetch artists with song counts
  const fetchArtists = async () => {
    try {
      setLoading(true);
      
      // Fetch artists from API with cache busting
      const timestamp = Date.now();
      const response = await fetch(`/api/artists?_t=${timestamp}`);
      
      if (!response.ok) {
        console.error('Error fetching artists');
        setArtists([]);
        return;
      }

      const data = await response.json();
      const artistsData = data.artists || [];

      if (!artistsData || artistsData.length === 0) {
        setArtists([]);
        return;
      }

      // Fetch songs to count
      const songsResponse = await fetch('/api/songs?limit=1000');
      const songsData = songsResponse.ok ? (await songsResponse.json()).songs || [] : [];

      // Create a map of artist_id -> count
      const countMap = new Map<string, number>();
      songsData.forEach((song: any) => {
        if (song.artist_id) {
          const artistId = song.artist_id;
          countMap.set(artistId, (countMap.get(artistId) || 0) + 1);
        }
      });

      // Map artists with their counts
      const artistsWithCounts = artistsData.map((artist: any) => ({
        ...artist,
        song_count: countMap.get(artist.id) || 0,
      }));

      setArtists(artistsWithCounts);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
    
    // Listen for song updates and deletions to refresh artist counts
    const handleSongUpdate = (event: any) => {
      console.log('🔄 Song updated, refreshing artist counts...', event.detail);
      const detail = event.detail;
      
      // If song was deleted, refresh immediately to update counts
      if (detail?.action === 'deleted') {
        console.log('🗑️ Song deleted - refreshing artist counts...', detail);
        setTimeout(() => fetchArtists(), 100);
        return;
      }
      
      // If artist was changed, refresh immediately
      if (detail?.action === 'artistChanged' || detail?.artistChanged) {
        console.log('🎨 Artist changed - refreshing counts for both old and new artists', {
          oldArtistId: detail?.oldArtistId,
          newArtistId: detail?.artistId || detail?.newArtistId
        });
        // Force immediate refresh when artist changes
        setTimeout(() => fetchArtists(), 100);
      } else {
        fetchArtists();
      }
    };
    
    const handleSongDeleted = (event: any) => {
      console.log('🗑️ Song deleted event received, refreshing artist counts...', event.detail);
      setTimeout(() => fetchArtists(), 100);
    };
    
    // Also listen for artistSongCountChanged event
    const handleArtistSongCountChanged = (event: any) => {
      console.log('🎨 Artist song count changed event received:', event.detail);
      setTimeout(() => fetchArtists(), 100);
    };
    
    const handleArtistUpdate = () => {
      console.log('🔄 Artist updated, refreshing...');
      fetchArtists();
    };
    
    // Listen for artist creation events
    const handleArtistCreated = (event: any) => {
      console.log('🎨 Artist created event received, refreshing...', event?.detail);
      setTimeout(() => fetchArtists(), 100);
    };
    
    window.addEventListener('artistCreated', handleArtistCreated);
    
    // Listen for localStorage changes (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'songUpdated' || e.key === 'songDeleted' || e.key === 'artistUpdated' || e.key === 'artistCreated') {
        if (e.key === 'artistCreated') {
          handleArtistCreated({ detail: JSON.parse(e.newValue || '{}') });
          return;
        }
        if (e.key === 'songDeleted') {
          handleSongDeleted({ detail: JSON.parse(e.newValue || '{}') });
        } else {
          fetchArtists();
        }
      }
    };
    
    // Refresh artists when the window regains focus (user returns from editing a song)
    const handleFocus = () => {
      fetchArtists();
    };
    
    window.addEventListener('songUpdated', handleSongUpdate);
    window.addEventListener('songDeleted', handleSongDeleted);
    window.addEventListener('artistSongCountChanged', handleArtistSongCountChanged);
    window.addEventListener('artistUpdated', handleArtistUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    // Also refresh every 30 seconds to keep counts up-to-date
    const refreshInterval = setInterval(() => {
      fetchArtists();
    }, 30000); // 30 seconds
    
    return () => {
      window.removeEventListener('songUpdated', handleSongUpdate);
      window.removeEventListener('songDeleted', handleSongDeleted);
      window.removeEventListener('artistSongCountChanged', handleArtistSongCountChanged);
      window.removeEventListener('artistUpdated', handleArtistUpdate);
      window.removeEventListener('artistCreated', handleArtistCreated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, []);

  // Filter artists based on search
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (artist.bio && artist.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle add artist
  const handleAddArtist = async () => {
    if (!artistForm.name.trim()) {
      alert('Please enter an artist name');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: artistForm.name.trim(),
          bio: artistForm.bio.trim() || null,
          image_url: artistForm.image_url.trim() || null,
          website: artistForm.website.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Failed to add artist:', errorMessage, errorData);
        alert(`Failed to add artist: ${errorMessage}`);
        return;
      }

      const data = await response.json();
      
      if (!data.artist) {
        console.error('Response missing artist data:', data);
        alert('Failed to add artist: Invalid response from server');
        return;
      }

      setIsAddModalOpen(false);
      setArtistForm({
        name: '',
        bio: '',
        image_url: '',
        website: '',
      });
      await fetchArtists();
      alert(t('admin.artists.addSuccess'));
      // Refresh other open admin pages via localStorage event
      window.dispatchEvent(new CustomEvent('artistUpdated'));
    } catch (error: any) {
      console.error('Error adding artist:', error);
        alert(error.message || t('admin.artists.addError'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit artist
  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistForm({
      name: artist.name || '',
      bio: artist.bio || '',
      image_url: artist.image_url || '',
      website: artist.website || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateArtist = async () => {
    if (!editingArtist || !artistForm.name.trim()) {
      alert('Please enter an artist name');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/artists/${editingArtist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: artistForm.name.trim(),
          bio: artistForm.bio.trim() || null,
          image_url: artistForm.image_url.trim() || null,
          website: artistForm.website.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update artist');
      }

      setIsEditModalOpen(false);
      setEditingArtist(null);
      setArtistForm({
        name: '',
        bio: '',
        image_url: '',
        website: '',
      });
      await fetchArtists();
      alert(t('admin.artists.updateSuccess'));
      // Refresh other open admin pages via localStorage event
      window.dispatchEvent(new CustomEvent('artistUpdated'));
    } catch (error: any) {
      console.error('Error updating artist:', error);
      alert(error.message || t('admin.artists.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete artist
  const handleDeleteArtist = async (artistId: string, artistName: string) => {
    if (!confirm(`${t('admin.artists.deleteConfirm')} "${artistName}"?`)) {
      return;
    }

    try {
      setIsDeleting(artistId);
      
      // First check if artist has songs
      const songsResponse = await fetch('/api/songs?limit=1000');
      if (songsResponse.ok) {
        const songsData = await songsResponse.json();
        const songCount = songsData.songs?.filter((song: any) => song.artist_id === artistId).length || 0;

        if (songCount > 0) {
          if (!confirm(`This artist has ${songCount} song(s). Deleting will remove the artist. Continue?`)) {
            setIsDeleting(null);
            return;
          }
        }
      }

      const response = await fetch(`/api/artists/${artistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete artist');
      }

      await fetchArtists();
      alert(t('admin.artists.deleteSuccess'));
      // Refresh other open admin pages via localStorage event
      window.dispatchEvent(new CustomEvent('artistUpdated'));
    } catch (error: any) {
      console.error('Error deleting artist:', error);
      alert(error.message || t('admin.artists.deleteError'));
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('admin.artists.title')}</h1>
                <p className="text-muted-foreground">
                  {t('admin.artists.subtitle')}
                </p>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.artists.addArtist')}
              </Button>
          </div>

            {/* Search and View Toggle */}
            <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  {t('admin.artists.grid')}
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  {t('admin.artists.list')}
                </Button>
              </div>
            </div>
          </div>

          {/* Artists Display */}
          <div className="grid gap-6 mb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredArtists.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('admin.artists.noArtists')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? t('artists.tryAdjusting')
                      : t('admin.artists.addFirstArtist')
                    }
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.artists.addFirst')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredArtists.map((artist) => (
                  <Card key={artist.id} className={`hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
                    {viewMode === 'list' ? (
                      <>
                        {artist.image_url && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 m-4">
                            <img 
                              src={artist.image_url} 
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-1">{artist.name}</CardTitle>
                            </div>
                        <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditArtist(artist)}
                              >
                            <Edit className="h-4 w-4" />
                          </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteArtist(artist.id, artist.name)}
                                disabled={isDeleting === artist.id}
                              >
                                {isDeleting === artist.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                            <Trash2 className="h-4 w-4" />
                                )}
                          </Button>
                            </div>
                          </div>
                          {artist.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {artist.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Music className="h-4 w-4" />
                              <span>{artist.song_count || 0} {t('admin.analytics.songs')}</span>
                            </div>
                            {artist.created_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(artist.created_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {artist.image_url && (
                                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 mx-auto">
                                  <img 
                                    src={artist.image_url} 
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                  />
                      </div>
                              )}
                              <CardTitle className="text-lg text-center">{artist.name}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditArtist(artist)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteArtist(artist.id, artist.name)}
                                disabled={isDeleting === artist.id}
                              >
                                {isDeleting === artist.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                    </CardHeader>
                    <CardContent>
                          <div className="space-y-3">
                            {artist.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {artist.bio}
                              </p>
                            )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Songs</span>
                          <span className="font-medium">{artist.song_count || 0}</span>
                        </div>
                            {artist.created_at && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Added</span>
                          <span className="font-medium">
                                  {new Date(artist.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        )}
                      </div>
                    </CardContent>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{artists.length}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.artists.totalArtists')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Music className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {artists.reduce((sum, artist) => sum + (artist.song_count || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('admin.artists.totalSongs')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Star className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {artists.length > 0 
                        ? Math.round(artists.reduce((sum, artist) => sum + (artist.song_count || 0), 0) / artists.length)
                        : 0
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">{t('admin.artists.avgSongsPerArtist')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Artist Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) {
          setArtistForm({
            name: '',
            bio: '',
            image_url: '',
            website: '',
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.artists.addArtist')}</DialogTitle>
            <DialogDescription>
              {t('admin.artists.addFirstArtist')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('admin.artists.nameLabel')} *</Label>
              <Input
                id="name"
                value={artistForm.name}
                onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
                placeholder={t('admin.artists.namePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">{t('admin.artists.bioLabel')}</Label>
              <Textarea
                id="bio"
                value={artistForm.bio}
                onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                placeholder={t('admin.artists.bioPlaceholder')}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="image_url">{t('admin.artists.imageUrlLabel')}</Label>
                <Input
                  id="image_url"
                  value={artistForm.image_url}
                  onChange={(e) => setArtistForm({ ...artistForm, image_url: e.target.value })}
                  placeholder={t('admin.artists.imageUrlPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">{t('admin.artists.websiteLabel')}</Label>
                <Input
                  id="website"
                  value={artistForm.website}
                  onChange={(e) => setArtistForm({ ...artistForm, website: e.target.value })}
                  placeholder={t('admin.artists.websitePlaceholder')}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              {t('admin.artists.cancel')}
            </Button>
            <Button onClick={handleAddArtist} disabled={isSaving || !artistForm.name.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('dashboard.updating')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.artists.addArtist')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Artist Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) {
          setEditingArtist(null);
          setArtistForm({
            name: '',
            bio: '',
            image_url: '',
            website: '',
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.artists.editArtist')}</DialogTitle>
            <DialogDescription>
              {t('admin.artists.updateSuccess')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t('admin.artists.nameLabel')} *</Label>
              <Input
                id="edit-name"
                value={artistForm.name}
                onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
                placeholder={t('admin.artists.namePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bio">{t('admin.artists.bioLabel')}</Label>
              <Textarea
                id="edit-bio"
                value={artistForm.bio}
                onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                placeholder={t('admin.artists.bioPlaceholder')}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-image_url">{t('admin.artists.imageUrlLabel')}</Label>
                <Input
                  id="edit-image_url"
                  value={artistForm.image_url}
                  onChange={(e) => setArtistForm({ ...artistForm, image_url: e.target.value })}
                  placeholder={t('admin.artists.imageUrlPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-website">{t('admin.artists.websiteLabel')}</Label>
                <Input
                  id="edit-website"
                  value={artistForm.website}
                  onChange={(e) => setArtistForm({ ...artistForm, website: e.target.value })}
                  placeholder={t('admin.artists.websitePlaceholder')}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t('admin.artists.cancel')}
            </Button>
            <Button onClick={handleUpdateArtist} disabled={isSaving || !artistForm.name.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('dashboard.updating')}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('admin.artists.save')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ArtistsPage;
