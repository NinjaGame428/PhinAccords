"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdvancedSongEditor } from "@/components/admin/AdvancedSongEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Save, 
  Upload, 
  Download, 
  FileText, 
  Settings,
  History,
  Trash2,
  Plus,
  Search
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Song {
  id: string;
  title: string;
  artist: string;
  content: string;
  chords: any[];
  lastModified: string;
  version: number;
}

export default function ChordEditorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewSongDialog, setShowNewSongDialog] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongArtist, setNewSongArtist] = useState("");
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadSongs();
    }
  }, [user]);

  const loadSongs = async () => {
    try {
      setIsLoadingSongs(true);
      // Load songs from localStorage for now
      const savedSongs = localStorage.getItem('admin-songs');
      if (savedSongs) {
        setSongs(JSON.parse(savedSongs));
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const createNewSong = async () => {
    if (!newSongTitle.trim()) return;

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: newSongTitle,
      artist: newSongArtist,
      content: '',
      chords: [],
      lastModified: new Date().toISOString(),
      version: 1
    };

    const updatedSongs = [...songs, newSong];
    setSongs(updatedSongs);
    localStorage.setItem('admin-songs', JSON.stringify(updatedSongs));
    
    setSelectedSong(newSong);
    setNewSongTitle("");
    setNewSongArtist("");
    setShowNewSongDialog(false);
  };

  const saveSong = async (songData: any) => {
    if (!selectedSong) return;

    const updatedSong = {
      ...selectedSong,
      content: songData.content,
      chords: songData.chords,
      lastModified: new Date().toISOString(),
      version: selectedSong.version + 1
    };

    const updatedSongs = songs.map(song => 
      song.id === selectedSong.id ? updatedSong : song
    );
    
    setSongs(updatedSongs);
    setSelectedSong(updatedSong);
    localStorage.setItem('admin-songs', JSON.stringify(updatedSongs));
  };

  const deleteSong = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    const updatedSongs = songs.filter(song => song.id !== songId);
    setSongs(updatedSongs);
    localStorage.setItem('admin-songs', JSON.stringify(updatedSongs));
    
    if (selectedSong?.id === songId) {
      setSelectedSong(null);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Song Library</h2>
              <Dialog open={showNewSongDialog} onOpenChange={setShowNewSongDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Song
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Song</DialogTitle>
                    <DialogDescription>
                      Enter the song details to start editing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Song Title</Label>
                      <Input
                        id="title"
                        value={newSongTitle}
                        onChange={(e) => setNewSongTitle(e.target.value)}
                        placeholder="Enter song title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="artist">Artist</Label>
                      <Input
                        id="artist"
                        value={newSongArtist}
                        onChange={(e) => setNewSongArtist(e.target.value)}
                        placeholder="Enter artist name"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewSongDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createNewSong} disabled={!newSongTitle.trim()}>
                        Create Song
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingSongs ? (
              <div className="p-4 text-center text-gray-500">Loading songs...</div>
            ) : filteredSongs.length > 0 ? (
              <div className="p-2">
                {filteredSongs.map((song) => (
                  <Card 
                    key={song.id} 
                    className={`mb-2 cursor-pointer transition-colors ${
                      selectedSong?.id === song.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedSong(song)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{song.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              v{song.version}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(song.lastModified).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedSong(song)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteSong(song.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Music className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No songs found</p>
                <p className="text-sm">Create your first song to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedSong ? (
            <>
              {/* Song Header */}
              <div className="border-b p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold">{selectedSong.title}</h1>
                    <p className="text-gray-600">{selectedSong.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Version {selectedSong.version}</Badge>
                    <span className="text-sm text-gray-500">
                      Last modified: {new Date(selectedSong.lastModified).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chord Editor */}
              <div className="flex-1">
                <AdvancedSongEditor />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Music className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold mb-2">No Song Selected</h2>
                <p className="text-gray-600 mb-4">Choose a song from the sidebar or create a new one</p>
                <Button onClick={() => setShowNewSongDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Song
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
