'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// import './styles.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Save, 
  Undo, 
  Redo, 
  Eye, 
  Edit3, 
  Plus, 
  Minus,
  Download,
  Upload,
  Copy,
  Scissors,
  Palette,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Settings,
  History,
  Smartphone,
  Monitor,
  Tablet,
  Check,
  X,
  Zap,
  BookOpen,
  Key,
  Play,
  Pause,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Trash2,
  Edit,
  EyeOff,
  Maximize,
  Minimize
} from 'lucide-react';

interface Chord {
  name: string;
  position: number;
  line: number;
  color?: string;
  bold?: boolean;
}

interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  label: string;
  content: string;
  chords: Chord[];
}

interface SongData {
  id: string;
  title: string;
  artist: string;
  key: string;
  sections: SongSection[];
  version: number;
  lastSaved: string;
}

const commonChords = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm',
  'C7', 'C#7', 'Db7', 'D7', 'D#7', 'Eb7', 'E7', 'F7', 'F#7', 'Gb7', 'G7', 'G#7', 'Ab7', 'A7', 'A#7', 'Bb7', 'B7',
  'Cmaj7', 'C#maj7', 'Dbmaj7', 'Dmaj7', 'D#maj7', 'Ebmaj7', 'Emaj7', 'Fmaj7', 'F#maj7', 'Gbmaj7', 'Gmaj7', 'G#maj7', 'Abmaj7', 'Amaj7', 'A#maj7', 'Bbmaj7', 'Bmaj7',
  'Cm7', 'C#m7', 'Dbm7', 'Dm7', 'D#m7', 'Ebm7', 'Em7', 'Fm7', 'F#m7', 'Gbm7', 'Gm7', 'G#m7', 'Abm7', 'Am7', 'A#m7', 'Bbm7', 'Bm7',
  'Csus2', 'Csus4', 'Cadd9', 'Cdim', 'Caug', 'C6', 'C9', 'C11', 'C13'
];

const chordColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export const SongEditor = ({ songId }: { songId: string }) => {
  const [songData, setSongData] = useState<SongData>({
    id: songId,
    title: '',
    artist: '',
    key: 'C',
    sections: [],
    version: 1,
    lastSaved: new Date().toISOString()
  });
  
  const [isEditMode, setIsEditMode] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedChord, setSelectedChord] = useState<string>('');
  const [chordSuggestions, setChordSuggestions] = useState<string[]>([]);
  const [showChordPanel, setShowChordPanel] = useState(false);
  const [transposeAmount, setTransposeAmount] = useState(0);
  const [chordColor, setChordColor] = useState('#3B82F6');
  const [autoSave, setAutoSave] = useState(true);
  const [versionHistory, setVersionHistory] = useState<SongData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const chordInputRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout>();

  // Load song data
  useEffect(() => {
    loadSongData();
  }, [songId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      autoSaveRef.current = setInterval(() => {
        saveSong();
      }, 30000);
    }
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [autoSave, songData]);

  const loadSongData = async () => {
    try {
      const response = await fetch(`/api/songs/${songId}`);
      if (response.ok) {
        const data = await response.json();
        setSongData(data);
        setVersionHistory([data]);
      }
    } catch (error) {
      console.error('Error loading song:', error);
    }
  };

  const saveSong = async () => {
    try {
      const updatedSong = {
        ...songData,
        version: songData.version + 1,
        lastSaved: new Date().toISOString()
      };
      
      setSongData(updatedSong);
      setVersionHistory(prev => [updatedSong, ...prev.slice(0, 9)]);
      
      await fetch(`/api/songs/${songId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSong)
      });
    } catch (error) {
      console.error('Error saving song:', error);
    }
  };

  const handleChordInput = (value: string) => {
    setSelectedChord(value);
    if (value.length > 0) {
      const suggestions = commonChords.filter(chord => 
        chord.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setChordSuggestions(suggestions);
    } else {
      setChordSuggestions([]);
    }
  };

  const insertChord = (chordName: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const chordElement = document.createElement('span');
        chordElement.className = 'chord-marker';
        chordElement.style.color = chordColor;
        chordElement.style.fontWeight = 'bold';
        chordElement.style.backgroundColor = `${chordColor}20`;
        chordElement.style.padding = '2px 4px';
        chordElement.style.borderRadius = '3px';
        chordElement.style.margin = '0 2px';
        chordElement.contentEditable = 'false';
        chordElement.textContent = `[${chordName}]`;
        chordElement.dataset.chord = chordName;
        
        range.insertNode(chordElement);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setSelectedChord('');
        setChordSuggestions([]);
      }
    }
  };

  const transposeChords = (semitones: number) => {
    const chordMap: { [key: string]: string } = {
      'C': 'C', 'C#': 'C#', 'Db': 'Db', 'D': 'D', 'D#': 'D#', 'Eb': 'Eb', 'E': 'E', 'F': 'F', 'F#': 'F#', 'Gb': 'Gb', 'G': 'G', 'G#': 'G#', 'Ab': 'Ab', 'A': 'A', 'A#': 'A#', 'Bb': 'Bb', 'B': 'B'
    };
    
    const chordOrder = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    
    if (editorRef.current) {
      const chordElements = editorRef.current.querySelectorAll('.chord-marker');
      chordElements.forEach(element => {
        const chordName = element.dataset.chord;
        if (chordName) {
          const baseChord = chordName.replace(/[^A-G#b]/g, '');
          const suffix = chordName.replace(/^[A-G#b]+/, '');
          const currentIndex = chordOrder.indexOf(baseChord);
          if (currentIndex !== -1) {
            const newIndex = (currentIndex + semitones + 12) % 12;
            const newChord = chordOrder[newIndex] + suffix;
            element.textContent = `[${newChord}]`;
            element.dataset.chord = newChord;
          }
        }
      });
    }
    
    setTransposeAmount(transposeAmount + semitones);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          setShowChordPanel(true);
          chordInputRef.current?.focus();
          break;
        case 't':
          e.preventDefault();
          // Open transpose dialog
          break;
        case 'z':
          e.preventDefault();
          // Undo functionality
          break;
        case 'y':
          e.preventDefault();
          // Redo functionality
          break;
        case 's':
          e.preventDefault();
          saveSong();
          break;
      }
    }
  };

  const exportSong = (format: 'text' | 'pdf' | 'json') => {
    switch (format) {
      case 'text':
        const textContent = songData.sections.map(section => 
          `${section.label}\n${section.content}\n`
        ).join('\n');
        downloadFile(textContent, `${songData.title}.txt`, 'text/plain');
        break;
      case 'json':
        downloadFile(JSON.stringify(songData, null, 2), `${songData.title}.json`, 'application/json');
        break;
      case 'pdf':
        // PDF export would require a library like jsPDF
        console.log('PDF export not implemented yet');
        break;
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addSection = (type: SongSection['type']) => {
    const newSection: SongSection = {
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      content: '',
      chords: []
    };
    setSongData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const getDeviceClasses = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className={getDeviceClasses()}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Song Editor</h1>
                <p className="text-muted-foreground">
                  Advanced chord placement and editing system
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  onClick={() => setIsEditMode(true)}
                  size="sm"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Mode
                </Button>
                <Button
                  variant={!isEditMode ? "default" : "outline"}
                  onClick={() => setIsEditMode(false)}
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Mode
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowChordPanel(!showChordPanel)}>
                  <Music className="h-4 w-4 mr-2" />
                  Chords
                </Button>
                <Button variant="outline" size="sm" onClick={() => transposeChords(-1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">{transposeAmount}</span>
                <Button variant="outline" size="sm" onClick={() => transposeChords(1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setDeviceView('desktop')}>
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeviceView('tablet')}>
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeviceView('mobile')}>
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={saveSong}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Song Content</CardTitle>
                      <CardDescription>
                        {isEditMode ? 'Edit your song with chord placement' : 'Preview the final output'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Key className="h-3 w-3 mr-1" />
                        {songData.key}
                      </Badge>
                      <Badge variant="secondary">
                        v{songData.version}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    ref={editorRef}
                    contentEditable={isEditMode}
                    onKeyDown={handleKeyDown}
                    className="min-h-[500px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{
                      fontFamily: 'monospace',
                      lineHeight: '1.8',
                      fontSize: '16px'
                    }}
                  >
                    {songData.sections.map((section, index) => (
                      <div key={index} className="mb-6">
                        <div className="font-bold text-lg mb-2 text-primary">
                          {section.label}
                        </div>
                        <div className="whitespace-pre-wrap">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Chord Panel */}
              {showChordPanel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chord Library</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="chord-input">Insert Chord</Label>
                      <div className="relative">
                        <Input
                          ref={chordInputRef}
                          id="chord-input"
                          value={selectedChord}
                          onChange={(e) => handleChordInput(e.target.value)}
                          placeholder="Type chord name..."
                          className="pr-8"
                        />
                        {chordSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
                            {chordSuggestions.map((chord, index) => (
                              <button
                                key={index}
                                className="w-full text-left px-3 py-2 hover:bg-muted"
                                onClick={() => insertChord(chord)}
                              >
                                {chord}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Common Chords</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {commonChords.slice(0, 16).map((chord, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => insertChord(chord)}
                            className="text-xs"
                          >
                            {chord}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['intro', 'verse', 'chorus', 'bridge', 'outro'].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addSection(type as SongSection['type'])}
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSong('text')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSong('json')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSong('pdf')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
