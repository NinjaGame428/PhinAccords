'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  X, 
  Music, 
  Guitar, 
  Piano, 
  Save,
  Edit,
  Trash2
} from 'lucide-react';

interface Chord {
  name: string;
  type: 'major' | 'minor' | 'diminished' | 'augmented' | 'suspended' | 'seventh' | 'major7' | 'minor7' | 'dim7' | 'aug7';
  root: string;
  bass?: string;
  capo?: number;
  fingering?: string;
  diagram?: string;
}

interface ChordEditorProps {
  chords: Chord[];
  onChordsChange: (chords: Chord[]) => void;
  instrument: 'piano' | 'guitar';
  className?: string;
}

const CHORD_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORD_TYPES = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'diminished', label: 'Diminished' },
  { value: 'augmented', label: 'Augmented' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'seventh', label: '7th' },
  { value: 'major7', label: 'Major 7th' },
  { value: 'minor7', label: 'Minor 7th' },
  { value: 'dim7', label: 'Diminished 7th' },
  { value: 'aug7', label: 'Augmented 7th' }
];

export const ChordEditor: React.FC<ChordEditorProps> = ({
  chords = [],
  onChordsChange,
  instrument,
  className = ""
}) => {
  // Ensure chords is always an array
  const safeChords = Array.isArray(chords) ? chords : [];
  const [newChord, setNewChord] = useState<Chord>({
    name: '',
    type: 'major',
    root: 'C',
    bass: '',
    capo: 0,
    fingering: '',
    diagram: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addChord = () => {
    if (newChord.name.trim()) {
      const chordName = newChord.name.trim();
      const chord: Chord = {
        ...newChord,
        name: chordName
      };
      onChordsChange([...safeChords, chord]);
      setNewChord({
        name: '',
        type: 'major',
        root: 'C',
        bass: '',
        capo: 0,
        fingering: '',
        diagram: ''
      });
    }
  };

  const updateChord = (index: number, updatedChord: Chord) => {
    const updatedChords = [...safeChords];
    updatedChords[index] = updatedChord;
    onChordsChange(updatedChords);
    setEditingIndex(null);
  };

  const removeChord = (index: number) => {
    const updatedChords = safeChords.filter((_, i) => i !== index);
    onChordsChange(updatedChords);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setNewChord(safeChords[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setNewChord({
      name: '',
      type: 'major',
      root: 'C',
      bass: '',
      capo: 0,
      fingering: '',
      diagram: ''
    });
  };

  const generateChordName = (root: string, type: string, bass?: string) => {
    let chordName = root;
    
    switch (type) {
      case 'major':
        chordName = root;
        break;
      case 'minor':
        chordName = root + 'm';
        break;
      case 'diminished':
        chordName = root + 'dim';
        break;
      case 'augmented':
        chordName = root + 'aug';
        break;
      case 'suspended':
        chordName = root + 'sus';
        break;
      case 'seventh':
        chordName = root + '7';
        break;
      case 'major7':
        chordName = root + 'maj7';
        break;
      case 'minor7':
        chordName = root + 'm7';
        break;
      case 'dim7':
        chordName = root + 'dim7';
        break;
      case 'aug7':
        chordName = root + 'aug7';
        break;
    }
    
    if (bass && bass !== root) {
      chordName += `/${bass}`;
    }
    
    return chordName;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {instrument === 'piano' ? (
              <Piano className="h-5 w-5 mr-2" />
            ) : (
              <Guitar className="h-5 w-5 mr-2" />
            )}
            {instrument === 'piano' ? 'Piano' : 'Guitar'} Chord Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add/Edit Chord Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="chord-name">Chord Name</Label>
              <Input
                id="chord-name"
                value={newChord.name}
                onChange={(e) => setNewChord(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., C, Am, F#m7"
              />
            </div>
            
            <div>
              <Label htmlFor="root">Root Note</Label>
              <Select value={newChord.root} onValueChange={(value) => setNewChord(prev => ({ ...prev, root: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHORD_ROOTS.map(root => (
                    <SelectItem key={root} value={root}>{root}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Chord Type</Label>
              <Select value={newChord.type} onValueChange={(value) => setNewChord(prev => ({ ...prev, type: value as Chord['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHORD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bass">Bass Note (Optional)</Label>
              <Select value={newChord.bass || ''} onValueChange={(value) => setNewChord(prev => ({ ...prev, bass: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Same as root" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Same as root</SelectItem>
                  {CHORD_ROOTS.map(root => (
                    <SelectItem key={root} value={root}>{root}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {instrument === 'guitar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capo">Capo Position</Label>
                <Input
                  id="capo"
                  type="number"
                  min="0"
                  max="12"
                  value={newChord.capo || 0}
                  onChange={(e) => setNewChord(prev => ({ ...prev, capo: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="fingering">Fingering</Label>
                <Input
                  id="fingering"
                  value={newChord.fingering || ''}
                  onChange={(e) => setNewChord(prev => ({ ...prev, fingering: e.target.value }))}
                  placeholder="e.g., 032010"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {editingIndex !== null ? (
              <>
                <Button onClick={() => updateChord(editingIndex, newChord)}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Chord
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={addChord}>
                <Plus className="h-4 w-4 mr-2" />
                Add Chord
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chord List */}
      <Card>
        <CardHeader>
          <CardTitle>Chord Collection</CardTitle>
        </CardHeader>
        <CardContent>
          {safeChords.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No chords added yet. Add your first chord above.
            </p>
          ) : (
            <div className="space-y-2">
              {safeChords.map((chord, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {chord.name}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      <span className="capitalize">{chord.type}</span>
                      {chord.bass && chord.bass !== chord.root && (
                        <span> / {chord.bass}</span>
                      )}
                      {instrument === 'guitar' && chord.capo && chord.capo > 0 && (
                        <span> (Capo {chord.capo})</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeChord(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
