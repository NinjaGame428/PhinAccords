'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  Save, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload,
  Piano,
  Volume2,
  VolumeX,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Minus,
  Zap,
  Star,
  Heart,
  BookOpen,
  Download as DownloadIcon,
  Upload as UploadIcon
} from 'lucide-react';

interface PianoKey {
  note: string;
  isBlack: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  isPressed: boolean;
}

interface Chord {
  name: string;
  notes: string[];
  fingering: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'major' | 'minor' | 'diminished' | 'augmented' | 'suspended' | 'seventh' | 'extended';
}

interface ChordProgression {
  id: string;
  name: string;
  chords: Chord[];
  tempo: number;
  key: string;
  timeSignature: string;
}

const pianoKeys: PianoKey[] = [
  // White keys
  { note: 'C', isBlack: false, x: 0, y: 0, width: 40, height: 200, isPressed: false },
  { note: 'D', isBlack: false, x: 40, y: 0, width: 40, height: 200, isPressed: false },
  { note: 'E', isBlack: false, x: 80, y: 0, width: 40, height: 200, isPressed: false },
  { note: 'F', isBlack: false, x: 120, y: 0, width: 40, height: 200, isPressed: false },
  { note: 'G', isBlack: false, x: 160, y: 0, width: 40, height: 200, isPressed: false },
  { note: 'A', isBlack: false, x: 200, y: 0, width: 40, height: 200, isPressed: false },
  { note: 'B', isBlack: false, x: 240, y: 0, width: 40, height: 200, isPressed: false },
  // Black keys
  { note: 'C#', isBlack: true, x: 30, y: 0, width: 20, height: 120, isPressed: false },
  { note: 'D#', isBlack: true, x: 70, y: 0, width: 20, height: 120, isPressed: false },
  { note: 'F#', isBlack: true, x: 150, y: 0, width: 20, height: 120, isPressed: false },
  { note: 'G#', isBlack: true, x: 190, y: 0, width: 20, height: 120, isPressed: false },
  { note: 'A#', isBlack: true, x: 230, y: 0, width: 20, height: 120, isPressed: false },
];

const commonChords: Chord[] = [
  { name: 'C', notes: ['C', 'E', 'G'], fingering: [1, 3, 5], difficulty: 'easy', category: 'major' },
  { name: 'Cm', notes: ['C', 'Eb', 'G'], fingering: [1, 3, 5], difficulty: 'easy', category: 'minor' },
  { name: 'C7', notes: ['C', 'E', 'G', 'Bb'], fingering: [1, 3, 5, 7], difficulty: 'medium', category: 'seventh' },
  { name: 'Cmaj7', notes: ['C', 'E', 'G', 'B'], fingering: [1, 3, 5, 7], difficulty: 'medium', category: 'seventh' },
  { name: 'D', notes: ['D', 'F#', 'A'], fingering: [1, 3, 5], difficulty: 'easy', category: 'major' },
  { name: 'Dm', notes: ['D', 'F', 'A'], fingering: [1, 3, 5], difficulty: 'easy', category: 'minor' },
  { name: 'E', notes: ['E', 'G#', 'B'], fingering: [1, 3, 5], difficulty: 'easy', category: 'major' },
  { name: 'Em', notes: ['E', 'G', 'B'], fingering: [1, 3, 5], difficulty: 'easy', category: 'minor' },
  { name: 'F', notes: ['F', 'A', 'C'], fingering: [1, 3, 5], difficulty: 'easy', category: 'major' },
  { name: 'Fm', notes: ['F', 'Ab', 'C'], fingering: [1, 3, 5], difficulty: 'easy', category: 'minor' },
  { name: 'G', notes: ['G', 'B', 'D'], fingering: [1, 3, 5], difficulty: 'easy', category: 'major' },
  { name: 'Gm', notes: ['G', 'Bb', 'D'], fingering: [1, 3, 5], difficulty: 'easy', category: 'minor' },
  { name: 'A', notes: ['A', 'C#', 'E'], fingering: [1, 3, 5], difficulty: 'easy', category: 'major' },
  { name: 'Am', notes: ['A', 'C', 'E'], fingering: [1, 3, 5], difficulty: 'easy', category: 'minor' },
  { name: 'B', notes: ['B', 'D#', 'F#'], fingering: [1, 3, 5], difficulty: 'easy', category: 'major' },
  { name: 'Bm', notes: ['B', 'D', 'F#'], fingering: [1, 3, 5], difficulty: 'easy', category: 'minor' },
];

export const VisualChordEditor = () => {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [chordProgression, setChordProgression] = useState<ChordProgression[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [key, setKey] = useState('C');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [showChordSuggestions, setShowChordSuggestions] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showFingering, setShowFingering] = useState(true);
  const [showChordNames, setShowChordNames] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Play note
  const playNote = (note: string, duration: number = 0.5) => {
    if (!audioContextRef.current || isMuted) return;

    const frequencies: { [key: string]: number } = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63,
      'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00,
      'A#': 466.16, 'B': 493.88
    };

    const frequency = frequencies[note];
    if (!frequency) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);

    oscillatorsRef.current.push(oscillator);
  };

  // Play chord
  const playChord = (chord: Chord) => {
    chord.notes.forEach((note, index) => {
      setTimeout(() => {
        playNote(note, 2);
      }, index * 100);
    });
  };

  // Handle key press
  const handleKeyPress = (note: string) => {
    playNote(note, 0.5);
    
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter(n => n !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  // Detect chord from selected notes
  const detectChord = () => {
    const sortedNotes = [...selectedNotes].sort();
    const chord = commonChords.find(c => 
      c.notes.length === sortedNotes.length &&
      c.notes.every(note => sortedNotes.includes(note))
    );
    
    if (chord) {
      setCurrentChord(chord);
      setShowChordSuggestions(false);
    } else {
      setCurrentChord(null);
      setShowChordSuggestions(true);
    }
  };

  // Add chord to progression
  const addChordToProgression = () => {
    if (currentChord) {
      const newProgression = [...chordProgression];
      if (newProgression.length === 0) {
        newProgression.push({
          id: Date.now().toString(),
          name: 'New Progression',
          chords: [currentChord],
          tempo,
          key,
          timeSignature
        });
      } else {
        newProgression[0].chords.push(currentChord);
      }
      setChordProgression(newProgression);
    }
  };

  // Play progression
  const playProgression = async () => {
    if (chordProgression.length === 0) return;
    
    setIsPlaying(true);
    const progression = chordProgression[0];
    
    for (const chord of progression.chords) {
      if (!isPlaying) break;
      playChord(chord);
      await new Promise(resolve => setTimeout(resolve, (60000 / tempo) * 4)); // 4 beats per chord
    }
    
    setIsPlaying(false);
  };

  // Stop playing
  const stopPlaying = () => {
    setIsPlaying(false);
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator already stopped
      }
    });
    oscillatorsRef.current = [];
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedNotes([]);
    setCurrentChord(null);
    setShowChordSuggestions(false);
  };

  // Save chord progression
  const saveProgression = () => {
    const progression = chordProgression[0];
    if (!progression) return;
    
    const data = JSON.stringify(progression, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${progression.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load chord progression
  const loadProgression = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setChordProgression([data]);
      } catch (error) {
        console.error('Error loading progression:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Visual Chord Editor</h1>
                <p className="text-muted-foreground">
                  Create chords using the piano interface and build chord progressions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isPlaying ? "destructive" : "default"}
                  onClick={isPlaying ? stopPlaying : playProgression}
                >
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
                <Button variant="outline" onClick={saveProgression}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={clearSelection}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Piano Interface */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Piano className="h-5 w-5 mr-2" />
                    Piano Interface
                  </CardTitle>
                  <CardDescription>
                    Click on the piano keys to select notes and create chords
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-100 rounded-lg p-4 overflow-x-auto">
                    <div className="relative" style={{ width: '280px', height: '220px' }}>
                      {/* White keys */}
                      {pianoKeys.filter(key => !key.isBlack).map((key, index) => (
                        <button
                          key={key.note}
                          onClick={() => handleKeyPress(key.note)}
                          className={`absolute border border-gray-300 rounded-b-lg transition-all duration-150 ${
                            selectedNotes.includes(key.note)
                              ? 'bg-blue-500 text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                          style={{
                            left: key.x,
                            top: key.y,
                            width: key.width,
                            height: key.height,
                            zIndex: 1
                          }}
                        >
                          <div className="flex flex-col items-center justify-end h-full pb-2">
                            <span className="text-sm font-medium">{key.note}</span>
                            {showFingering && currentChord && (
                              <span className="text-xs text-muted-foreground">
                                {currentChord.fingering[index] || ''}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                      
                      {/* Black keys */}
                      {pianoKeys.filter(key => key.isBlack).map((key, index) => (
                        <button
                          key={key.note}
                          onClick={() => handleKeyPress(key.note)}
                          className={`absolute border border-gray-600 rounded-b-lg transition-all duration-150 ${
                            selectedNotes.includes(key.note)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                          style={{
                            left: key.x,
                            top: key.y,
                            width: key.width,
                            height: key.height,
                            zIndex: 2
                          }}
                        >
                          <div className="flex flex-col items-center justify-end h-full pb-2">
                            <span className="text-xs font-medium text-white">{key.note}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Tempo (BPM)</label>
                        <Input
                          type="number"
                          value={tempo}
                          onChange={(e) => setTempo(parseInt(e.target.value))}
                          min="60"
                          max="200"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Key</label>
                        <select
                          value={key}
                          onChange={(e) => setKey(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1">
                        <label className="text-sm font-medium">Volume</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chord Information */}
            <div className="space-y-6">
              {/* Current Chord */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Chord</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentChord ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">{currentChord.name}</h3>
                        <Badge variant="outline" className="mt-2">
                          {currentChord.category}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Notes:</h4>
                        <div className="flex gap-2">
                          {currentChord.notes.map(note => (
                            <Badge key={note} variant="secondary">{note}</Badge>
                          ))}
                        </div>
                      </div>

                      {showFingering && (
                        <div>
                          <h4 className="font-medium mb-2">Fingering:</h4>
                          <div className="flex gap-2">
                            {currentChord.fingering.map((finger, index) => (
                              <Badge key={index} variant="outline">
                                {finger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => playChord(currentChord)}>
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                        <Button size="sm" variant="outline" onClick={addChordToProgression}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Progression
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select notes to create a chord</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chord Progression */}
              <Card>
                <CardHeader>
                  <CardTitle>Chord Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  {chordProgression.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{chordProgression[0].name}</h3>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {chordProgression[0].chords.map((chord, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer">
                            {chord.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={playProgression}>
                          <Play className="h-4 w-4 mr-1" />
                          Play All
                        </Button>
                        <Button size="sm" variant="outline" onClick={saveProgression}>
                          <Download className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>No chord progression yet</p>
                      <p className="text-sm">Add chords to create a progression</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Fingering</span>
                    <Button
                      variant={showFingering ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFingering(!showFingering)}
                    >
                      {showFingering ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Chord Names</span>
                    <Button
                      variant={showChordNames ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowChordNames(!showChordNames)}
                    >
                      {showChordNames ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={() => document.getElementById('load-file')?.click()}>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Load Progression
                    </Button>
                    <input
                      id="load-file"
                      type="file"
                      accept=".json"
                      onChange={loadProgression}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
