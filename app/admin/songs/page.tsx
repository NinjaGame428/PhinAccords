'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Music, 
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface Song {
  id: string;
  title: string;
  slug?: string;
  artist?: string;
  artist_id?: string;
  genre?: string;
  key_signature?: string;
  created_at?: string;
  updated_at?: string;
}

const SongsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNewArtist, setIsNewArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  
  // Form state for adding a song
  const [newSong, setNewSong] = useState({
    title: '',
    artist_id: '',
    key_signature: '',
    tempo: '',
    lyrics: '',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50; // Load 50 songs at a time

  // Fetch songs with pagination
  const fetchSongs = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/songs?page=${pageNum}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      
      // Ensure artist_id is included in the songs data
      // CRITICAL: Only include songs that have valid artist data
      const songsWithArtistId = (data.songs || [])
        .filter((song: any) => {
          // Only show songs that have an artist (either through relation or direct field)
          return song.artist_id || song.artists?.id || song.artists?.name || song.artist;
        })
        .map((song: any) => {
          // Get artist name from nested relation or direct field
          // Handle both single artist object and array of artists
          let artistName = null;
          if (song.artists) {
            if (Array.isArray(song.artists)) {
              artistName = song.artists[0]?.name || null;
            } else {
              artistName = song.artists.name || null;
            }
          }
          
          // Fallback to direct artist field if nested relation doesn't have name
          if (!artistName) {
            artistName = song.artist || null;
          }
          
          return {
            ...song,
            artist_id: song.artist_id || song.artists?.id || (Array.isArray(song.artists) ? song.artists[0]?.id : null),
            artist: artistName // This ensures artist name is correctly displayed
          };
        });
      
      if (append && pageNum > 1) {
        // Append to existing songs for infinite scroll
        setSongs(prev => [...prev, ...songsWithArtistId]);
      } else {
        // Replace for pagination
        setSongs(songsWithArtistId);
      }
      
      // Update pagination info
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setHasMore(pageNum < (data.pagination.totalPages || 1));
      }
    } catch (err) {
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm(t('admin.songs.deleteConfirm'))) {
      return;
    }

    try {
      // Get the song's artist_id before deletion (for broadcasting)
      const deletedSong = songs.find(s => s.id === songId);
      const deletedArtistId = deletedSong?.artist_id;

      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Use artist_id from API response if available, otherwise use local data
        const confirmedArtistId = data.artistId || deletedArtistId;
        
        // Remove from local state immediately
        setSongs(songs.filter(song => song.id !== songId));
        
        // Refresh the list to ensure we have the latest data
        await fetchSongs(page, false);
        
        alert(t('admin.songs.deleteSuccess'));
        
        // Broadcast deletion event to all pages
        window.dispatchEvent(new CustomEvent('songDeleted', { 
          detail: { 
            songId: songId,
            artistId: confirmedArtistId,
            action: 'deleted',
            timestamp: Date.now()
          } 
        }));
        
        // Also use songUpdated event for backward compatibility
        window.dispatchEvent(new CustomEvent('songUpdated', { 
          detail: { 
            artistId: confirmedArtistId,
            songId: songId,
            action: 'deleted',
            timestamp: Date.now()
          } 
        }));
        
        // Cross-tab communication
        localStorage.setItem('songDeleted', JSON.stringify({
          songId: songId,
          artistId: confirmedArtistId,
          action: 'deleted',
          timestamp: Date.now()
        }));
        
        localStorage.setItem('songUpdated', JSON.stringify({
          artistId: confirmedArtistId,
          songId: songId,
          action: 'deleted',
          timestamp: Date.now()
        }));
        
        console.log('🗑️ Song deleted and events broadcast:', {
          songId,
          artistId: confirmedArtistId
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.details || errorData.error || t('admin.songs.deleteError'));
      }
    } catch (error: any) {
      console.error('Error deleting song:', error);
      alert(error.message || t('admin.songs.deleteError'));
    }
  };

  const handleDownloadSong = async (song: Song) => {
    try {
      const response = await fetch(`/api/songs/${song.id}`);
      if (response.ok) {
        const data = await response.json();
        const songData = data.song || data;
        
        // Create text format for download
        const artistName = songData.artists?.name || songData.artist || 'N/A';
        const textContent = `
Title: ${songData.title}
Artist: ${artistName}
Key: ${songData.key_signature || 'N/A'}
Tempo: ${songData.tempo || 'N/A'} BPM
Genre: ${songData.genre || 'N/A'}

Lyrics:
${songData.lyrics || 'No lyrics available'}
        `.trim();

        // Create blob and download
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${songData.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading song:', error);
      alert('Failed to download song');
    }
  };

  // Fetch artists with cache busting
  const fetchArtists = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/artists?_t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        setArtists(data.artists || []);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const handleAddSong = async () => {
    // Validate required fields
    if (!newSong.title) {
      alert(t('admin.songs.requiredFields'));
      return;
    }

    // Check if we need to create a new artist
    let artistId = newSong.artist_id;
    if (isNewArtist && newArtistName.trim()) {
      try {
        // Create new artist first
        const artistResponse = await fetch('/api/artists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newArtistName.trim(),
          }),
        });

        if (!artistResponse.ok) {
          const errorData = await artistResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.details || `HTTP ${artistResponse.status}: ${artistResponse.statusText}`;
          console.error('Failed to create artist:', errorMessage, errorData);
          alert(`Failed to create artist: ${errorMessage}`);
          return;
        }

        const artistData = await artistResponse.json();
        
        if (!artistData.artist || !artistData.artist.id) {
          console.error('Response missing artist data:', artistData);
          alert('Failed to create artist: Invalid response from server');
          return;
        }
        
        artistId = artistData.artist.id;
        
        // Add the new artist to the local list immediately
        setArtists([...artists, {
          id: artistData.artist.id,
          name: artistData.artist.name
        }]);
        
        // Update the form to use the new artist
        setNewSong({ ...newSong, artist_id: artistData.artist.id });
        setIsNewArtist(false);
        
        // Refresh artists list from API to ensure consistency
        fetchArtists();
        
        // Broadcast artist creation event for other pages
        window.dispatchEvent(new CustomEvent('artistCreated', { 
          detail: { 
            artistId: artistData.artist.id,
            artistName: artistData.artist.name,
            timestamp: Date.now()
          } 
        }));
        
        // Cross-tab communication
        localStorage.setItem('artistCreated', JSON.stringify({
          artistId: artistData.artist.id,
          artistName: artistData.artist.name,
          timestamp: Date.now()
        }));
        
        alert(t('admin.songs.artistCreated'));
      } catch (error) {
        console.error('Error creating artist:', error);
        alert(t('admin.songs.artistError'));
        return;
      }
    } else if (!isNewArtist && !artistId) {
      alert(t('admin.songs.requiredFields'));
      return;
    }

    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSong.title,
          artist_id: artistId,
          key_signature: newSong.key_signature || null,
          tempo: newSong.tempo ? parseInt(newSong.tempo) : null,
          lyrics: newSong.lyrics || null,
        }),
      });

      if (response.ok) {
        const songData = await response.json();
        
        if (!songData.song) {
          console.error('Response missing song data:', songData);
          alert('Failed to add song: Invalid response from server');
          return;
        }

        alert(t('admin.songs.addSuccess'));
        setIsAddModalOpen(false);
        setIsNewArtist(false);
        setNewArtistName('');
        setNewSong({
          title: '',
          artist_id: '',
          key_signature: '',
          tempo: '',
          lyrics: '',
        });
        fetchSongs(1, false); // Refresh from page 1
        
        // Notify other pages that a song was added
        const newArtistId = songData.song?.artist_id || artistId;
        window.dispatchEvent(new CustomEvent('songUpdated', { 
          detail: { 
            artistId: newArtistId,
            songId: songData.song?.id,
            action: 'added'
          } 
        }));
        
        // Cross-tab communication
        localStorage.setItem('songUpdated', JSON.stringify({
          artistId: newArtistId,
          songId: songData.song?.id,
          action: 'added',
          timestamp: Date.now()
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Error adding song:', errorMessage, errorData);
        alert(`${t('admin.songs.addError')}: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding song:', error);
      alert(t('admin.songs.addError'));
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const songs = JSON.parse(text);
      
      if (!Array.isArray(songs)) {
        alert('Invalid file format. Expected an array of songs.');
        return;
      }

      let successCount = 0;
      for (const song of songs) {
        try {
          const response = await fetch('/api/songs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(song),
          });
          if (response.ok) successCount++;
        } catch (err) {
          console.error('Error importing song:', err);
        }
      }

      alert(`Successfully imported ${successCount} out of ${songs.length} songs`);
      setIsImportModalOpen(false);
      fetchSongs(1, false);
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Failed to import file. Please check the format.');
    }
  };

  useEffect(() => {
    fetchSongs(1, false);
    fetchArtists();
  }, []);

  // Filter songs based on search and genre
  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = filterGenre === 'all' || song.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ['all', ...Array.from(new Set(songs.map(song => song.genre).filter(Boolean)))];

  return (
    <AdminLayout>
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('admin.songs.title')}</h1>
                <p className="text-muted-foreground">
                  {t('admin.songs.subtitle')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('admin.songs.import')}
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.songs.add')}
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.songs.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? t('admin.songs.allGenres') : genre}
                </option>
              ))}
            </select>
          </div>

          {/* Songs List */}
          <div className="grid gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSongs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('admin.songs.noSongs')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterGenre !== 'all' 
                      ? t('admin.songs.noSongsFilter')
                      : t('admin.songs.noSongsEmpty')
                    }
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.songs.addFirst')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredSongs.map((song) => (
                <Card key={song.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{song.title}</h3>
                          {song.genre && (
                            <Badge variant="secondary">{song.genre}</Badge>
                          )}
                          {song.key_signature && (
                            <Badge variant="outline">{song.key_signature}</Badge>
                          )}
                        </div>
                        {song.artist && (
                          <p className="text-muted-foreground">by {song.artist}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{t('admin.songs.created')}: {new Date(song.created_at || '').toLocaleDateString()}</span>
                          <span>{t('admin.songs.updated')}: {new Date(song.updated_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Generate slug from title if not available
                            const slug = song.slug || song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                            console.log('Edit button clicked for song:', song.id, 'slug:', slug);
                            router.push(`/admin/songs/${slug}/edit`);
                          }}
                          title="Edit song"
                          className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSong(song);
                          }}
                          title="Download song"
                          className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSong(song.id);
                          }}
                          title="Delete song"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {/* Load More Button */}
            {!loading && hasMore && filteredSongs.length >= pageSize && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchSongs(nextPage, true); // Append mode
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    `Load More (Page ${page + 1} of ${totalPages})`
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Music className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{songs.length}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.songs.totalSongs')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Filter className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{genres.length - 1}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.songs.genres')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Search className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{filteredSongs.length}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.songs.filteredResults')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Song Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) {
          setIsNewArtist(false);
          setNewArtistName('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.songs.addTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.songs.addDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('admin.songs.titleLabel')}</Label>
              <Input
                id="title"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                placeholder={t('admin.songs.titlePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="artist">{t('admin.songs.artistLabel')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsNewArtist(!isNewArtist);
                    if (!isNewArtist) {
                      setNewSong({ ...newSong, artist_id: '' });
                    } else {
                      setNewArtistName('');
                    }
                  }}
                >
                  {isNewArtist ? t('admin.songs.selectArtist') : t('admin.songs.newArtist')}
                </Button>
              </div>
              {isNewArtist ? (
                <Input
                  id="newArtist"
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  placeholder={t('admin.songs.newArtistPlaceholder')}
                />
              ) : (
                <select
                  id="artist"
                  value={newSong.artist_id}
                  onChange={(e) => setNewSong({ ...newSong, artist_id: e.target.value })}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">{t('admin.songs.selectArtist')}</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="key">{t('admin.songs.keyLabel')}</Label>
                <Input
                  id="key"
                  value={newSong.key_signature}
                  onChange={(e) => setNewSong({ ...newSong, key_signature: e.target.value })}
                  placeholder={t('admin.songs.keyPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tempo">{t('admin.songs.tempoLabel')}</Label>
                <Input
                  id="tempo"
                  type="number"
                  value={newSong.tempo}
                  onChange={(e) => setNewSong({ ...newSong, tempo: e.target.value })}
                  placeholder={t('admin.songs.tempoPlaceholder')}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lyrics">{t('admin.songs.lyricsLabel')}</Label>
              <Textarea
                id="lyrics"
                value={newSong.lyrics}
                onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
                placeholder={t('admin.songs.lyricsPlaceholder')}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setIsNewArtist(false);
              setNewArtistName('');
            }}>
              {t('admin.songs.cancel')}
            </Button>
            <Button onClick={handleAddSong}>{t('admin.songs.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Songs</DialogTitle>
            <DialogDescription>
              Upload a JSON file containing an array of songs
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Expected format: An array of song objects with fields like title, artist_id, genre, key_signature, tempo, and lyrics.
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SongsPage;
