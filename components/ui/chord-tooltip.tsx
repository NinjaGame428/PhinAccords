'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ChordTooltipProps {
  chordName: string;
  position: { x: number; y: number };
  onClose: () => void;
}

// Simple chord diagram generator for guitar
const generateChordDiagram = (chordName: string): { frets: number[]; fingers: number[] } => {
  // Basic chord patterns - simplified versions
  const chordPatterns: { [key: string]: { frets: number[]; fingers: number[] } } = {
    'C': { frets: [0, 1, 0, 2, 1, 0], fingers: [0, 1, 0, 2, 0, 0] },
    'C#': { frets: [1, 2, 1, 3, 2, 1], fingers: [1, 2, 1, 3, 2, 1] },
    'D': { frets: [2, 3, 2, 0, 0, 2], fingers: [2, 3, 2, 0, 0, 2] },
    'D#': { frets: [3, 4, 3, 1, 1, 3], fingers: [3, 4, 3, 1, 1, 3] },
    'E': { frets: [0, 0, 1, 2, 2, 0], fingers: [0, 0, 1, 2, 2, 0] },
    'F': { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 3, 1] },
    'F#': { frets: [2, 2, 3, 4, 4, 2], fingers: [2, 2, 3, 4, 4, 2] },
    'G': { frets: [3, 0, 0, 0, 2, 3], fingers: [3, 0, 0, 0, 2, 4] },
    'G#': { frets: [4, 1, 1, 1, 3, 4], fingers: [4, 1, 1, 1, 3, 4] },
    'A': { frets: [0, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    'A#': { frets: [1, 1, 3, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1] },
    'B': { frets: [2, 2, 4, 4, 4, 2], fingers: [2, 2, 3, 4, 5, 2] },
    'Am': { frets: [0, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    'Bm': { frets: [2, 2, 4, 4, 3, 2], fingers: [2, 2, 3, 4, 1, 2] },
    'Cm': { frets: [3, 3, 5, 5, 4, 3], fingers: [3, 3, 4, 5, 2, 3] },
    'Dm': { frets: [1, 0, 0, 2, 3, 1], fingers: [1, 0, 0, 2, 3, 1] },
    'Em': { frets: [0, 0, 0, 2, 2, 0], fingers: [0, 0, 0, 2, 3, 0] },
    'Fm': { frets: [1, 1, 1, 3, 3, 1], fingers: [1, 1, 1, 3, 4, 1] },
  };

  // Extract root note and type
  const normalized = chordName.trim().replace(/\[|\]/g, '');
  const match = normalized.match(/^([A-G][#b]?)(.*)/);
  
  if (!match) {
    return { frets: [0, 0, 0, 0, 0, 0], fingers: [0, 0, 0, 0, 0, 0] };
  }

  const root = match[1];
  const suffix = match[2].toLowerCase();

  // Generate key based on root and suffix
  const key = root + (suffix.includes('m') || suffix.includes('min') ? 'm' : '');
  
  return chordPatterns[key] || { frets: [0, 0, 0, 0, 0, 0], fingers: [0, 0, 0, 0, 0, 0] };
};

export const ChordTooltip: React.FC<ChordTooltipProps> = ({ chordName, position, onClose }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [chordData, setChordData] = useState(generateChordDiagram(chordName));

  useEffect(() => {
    setChordData(generateChordDiagram(chordName));
  }, [chordName]);

  useEffect(() => {
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

  const strings = ['E', 'B', 'G', 'D', 'A', 'E'];
  const frets = chordData.frets;
  const fingers = chordData.fingers;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg border rounded-lg p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 180}px`,
        minWidth: '120px',
      }}
    >
      <Card className="border-0 shadow-none p-0">
        <CardContent className="p-2">
          <div className="text-center mb-2">
            <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
              {chordName.replace(/\[|\]/g, '')}
            </span>
          </div>
          
          {/* Small Guitar Fretboard */}
          <div className="flex flex-col items-center space-y-0.5">
            {strings.map((string, index) => {
              const fret = frets[index];
              const finger = fingers[index];
              const isOpen = fret === 0;
              
              return (
                <div key={string} className="flex items-center space-x-1 text-xs">
                  <span className="w-4 text-center font-semibold">{string}</span>
                  <div className="relative w-16 h-4 border-l-2 border-gray-400">
                    {!isOpen && (
                      <>
                        <div
                          className="absolute rounded-full bg-blue-600 dark:bg-blue-400"
                          style={{
                            left: `${(fret - 1) * 12 + 2}px`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '8px',
                            height: '8px',
                          }}
                        />
                        {finger > 0 && (
                          <span
                            className="absolute text-[8px] font-bold text-white"
                            style={{
                              left: `${(fret - 1) * 12 + 4}px`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            {finger}
                          </span>
                        )}
                      </>
                    )}
                    {isOpen && (
                      <span className="absolute left-0 top-0 text-[10px]">O</span>
                    )}
                    {/* Fret markers */}
                    {[1, 2, 3, 4].map((f) => (
                      <div
                        key={f}
                        className="absolute top-0 bottom-0 w-px bg-gray-300"
                        style={{ left: `${f * 12}px` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

