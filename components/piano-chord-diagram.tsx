"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Download, Printer, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PianoChordDiagramProps {
  chordName: string;
  notes: string[];
  fingers: number[];
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category?: string;
  commonUses?: string[];
  onPlay?: () => void;
  onStop?: () => void;
  isPlaying?: boolean;
}

// Helper function to normalize chord names for the API
const normalizeChordName = (chordName: string): string => {
  // Convert French notation to standard notation
  const frenchToStandard: { [key: string]: string } = {
    'Do': 'C',
    'Do#': 'C#',
    'Ré': 'D',
    'Ré#': 'D#',
    'Ré♭': 'Db',
    'Mi': 'E',
    'Mi♭': 'Eb',
    'Fa': 'F',
    'Fa#': 'F#',
    'Sol': 'G',
    'Sol#': 'G#',
    'Sol♭': 'Gb',
    'La': 'A',
    'La#': 'A#',
    'La♭': 'Ab',
    'Si': 'B',
    'Si♭': 'Bb',
  };

  // Check if it's French notation and convert
  for (const [french, standard] of Object.entries(frenchToStandard)) {
    if (chordName.includes(french)) {
      return chordName.replace(french, standard);
    }
  }

  // Return as-is if already in standard notation
  return chordName;
};

// Function to extract notes from chord name
const extractNotesFromChord = (chordName: string): string[] => {
  // Convert French notation to English first
  const frenchToEnglish: { [key: string]: string } = {
    'Do': 'C', 'Do#': 'C#', 'Ré': 'D', 'Ré#': 'D#', 'Mi': 'E', 
    'Fa': 'F', 'Fa#': 'F#', 'Sol': 'G', 'Sol#': 'G#', 
    'La': 'A', 'La#': 'A#', 'Si': 'B',
    'Ré♭': 'Db', 'Mi♭': 'Eb', 'Sol♭': 'Gb', 'La♭': 'Ab', 'Si♭': 'Bb',
  };
  
  let normalized = chordName;
  for (const [french, english] of Object.entries(frenchToEnglish)) {
    if (chordName.startsWith(french)) {
      normalized = english + chordName.substring(french.length);
      break;
    }
  }
  
  // Remove common chord suffixes to get the root
  const rootMatch = normalized.match(/^([A-G][#b]?)/);
  if (!rootMatch) return [];
  
  const root = rootMatch[1];
  const chordType = normalized.substring(root.length);
  
  // Define semitone intervals for different chord types
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
    '7sus4': [0, 5, 7, 10], // 7th suspended 4th
    '7#5': [0, 4, 8, 10], // 7th sharp 5th
    '7b5': [0, 4, 6, 10], // 7th flat 5th
    'dim7': [0, 3, 6, 9], // Diminished 7th
  };
  
  const intervals = chordIntervals[chordType] || chordIntervals[''];
  
  // Note names in order (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Handle flats
  const flatToSharp: { [key: string]: string } = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };
  
  const rootNote = flatToSharp[root] || root;
  const rootIndex = noteNames.indexOf(rootNote);
  
  if (rootIndex === -1) return [];
  
  // Calculate note positions
  const notes: string[] = [];
  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    notes.push(noteNames[noteIndex]);
  });
  
  return notes;
};

const PianoChordDiagram = ({
  chordName,
  notes: propNotes,
  fingers,
  description,
  difficulty,
  category,
  commonUses = [],
  onPlay,
  onStop,
  isPlaying = false
}: PianoChordDiagramProps) => {
  const { language, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const chordImageRef = useRef<HTMLDivElement>(null);
  const chordSoundRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [chordInitialized, setChordInitialized] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Extract notes from chord name if not provided
  const notes = propNotes && propNotes.length > 0 
    ? propNotes 
    : extractNotesFromChord(chordName);

  // Check if Scales-Chords API is loaded
  useEffect(() => {
    const checkApi = () => {
      if (typeof window === 'undefined') return;
      
      // Check if the script is present
      const script = document.querySelector('script[src*="scales-chords-api.js"]');
      if (!script) {
        // Script not loaded yet, check again
        setTimeout(checkApi, 200);
        return;
      }

      // Wait for the script to load and initialize
      const checkApiReady = () => {
        // The API creates elements with class 'scales_chords_api' and processes them
        // We'll consider it ready when the script tag is present
        setApiReady(true);
      };

      // Check if script has loaded
      if (script.getAttribute('data-loaded')) {
        checkApiReady();
      } else {
        // Wait a bit more for script to execute
        script.addEventListener('load', checkApiReady);
        setTimeout(checkApiReady, 500);
      }
    };
    
    checkApi();
    
    // Also listen for script load event
    if (typeof window !== 'undefined') {
      const script = document.querySelector('script[src*="scales-chords-api.js"]');
      if (script && !script.getAttribute('data-loaded')) {
        script.addEventListener('load', () => {
          script.setAttribute('data-loaded', 'true');
          setApiReady(true);
        });
      }
    }
  }, []);

  // Initialize chord when API is ready or component becomes visible
  useEffect(() => {
    if (!apiReady) return;

    const initializeChord = () => {
      if (!chordImageRef.current || !chordSoundRef.current) return;

      // Clear any existing content
      chordImageRef.current.innerHTML = '';
      chordSoundRef.current.innerHTML = '';

      // Normalize chord name for API
      const normalizedChord = normalizeChordName(chordName);

      // Create piano chord image element using scales-chords.com API format
      const chordImageElement = document.createElement('ins');
      chordImageElement.className = 'scales_chords_api';
      chordImageElement.setAttribute('chord', normalizedChord);
      chordImageElement.setAttribute('instrument', 'piano');
      chordImageElement.setAttribute('output', 'image');
      chordImageElement.setAttribute('width', '300px');
      chordImageElement.setAttribute('height', '150px');
      chordImageElement.setAttribute('nolink', 'true');
      chordImageRef.current.appendChild(chordImageElement);

      // Create piano chord sound element using scales-chords.com API format
      const chordSoundElement = document.createElement('ins');
      chordSoundElement.className = 'scales_chords_api';
      chordSoundElement.setAttribute('chord', normalizedChord);
      chordSoundElement.setAttribute('instrument', 'piano');
      chordSoundElement.setAttribute('output', 'sound');
      chordSoundRef.current.appendChild(chordSoundElement);

      // Trigger API processing
      const triggerApi = () => {
        // Try multiple ways to trigger the API
        if (typeof (window as any).scalesChordsApi !== 'undefined') {
          (window as any).scalesChordsApi?.process?.();
        }
        
        // Alternative: dispatch a custom event
        const event = new CustomEvent('scalesChordsApiReady');
        window.dispatchEvent(event);

        // Force re-processing after a delay
        setTimeout(() => {
          if (typeof (window as any).scalesChordsApi !== 'undefined') {
            (window as any).scalesChordsApi?.process?.();
          }
        }, 500);
      };

      // Wait a bit for elements to be in DOM, then trigger
      setTimeout(() => {
        triggerApi();
        // After API processes, find the audio element
        setTimeout(() => {
          findAudioElement();
        }, 600);
      }, 100);
      setTimeout(() => {
        triggerApi();
        setTimeout(() => {
          findAudioElement();
        }, 600);
      }, 500);
      setTimeout(() => {
        triggerApi();
        setTimeout(() => {
          findAudioElement();
        }, 600);
      }, 1000);

      setChordInitialized(true);
    };

    // Function to find and store the audio element
    const findAudioElement = (): boolean => {
      if (!chordSoundRef.current) return false;
      
      // Look for audio element created by scales-chords API (multiple strategies)
      
      // Strategy 1: Direct audio element in sound container
      let audio = chordSoundRef.current.querySelector('audio') as HTMLAudioElement;
      
      // Strategy 2: Audio element in an iframe within the container
      if (!audio) {
        const iframe = chordSoundRef.current.querySelector('iframe');
        if (iframe?.contentDocument) {
          audio = iframe.contentDocument.querySelector('audio') as HTMLAudioElement;
        }
      }
      
      // Strategy 3: Audio element anywhere in document (if scales-chords creates it globally)
      if (!audio) {
        const allAudios = document.querySelectorAll('audio');
        // Find the most recently added audio (likely ours)
        if (allAudios.length > 0) {
          audio = Array.from(allAudios).pop() as HTMLAudioElement;
        }
      }
      
      if (audio && !audioRef.current) {
        audioRef.current = audio;
        
        // Add event listeners to track playback state
        const handlePlay = () => {
          setIsAudioPlaying(true);
          if (onPlay) onPlay();
        };
        const handlePause = () => {
          setIsAudioPlaying(false);
          if (onStop) onStop();
        };
        const handleEnded = () => {
          setIsAudioPlaying(false);
          if (onStop) onStop();
        };
        
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        
        // Store cleanup function
        (audio as any)._cleanup = () => {
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('ended', handleEnded);
        };
        
        return true;
      }
      
      // Alternative: look for anchor/link/button that triggers audio
      if (!audioRef.current) {
        const soundLink = chordSoundRef.current.querySelector('a, button, [onclick], [class*="sound"]') as HTMLElement;
        if (soundLink) {
          // Store the clickable element for fallback use
          (soundLink as any)._isSoundTrigger = true;
        }
      }
      
      return false;
    };
    
    // Periodically check for audio element (up to 5 seconds)
    let checkCount = 0;
    const maxChecks = 10;
    const checkInterval = setInterval(() => {
      const found = findAudioElement();
      if (found || checkCount >= maxChecks) {
        clearInterval(checkInterval);
      }
      checkCount++;
    }, 500);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(checkInterval);
    };

    // Use Intersection Observer to initialize when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!chordInitialized) {
              initializeChord();
            } else {
              // Re-trigger API even if already initialized (for tab switches)
              setTimeout(() => {
                if (typeof (window as any).scalesChordsApi !== 'undefined') {
                  (window as any).scalesChordsApi?.process?.();
                }
              }, 100);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe the container
    if (containerRef.current) {
      observer.observe(containerRef.current as HTMLDivElement);
    }

    // Also try to initialize immediately if not already initialized
    if (!chordInitialized) {
      initializeChord();
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
    };
  }, [apiReady, chordName, chordInitialized]);

  // Re-initialize when chord name changes
  useEffect(() => {
    setChordInitialized(false);
    setIsAudioPlaying(false);
    
    // Cleanup previous audio listeners
    if (audioRef.current && (audioRef.current as any)._cleanup) {
      (audioRef.current as any)._cleanup();
      audioRef.current = null;
    }
  }, [chordName]);
  
  // Periodic check for audio element after component mounts
  useEffect(() => {
    if (!chordInitialized) return;
    
    const interval = setInterval(() => {
      if (chordSoundRef.current && !audioRef.current) {
        const audio = chordSoundRef.current.querySelector('audio') as HTMLAudioElement;
        if (audio) {
          audioRef.current = audio;
          
          const handlePlay = () => {
            setIsAudioPlaying(true);
            if (onPlay) onPlay();
          };
          const handlePause = () => {
            setIsAudioPlaying(false);
            if (onStop) onStop();
          };
          const handleEnded = () => {
            setIsAudioPlaying(false);
            if (onStop) onStop();
          };
          
          audio.addEventListener('play', handlePlay);
          audio.addEventListener('pause', handlePause);
          audio.addEventListener('ended', handleEnded);
          
          (audio as any)._cleanup = () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
          };
        }
      }
    }, 1000);
    
    // Stop checking after 10 seconds
    const timeout = setTimeout(() => clearInterval(interval), 10000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [chordInitialized, onPlay, onStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current && (audioRef.current as any)._cleanup) {
        (audioRef.current as any)._cleanup();
      }
    };
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return t('chord.easy');
      case 'Medium': return t('chord.medium');
      case 'Hard': return t('chord.hard');
      default: return difficulty;
    }
  };

  // Convert note to display format based on language
  const getDisplayNote = (note: string): string => {
    const noteMap: { [key: string]: { en: string; fr: string } } = {
      'C': { en: 'C', fr: 'Do' },
      'C#': { en: 'C#', fr: 'Do#' },
      'Db': { en: 'Db', fr: 'Ré♭' },
      'D': { en: 'D', fr: 'Ré' },
      'D#': { en: 'D#', fr: 'Ré#' },
      'Eb': { en: 'Eb', fr: 'Mi♭' },
      'E': { en: 'E', fr: 'Mi' },
      'F': { en: 'F', fr: 'Fa' },
      'F#': { en: 'F#', fr: 'Fa#' },
      'Gb': { en: 'Gb', fr: 'Sol♭' },
      'G': { en: 'G', fr: 'Sol' },
      'G#': { en: 'G#', fr: 'Sol#' },
      'Ab': { en: 'Ab', fr: 'La♭' },
      'A': { en: 'A', fr: 'La' },
      'A#': { en: 'A#', fr: 'La#' },
      'Bb': { en: 'Bb', fr: 'Si♭' },
      'B': { en: 'B', fr: 'Si' },
    };
    
    return noteMap[note]?.[language] || note;
  };

  // Define octave notes based on language
  const octaveNotes = language === 'fr' 
    ? ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']
    : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Normalize note names (handle enharmonic equivalents)
  const normalizeNote = (note: string): string => {
    // Handle flats conversion
    const flatToSharp: { [key: string]: string } = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
      'Ré♭': 'Do#', 'Mi♭': 'Ré#', 'Sol♭': 'Fa#', 'La♭': 'Sol#', 'Si♭': 'La#',
    };
    
    // Convert French to English for comparison
    const frenchToEnglish: { [key: string]: string } = {
      'Do': 'C', 'Do#': 'C#', 'Ré': 'D', 'Ré#': 'D#', 'Mi': 'E', 
      'Fa': 'F', 'Fa#': 'F#', 'Sol': 'G', 'Sol#': 'G#', 
      'La': 'A', 'La#': 'A#', 'Si': 'B',
    };
    
    // First check if it's a French note
    if (frenchToEnglish[note]) {
      return frenchToEnglish[note];
    }
    
    // Handle flats
    return flatToSharp[note] || note;
  };

  const isKeyPressed = (displayNote: string): boolean => {
    // Convert display note to English standard for comparison
    const standardNote = normalizeNote(displayNote);
    return notes.some(note => {
      const normalizedNote = normalizeNote(note);
      const normalizedDisplay = normalizeNote(displayNote);
      return normalizedNote === normalizedDisplay || note === standardNote;
    });
  };

  // Black key positions (relative to white keys)
  const blackKeyPositions: { [key: string]: number } = {
    'C#': 35, 'Do#': 35,
    'D#': 85, 'Ré#': 85,
    'F#': 185, 'Fa#': 185,
    'G#': 235, 'Sol#': 235,
    'A#': 285, 'La#': 285,
  };

  const handlePlayPause = () => {
    // If audio is currently playing, pause it
    if (isAudioPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      if (onStop) {
        onStop();
      }
      return;
    }

    // Try to find audio element if not found yet
    if (!audioRef.current) {
      const audio = chordSoundRef.current?.querySelector('audio') as HTMLAudioElement;
      if (audio) {
        audioRef.current = audio;
        
        // Add event listeners
        const handlePlay = () => setIsAudioPlaying(true);
        const handlePause = () => setIsAudioPlaying(false);
        const handleEnded = () => setIsAudioPlaying(false);
        
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        
        (audio as any)._cleanup = () => {
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('ended', handleEnded);
        };
      }
    }

    // If we have an audio element, play it
    if (audioRef.current) {
      // Check if it's already playing
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
        if (onStop) {
          onStop();
        }
        return;
      }
      
      // Play the audio
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Error playing audio:', error);
          setIsAudioPlaying(false);
        });
      }
      return;
    }

    // Fallback: try to click the sound link/button
    setTimeout(() => {
      // Look for any clickable element in the sound container
      const soundButton = chordSoundRef.current?.querySelector('a, button, [onclick], [class*="sound"], [class*="play"]') as HTMLElement;
      if (soundButton) {
        soundButton.click();
        
        // After clicking, try to find the audio element
        const findAudioAfterClick = () => {
          let audio = chordSoundRef.current?.querySelector('audio') as HTMLAudioElement;
          if (!audio) {
            audio = document.querySelector('audio') as HTMLAudioElement;
          }
          
          if (audio && !audioRef.current) {
            audioRef.current = audio;
            
            const handlePlay = () => {
              setIsAudioPlaying(true);
              if (onPlay) onPlay();
            };
            const handlePause = () => {
              setIsAudioPlaying(false);
              if (onStop) onStop();
            };
            const handleEnded = () => {
              setIsAudioPlaying(false);
              if (onStop) onStop();
            };
            
            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('ended', handleEnded);
            
            (audio as any)._cleanup = () => {
              audio.removeEventListener('play', handlePlay);
              audio.removeEventListener('pause', handlePause);
              audio.removeEventListener('ended', handleEnded);
            };
          }
        };
        
        setTimeout(findAudioAfterClick, 300);
        setTimeout(findAudioAfterClick, 600);
        setTimeout(findAudioAfterClick, 1000);
      }
      
      if (onPlay) {
        onPlay();
      }
    }, 100);
  };

  // Sync isPlaying state with actual audio state
  const actualPlayingState = isAudioPlaying || isPlaying;

  return (
    <Card className="w-full" ref={containerRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-center">{chordName}</CardTitle>
            <CardDescription className="text-center mt-1">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(difficulty)}>
              {getDifficultyText(difficulty)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Notes Badge Display - Show only if notes are available */}
        {notes && notes.length > 0 && (
          <div className="mb-1 flex gap-1 flex-wrap justify-center">
            {notes.map(note => (
              <Badge key={note} variant="secondary" className="text-xs px-2 py-0.5">
                {getDisplayNote(note)}
              </Badge>
            ))}
          </div>
        )}

        {/* Scales-Chords API Piano Chord Image */}
        <div 
          ref={chordImageRef} 
          className="mb-2 flex justify-center items-center min-h-[30px]"
          style={{ minHeight: '30px' }}
        >
          {!apiReady && (
            <div className="text-sm text-muted-foreground">Loading chord diagram...</div>
          )}
        </div>

        {/* Scales-Chords API Piano Chord Sound */}
        <div 
          ref={chordSoundRef} 
          className="mb-2 flex justify-center items-center"
        />

        {/* Piano Keyboard SVG with Red Highlighting */}
        <div className="relative inline-block mt-2 w-full">
          <svg width="100%" height="200" viewBox="0 0 350 200" className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg" preserveAspectRatio="xMidYMid meet">
            {/* Draw white keys */}
            {octaveNotes.filter(n => !n.includes('#') && !n.includes('♭')).map((note, idx) => {
              const x = idx * 50;
              const displayNote = getDisplayNote(note);
              const isHighlighted = isKeyPressed(note);
              return (
                <g key={note}>
                  <rect
                    x={x}
                    y="20"
                    width="48"
                    height="150"
                    fill={isHighlighted ? '#dc2626' : '#ffffff'}
                    stroke={isHighlighted ? '#991b1b' : '#d1d5db'}
                    strokeWidth={isHighlighted ? "3" : "1.5"}
                    rx="3"
                    ry="3"
                    className={isHighlighted ? "shadow-lg" : ""}
                  />
                  <text
                    x={x + 24}
                    y="165"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill={isHighlighted ? 'white' : '#1f2937'}
                    className="select-none"
                  >
                    {displayNote}
                  </text>
                  {isHighlighted && (
                    <circle
                      cx={x + 24}
                      cy="85"
                      r="8"
                      fill="#991b1b"
                      opacity="0.9"
                    />
                  )}
                </g>
              );
            })}
            
            {/* Draw black keys */}
            {octaveNotes.filter(n => n.includes('#')).map((note) => {
              const x = blackKeyPositions[note] || 0;
              const displayNote = getDisplayNote(note);
              const isHighlighted = isKeyPressed(note);
              return (
                <g key={note}>
                  <rect
                    x={x}
                    y="20"
                    width="32"
                    height="100"
                    fill={isHighlighted ? '#991b1b' : '#1f2937'}
                    stroke={isHighlighted ? '#7f1d1d' : '#111827'}
                    strokeWidth={isHighlighted ? "2.5" : "1.5"}
                    rx="2"
                    ry="2"
                    className={isHighlighted ? "shadow-xl" : "shadow-md"}
                  />
                  <text
                    x={x + 16}
                    y="105"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="white"
                    className="select-none"
                  >
                    {displayNote}
                  </text>
                  {isHighlighted && (
                    <circle
                      cx={x + 16}
                      cy="60"
                      r="6"
                      fill="#dc2626"
                      opacity="0.95"
                    />
                  )}
                </g>
              );
            })}
            
            {/* Handle flat notes display */}
            {octaveNotes.filter(n => n.includes('♭')).map((note) => {
              // Find corresponding sharp note position
              const flatToSharpPos: { [key: string]: number } = {
                'Ré♭': 35, 'Mi♭': 85, 'Sol♭': 185, 'La♭': 235, 'Si♭': 285,
                'Db': 35, 'Eb': 85, 'Gb': 185, 'Ab': 235, 'Bb': 285,
              };
              const x = flatToSharpPos[note] || 0;
              const displayNote = getDisplayNote(note);
              const isHighlighted = isKeyPressed(note);
              return (
                <g key={note}>
                  <rect
                    x={x}
                    y="20"
                    width="32"
                    height="100"
                    fill={isHighlighted ? '#991b1b' : '#1f2937'}
                    stroke={isHighlighted ? '#7f1d1d' : '#111827'}
                    strokeWidth={isHighlighted ? "2.5" : "1.5"}
                    rx="2"
                    ry="2"
                    className={isHighlighted ? "shadow-xl" : "shadow-md"}
                  />
                  <text
                    x={x + 16}
                    y="105"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="white"
                    className="select-none"
                  >
                    {displayNote}
                  </text>
                  {isHighlighted && (
                    <circle
                      cx={x + 16}
                      cy="60"
                      r="6"
                      fill="#dc2626"
                      opacity="0.95"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Chord Details */}
        <div className="w-full mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{chordName}</h3>
            {category && <Badge variant="outline">{category}</Badge>}
          </div>
          
          <p className="text-muted-foreground text-sm">{description}</p>
          
          {commonUses && commonUses.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm">{t('chord.commonUses')}:</h4>
              <div className="flex flex-wrap gap-2">
                {commonUses.map((use, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">{use}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PianoChordDiagram;
