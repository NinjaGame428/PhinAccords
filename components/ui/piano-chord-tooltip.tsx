'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PianoChordDiagram from '@/components/piano-chord-diagram';

interface PianoChordTooltipProps {
  chordName: string;
  position: { x: number; y: number };
  onClose: () => void;
}

// Helper function to normalize chord names
const normalizeChordName = (chordName: string): string => {
  // Remove brackets if present
  let normalized = chordName.replace(/\[|\]/g, '').trim();
  
  // Convert French notation to standard notation if needed
  const frenchToStandard: { [key: string]: string } = {
    'Do': 'C', 'Do#': 'C#', 'Ré': 'D', 'Ré#': 'D#', 'Ré♭': 'Db',
    'Mi': 'E', 'Mi♭': 'Eb', 'Fa': 'F', 'Fa#': 'F#',
    'Sol': 'G', 'Sol#': 'G#', 'Sol♭': 'Gb',
    'La': 'A', 'La#': 'A#', 'La♭': 'Ab',
    'Si': 'B', 'Si♭': 'Bb',
  };

  for (const [french, standard] of Object.entries(frenchToStandard)) {
    if (normalized.startsWith(french)) {
      normalized = normalized.replace(french, standard);
      break;
    }
  }

  return normalized;
};

// Extract notes from chord name
const extractNotesFromChord = (chordName: string): string[] => {
  const normalized = normalizeChordName(chordName);
  
  // Remove common chord suffixes to get the root
  const rootMatch = normalized.match(/^([A-G][#b]?)/);
  if (!rootMatch) return [];
  
  const root = rootMatch[1];
  const chordType = normalized.substring(root.length);
  
  // Define semitone intervals for different chord types
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = noteNames.indexOf(root) !== -1 ? noteNames.indexOf(root) : 0;
  
  const chordIntervals: { [key: string]: number[] } = {
    '': [0, 4, 7], // Major triad
    'm': [0, 3, 7], // Minor triad
    'dim': [0, 3, 6], // Diminished
    'aug': [0, 4, 8], // Augmented
    'sus2': [0, 2, 7], // Suspended 2nd
    'sus4': [0, 5, 7], // Suspended 4th
    '7': [0, 4, 7, 10], // Dominant 7th
    'maj7': [0, 4, 7, 11], // Major 7th
    'm7': [0, 3, 7, 10], // Minor 7th
    'maj9': [0, 4, 7, 11, 14], // Major 9th
    '9': [0, 4, 7, 10, 14], // Dominant 9th
    'm9': [0, 3, 7, 10, 14], // Minor 9th
    'add9': [0, 4, 7, 14], // Add 9th
    '6': [0, 4, 7, 9], // Major 6th
    'm6': [0, 3, 7, 9], // Minor 6th
  };

  const intervals = chordIntervals[chordType] || chordIntervals[''];
  const notes: string[] = [];
  
  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    notes.push(noteNames[noteIndex]);
  });
  
  return notes;
};

export const PianoChordTooltip: React.FC<PianoChordTooltipProps> = ({ chordName, position, onClose }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pianoChords, setPianoChords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPianoChord = async () => {
      setIsLoading(true);
      try {
        const normalizedName = normalizeChordName(chordName);
        
        // Try to fetch from database first
        const response = await fetch(`/api/piano-chords?chordName=${encodeURIComponent(normalizedName)}`);
        const data = await response.json();
        
        if (data.chords && data.chords.length > 0) {
          // Use chord from database
          const chord = data.chords[0];
          setPianoChords([{
            notes: chord.notes || extractNotesFromChord(chordName),
            fingers: chord.finger_positions || [1, 2, 3, 4, 5],
            description: chord.description || `${normalizedName} chord`,
            difficulty: (chord.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
            category: 'Chord'
          }]);
        } else {
          // Fallback: Generate from chord name
          const notes = extractNotesFromChord(chordName);
          setPianoChords([{
            notes,
            fingers: [1, 2, 3, 4, 5],
            description: `${normalizedName} chord`,
            difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
            category: 'Chord'
          }]);
        }
      } catch (error) {
        console.error('Error fetching piano chord:', error);
        // Fallback: Generate from chord name
        const notes = extractNotesFromChord(chordName);
        setPianoChords([{
          notes,
          fingers: [1, 2, 3, 4, 5],
          description: `${normalizeChordName(chordName)} chord`,
          difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
          category: 'Chord'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPianoChord();
  }, [chordName]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const normalizedChordName = normalizeChordName(chordName);

  if (typeof window === 'undefined') return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-xl border rounded-lg overflow-hidden"
      style={{
        left: `${Math.min(position.x, window.innerWidth - 400)}px`,
        top: `${Math.max(10, position.y - 350)}px`,
        maxWidth: '400px',
        maxHeight: '500px',
      }}
    >
      {isLoading ? (
        <Card className="border-0 shadow-none p-4">
          <CardContent className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading piano chord...</p>
          </CardContent>
        </Card>
      ) : pianoChords.length > 0 ? (
        <div className="max-h-[500px] overflow-y-auto">
          {pianoChords.map((chord, index) => (
            <div key={index} className="p-1">
              <PianoChordDiagram
                chordName={normalizedChordName}
                notes={chord.notes}
                fingers={chord.fingers}
                description={chord.description}
                difficulty={chord.difficulty}
                category={chord.category}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-none p-4">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Piano chord not found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

