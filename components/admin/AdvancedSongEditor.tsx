'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertChordArray, transposeChord as transposeChordUtil, getSemitoneIndex, frenchToEnglishChord, englishToFrenchChord } from '@/lib/chord-utils';
import { Interval } from 'tonal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Minimize,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Move,
  GripVertical,
  Lock,
  Unlock,
  Star,
  Heart,
  Share2,
  MessageSquare,
  Clock,
  Calendar,
  Tag,
  Folder,
  FileText,
  Image,
  Video,
  Mic,
  MicOff,
  Headphones,
  Radio,
  Disc3,
  Disc2,
  Disc,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react';

interface Chord {
  name: string;
  position: number;
  line: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'pre-chorus' | 'interlude';
  label: string;
  content: string;
  chords: Chord[];
  id: string;
  order: number;
}

interface SongData {
  id: string;
  title: string;
  artist: string;
  key: string;
  originalKey?: string; // Original key when song was first created
  tempo: number;
  timeSignature: string;
  sections: SongSection[];
  version: number;
  lastSaved: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  genre: string;
  mood: string;
  language: string;
}

// Base chords in English (stored internally as English)
const commonChordsEnglish = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm',
  'C7', 'C#7', 'Db7', 'D7', 'D#7', 'Eb7', 'E7', 'F7', 'F#7', 'Gb7', 'G7', 'G#7', 'Ab7', 'A7', 'A#7', 'Bb7', 'B7',
  'Cmaj7', 'C#maj7', 'Dbmaj7', 'Dmaj7', 'D#maj7', 'Ebmaj7', 'Emaj7', 'Fmaj7', 'F#maj7', 'Gbmaj7', 'Gmaj7', 'G#maj7', 'Abmaj7', 'Amaj7', 'A#maj7', 'Bbmaj7', 'Bmaj7',
  'Cm7', 'C#m7', 'Dbm7', 'Dm7', 'D#m7', 'Ebm7', 'Em7', 'Fm7', 'F#m7', 'Gbm7', 'Gm7', 'G#m7', 'Abm7', 'Am7', 'A#m7', 'Bbm7', 'Bm7',
  'Csus2', 'Csus4', 'Cadd9', 'Cdim', 'Caug', 'C6', 'C9', 'C11', 'C13', 'Cmaj9', 'Cm9', 'C7sus4', 'C7#5', 'C7b5'
];

const chordColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#DC2626', '#7C3AED'
];

const sectionTypes = [
  { type: 'intro', label: 'Intro', icon: Play },
  { type: 'verse', label: 'Verse', icon: Type },
  { type: 'pre-chorus', label: 'Pre-Chorus', icon: ChevronDown },
  { type: 'chorus', label: 'Chorus', icon: Music },
  { type: 'bridge', label: 'Bridge', icon: Move },
  { type: 'interlude', label: 'Interlude', icon: Pause },
  { type: 'outro', label: 'Outro', icon: SkipForward }
];

export const AdvancedSongEditor = ({ songId }: { songId: string }) => {
  const { language } = useLanguage();
  
  const [songData, setSongData] = useState<SongData>({
    id: songId,
    title: '',
    artist: '',
    key: 'C',
    originalKey: 'C', // Initialize original key
    tempo: 120,
    timeSignature: '4/4',
    sections: [],
    version: 1,
    lastSaved: new Date().toISOString(),
    tags: [],
    difficulty: 'beginner',
    genre: '',
    mood: '',
    language: 'en'
  });
  
  // Get chords in current language
  const commonChords = React.useMemo(() => {
    return convertChordArray(commonChordsEnglish, language);
  }, [language]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chordValidation, setChordValidation] = useState(true);
  const [showChordLibrary, setShowChordLibrary] = useState(false);
  const [selectedChordColor, setSelectedChordColor] = useState('#3B82F6');
  const [chordSize, setChordSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [chordBold, setChordBold] = useState(false);
  const [chordItalic, setChordItalic] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const chordInputRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Load song data - only on mount or when songId changes
  useEffect(() => {
    if (songId && songId !== '{songId}') {
      loadSongData();
    }
  }, [songId]);

  // Auto-save functionality - disabled by default for better performance
  useEffect(() => {
    if (autoSave && songData.title) {
      autoSaveRef.current = setInterval(() => {
        saveSong();
      }, 60000); // Changed to 60s for better performance
    }
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [autoSave]); // Removed songData dependency to prevent constant re-renders

  // Update chords display when language changes
  useEffect(() => {
    if (editorRef.current && songData.sections && songData.sections.length > 0) {
      const currentContent = editorRef.current.innerHTML;
      if (currentContent) {
        editorRef.current.innerHTML = convertChordsToDisplayLanguage(currentContent);
      }
    }
  }, [language]);

  const loadSongData = async () => {
    if (!songId || songId === '{songId}') {
      setLoadError('Invalid song ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log('Loading song with ID:', songId);
      
      const response = await fetch(`/api/songs/${songId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load song: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const song = responseData.song || responseData;
      
      console.log('Song data loaded:', JSON.stringify(song, null, 2));
      console.log('Song lyrics:', song.lyrics);
      console.log('Song lyrics type:', typeof song.lyrics);
      
      // Transform database song to editor format - with extra safety
      // Use original_key if available, otherwise use key_signature (set original_key for new songs)
      const originalKey = song?.original_key || song?.key_signature || 'C';
      const currentKey = song?.key_signature || 'C';
      
      const transformedData: SongData = {
        id: song?.id || songId,
        title: song?.title || 'Untitled',
        artist: song?.artists?.name || song?.artist || 'Unknown Artist',
        key: currentKey, // Current key (may be transposed)
        originalKey: originalKey, // Store original key separately
        tempo: parseInt(song?.tempo) || 120,
        timeSignature: song?.time_signature || '4/4',
        sections: [],  // Will be populated below
        version: parseInt(song?.version) || 1,
        lastSaved: song?.updated_at || new Date().toISOString(),
        tags: Array.isArray(song?.tags) ? song.tags : [],
        difficulty: song?.difficulty || 'beginner',
        genre: song?.genre || '',
        mood: song?.mood || '',
        language: song?.language || 'en'
      };
      
      console.log('Transformed data before sections:', JSON.stringify(transformedData, null, 2));
      
      // Parse lyrics and chords if they exist
      if (song.lyrics) {
        // Try to parse as sections
        try {
          const sections = typeof song.lyrics === 'string' ? JSON.parse(song.lyrics) : song.lyrics;
          if (Array.isArray(sections) && sections.length > 0) {
            // Validate each section has required properties
            transformedData.sections = sections.map((section, idx) => ({
              type: section.type || 'verse',
              label: section.label || `Section ${idx + 1}`,
              content: section.content || '',
              chords: Array.isArray(section.chords) ? section.chords : [],
              id: section.id || `section-${Date.now()}-${idx}`,
              order: typeof section.order === 'number' ? section.order : idx
            }));
          } else {
            // If not valid array, create verse from lyrics string
            transformedData.sections = [{
              type: 'verse',
              label: 'Verse 1',
              content: typeof song.lyrics === 'string' ? song.lyrics : '',
              chords: [],
              id: `section-${Date.now()}`,
              order: 0
            }];
          }
        } catch (error) {
          console.error('Error parsing lyrics:', error);
          // If parsing fails, create a single verse section
          transformedData.sections = [{
            type: 'verse',
            label: 'Verse 1',
            content: typeof song.lyrics === 'string' ? song.lyrics : '',
            chords: [],
            id: `section-${Date.now()}`,
            order: 0
          }];
        }
      }
      
      // Ensure we always have at least one section
      if (!Array.isArray(transformedData.sections) || transformedData.sections.length === 0) {
        console.log('No sections found, creating default section');
        transformedData.sections = [{
          type: 'verse',
          label: 'Verse 1',
          content: '',
          chords: [],
          id: `section-${Date.now()}`,
          order: 0
        }];
      }
      
      console.log('Final transformed data with sections:', JSON.stringify(transformedData, null, 2));
      console.log('Sections array is:', Array.isArray(transformedData.sections) ? 'ARRAY' : 'NOT ARRAY');
      console.log('Sections length:', transformedData.sections?.length);
      
      // Convert chords in sections content to admin's language for display
      if (transformedData.sections && transformedData.sections.length > 0) {
        transformedData.sections = transformedData.sections.map(section => ({
          ...section,
          content: convertChordsToDisplayLanguage(section.content)
        }));
      }
      
      // Update state safely
      try {
        setSongData(transformedData);
        setVersionHistory([transformedData]);
        console.log('State updated successfully');
      } catch (stateError) {
        console.error('Error setting state:', stateError);
        throw stateError;
      }
      
      // Update editor content with converted chords
      if (editorRef.current && transformedData.sections && transformedData.sections.length > 0) {
        editorRef.current.innerHTML = transformedData.sections[0].content || '';
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading song:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load song');
      setIsLoading(false);
    }
  };

  // Convert chords in HTML to admin's language for display
  const convertChordsToDisplayLanguage = (htmlContent: string): string => {
    if (!htmlContent) return htmlContent;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all chord elements
    const chordElements = tempDiv.querySelectorAll('.chord-marker, .chord');
    
    chordElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      let englishChord: string | null = null;
      
      // Priority: use dataset.chord if available (always in English)
      if (htmlElement.dataset.chord) {
        englishChord = htmlElement.dataset.chord;
      } else {
        // Extract from textContent and convert to English if needed
        const chordText = htmlElement.textContent || '';
        const chordName = chordText.replace(/\[|\]/g, '').trim();
        
        // Check if it's French and convert to English
        const frenchNotes = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
        const isFrench = frenchNotes.some(note => chordName.startsWith(note));
        
        if (isFrench) {
          englishChord = frenchToEnglishChord(chordName);
        } else {
          englishChord = chordName; // Already in English
        }
      }
      
      if (englishChord) {
        // Ensure dataset.chord is set to English (for storage)
        htmlElement.dataset.chord = englishChord;
        // Update textContent to admin's language for display
        const displayChord = language === 'fr' 
          ? englishToFrenchChord(englishChord)
          : englishChord;
        htmlElement.textContent = `[${displayChord}]`;
      }
    });
    
    return tempDiv.innerHTML;
  };

  // Normalize chords in HTML to English before saving
  const normalizeChordsToEnglish = (htmlContent: string): string => {
    if (!htmlContent) return htmlContent;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all chord elements
    const chordElements = tempDiv.querySelectorAll('.chord-marker, .chord');
    
    chordElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      let englishChord: string | null = null;
      
      // Priority: use dataset.chord if available (always in English)
      if (htmlElement.dataset.chord) {
        englishChord = htmlElement.dataset.chord;
      } else {
        // Extract from textContent and convert to English if needed
        const chordText = htmlElement.textContent || '';
        const chordName = chordText.replace(/\[|\]/g, '').trim();
        
        // Check if it's French and convert to English
        const frenchNotes = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
        const isFrench = frenchNotes.some(note => chordName.startsWith(note));
        
        if (isFrench) {
          englishChord = frenchToEnglishChord(chordName);
        } else {
          englishChord = chordName; // Already in English
        }
      }
      
      if (englishChord) {
        // Ensure dataset.chord is set to English
        htmlElement.dataset.chord = englishChord;
        // Update textContent to English for storage (will be converted on display)
        htmlElement.textContent = `[${englishChord}]`;
      }
    });
    
    return tempDiv.innerHTML;
  };

  const saveSong = async () => {
    try {
      // Get current editor content and normalize chords to English
      let editorContent = '';
      if (editorRef.current) {
        // Normalize all chords to English before saving
        editorContent = normalizeChordsToEnglish(editorRef.current.innerHTML);
      }
      
      const updatedSong = {
        ...songData,
        version: songData.version + 1,
        lastSaved: new Date().toISOString()
      };
      
      // If we have normalized editor content, update the sections
      if (editorContent && updatedSong.sections && updatedSong.sections.length > 0) {
        // Update the first section's content with normalized HTML
        updatedSong.sections[0].content = editorContent;
      }
      
      setSongData(updatedSong);
      setVersionHistory(prev => [updatedSong, ...prev.slice(0, 9)]);
      
      // Transform editor format to database format
      // Store original_key on first save, keep key_signature as current transposed key
      const dbFormat = {
        title: updatedSong.title,
        artist: updatedSong.artist,
        key: updatedSong.key, // Current transposed key
        original_key: updatedSong.originalKey || updatedSong.key, // Original key (set on first save)
        bpm: updatedSong.tempo,
        difficulty: updatedSong.difficulty,
        lyrics: editorContent || JSON.stringify(updatedSong.sections), // Use normalized HTML
        chords: JSON.stringify(updatedSong.sections.flatMap(s => s.chords)),
        genre: updatedSong.genre,
        mood: updatedSong.mood,
        language: updatedSong.language
      };
      
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbFormat)
      });
      
      if (response.ok) {
        console.log('Song saved successfully');
      }
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

  const validateChord = (chordName: string): boolean => {
    // Convert to English for validation (chords stored in English)
    const englishChord = language === 'fr' ? frenchToEnglishChord(chordName) : chordName;
    return commonChordsEnglish.includes(englishChord);
  };

  // Save cursor position when editor loses focus (e.g., when clicking chord buttons)
  const saveEditorRange = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Check if range is within editor
      if (range.commonAncestorContainer === editorRef.current || 
          editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    } else {
      // No selection, save cursor at end of editor
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      savedRangeRef.current = range;
    }
  };

  const insertChord = (chordName: string) => {
    // Store chord in English internally (for database consistency)
    const englishChord = language === 'fr' ? frenchToEnglishChord(chordName) : chordName;
    
    // Display in admin's language for editing
    const displayChord = language === 'fr' ? englishToFrenchChord(englishChord) : englishChord;
    const chordText = `[${displayChord}]`;
    
    // Find the active/focused textarea in sections
    const activeElement = document.activeElement;
    let targetTextarea: HTMLTextAreaElement | null = null;
    let targetSectionIndex = currentSection;
    
    // Check if active element is a textarea in our editor
    if (activeElement instanceof HTMLTextAreaElement) {
      // Check if it's within our editor sections
      const sectionContainer = activeElement.closest('.border.rounded-lg');
      if (sectionContainer) {
        targetTextarea = activeElement;
        // Find which section this textarea belongs to
        const sections = document.querySelectorAll('.border.rounded-lg');
        sections.forEach((section, index) => {
          if (section === sectionContainer) {
            targetSectionIndex = index;
          }
        });
      }
    }
    
    // If no active textarea, use the current section's textarea or first section
    if (!targetTextarea && songData.sections && songData.sections.length > 0) {
      const sectionElements = document.querySelectorAll('textarea');
      if (sectionElements.length > targetSectionIndex) {
        targetTextarea = sectionElements[targetSectionIndex] as HTMLTextAreaElement;
      } else if (sectionElements.length > 0) {
        targetTextarea = sectionElements[0] as HTMLTextAreaElement;
        targetSectionIndex = 0;
      }
    }
    
    if (targetTextarea && songData.sections && songData.sections.length > targetSectionIndex) {
      // Get cursor position in textarea
      const start = targetTextarea.selectionStart;
      const end = targetTextarea.selectionEnd;
      const textBefore = targetTextarea.value.substring(0, start);
      const textAfter = targetTextarea.value.substring(end);
      
      // Insert chord at cursor position
      const newContent = textBefore + chordText + textAfter;
      
      // Update the section content
      const newSections = [...songData.sections];
      newSections[targetSectionIndex] = {
        ...newSections[targetSectionIndex],
        content: newContent
      };
      setSongData(prev => ({ ...prev, sections: newSections }));
      
      // Restore cursor position after the inserted chord
      setTimeout(() => {
        targetTextarea?.focus();
        const newCursorPos = start + chordText.length;
        targetTextarea?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
      
      // Clear chord input
      setSelectedChord('');
      setChordSuggestions([]);
    } else {
      // Fallback: If we can't find a textarea, just add chord text to current section
      if (songData.sections && songData.sections.length > currentSection) {
        const newSections = [...songData.sections];
        newSections[currentSection] = {
          ...newSections[currentSection],
          content: (newSections[currentSection].content || '') + chordText
        };
        setSongData(prev => ({ ...prev, sections: newSections }));
        
        setSelectedChord('');
        setChordSuggestions([]);
      }
    }
  };

  const transposeChords = (targetKeyOrSemitones?: string | number) => {
    if (!editorRef.current) return;
    
    // Calculate semitones based on target key or semitone offset
    let semitones = 0;
    
    if (typeof targetKeyOrSemitones === 'string') {
      // Called with a target key (e.g., "D#")
      // Always transpose from the ORIGINAL key to the target key
      // This allows transposing from any key to any key (e.g., D to F)
      const originalKey = songData.originalKey || songData.key || 'C';
      const targetKey = targetKeyOrSemitones;
      
      // Use tonal to calculate interval between keys
      try {
        // Convert French keys to English for tonal
        const englishOriginalKey = frenchToEnglishChord(originalKey) || originalKey;
        const englishTargetKey = frenchToEnglishChord(targetKey) || targetKey;
        
        // Calculate interval using tonal (from original to target)
        const interval = Interval.distance(englishOriginalKey, englishTargetKey);
        if (interval) {
          // Convert interval to semitones
          const semitonesFromInterval = Interval.semitones(interval) || 0;
          semitones = semitonesFromInterval;
        } else {
          // Fallback to manual calculation
          const originalIndex = getSemitoneIndex(originalKey);
          const targetIndex = getSemitoneIndex(targetKey);
          semitones = targetIndex - originalIndex;
        }
      } catch (error) {
        console.error('Error calculating interval with tonal:', error);
        // Fallback to manual calculation
        const originalIndex = getSemitoneIndex(originalKey);
        const targetIndex = getSemitoneIndex(targetKey);
        semitones = targetIndex - originalIndex;
      }
      
      // Update current song key (but keep originalKey unchanged)
      setSongData(prev => ({ 
        ...prev, 
        key: targetKey,
        // Ensure originalKey is set if this is first transpose
        originalKey: prev.originalKey || originalKey
      }));
    } else if (typeof targetKeyOrSemitones === 'number') {
      // Called with semitone offset (e.g., -1, 1)
      // Calculate new key from original key + semitone offset
      const originalKey = songData.originalKey || songData.key || 'C';
      const originalIndex = getSemitoneIndex(originalKey);
      const newIndex = (originalIndex + targetKeyOrSemitones + 12) % 12; // Handle negative
      const keys = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
      const newKey = keys.find(k => getSemitoneIndex(k) === newIndex) || 'C';
      
      setSongData(prev => ({ 
        ...prev, 
        key: newKey,
        originalKey: prev.originalKey || originalKey
      }));
      
      semitones = targetKeyOrSemitones;
    }
    
    if (semitones === 0 && typeof targetKeyOrSemitones !== 'number') return; // No change needed
    
    const chordElements = editorRef.current.querySelectorAll('.chord-marker');
    chordElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const chordName = htmlElement.dataset.chord;
      if (chordName) {
        // Transpose the chord (chordName is in English)
        const transposedChord = transposeChordUtil(chordName, semitones);
        
        // Update stored chord (English)
        htmlElement.dataset.chord = transposedChord;
        
        // Display in admin's language
        const displayChord = language === 'fr' 
          ? englishToFrenchChord(transposedChord)
          : transposedChord;
        
        htmlElement.textContent = `[${displayChord}]`;
        
        // Re-validate chord
        if (chordValidation && !validateChord(transposedChord)) {
          htmlElement.style.borderColor = '#EF4444';
          htmlElement.style.backgroundColor = '#FEF2F2';
        } else {
          htmlElement.style.borderColor = `${selectedChordColor}40`;
          htmlElement.style.backgroundColor = `${selectedChordColor}20`;
        }
      }
    });
    
    if (typeof targetKeyOrSemitones === 'string') {
      setTransposeAmount(semitones);
    } else {
      setTransposeAmount(transposeAmount + semitones);
    }
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
        case 'f':
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
      }
    }
  };

  const exportSong = (format: 'text' | 'pdf' | 'json' | 'xml') => {
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
      case 'xml':
        const xmlContent = generateXML(songData);
        downloadFile(xmlContent, `${songData.title}.xml`, 'application/xml');
        break;
      case 'pdf':
        // PDF export would require a library like jsPDF
        console.log('PDF export not implemented yet');
        break;
    }
  };

  const generateXML = (song: SongData): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<song>
  <title>${song.title}</title>
  <artist>${song.artist}</artist>
  <key>${song.key}</key>
  <tempo>${song.tempo}</tempo>
  <timeSignature>${song.timeSignature}</timeSignature>
  <sections>
    ${song.sections.map(section => `
    <section type="${section.type}" label="${section.label}">
      <content><![CDATA[${section.content}]]></content>
    </section>`).join('')}
  </sections>
</song>`;
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
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
      content: '',
      chords: [],
      id: `section-${Date.now()}`,
      order: songData.sections.length
    };
    setSongData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const getDeviceClasses = () => {
    if (isFullscreen) return 'fixed inset-0 z-50 bg-background';
    
    switch (deviceView) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-6xl mx-auto';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading song...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6 mb-4">
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Song</h2>
            <p className="text-muted-foreground">{loadError}</p>
          </div>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${getDeviceClasses()}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Advanced Song Editor</h1>
                <p className="text-muted-foreground">
                  Professional chord placement and editing system with advanced features
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
                <Button
                  variant="outline"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  size="sm"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Enhanced Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-4 bg-muted rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowChordPanel(!showChordPanel)}>
                  <Music className="h-4 w-4 mr-2" />
                  Chords
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowChordLibrary(!showChordLibrary)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Library
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => transposeChords(-1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2 min-w-[40px] text-center">{transposeAmount}</span>
                <Button variant="outline" size="sm" onClick={() => transposeChords(1)}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Select
                  value={songData.key || 'C'}
                  onValueChange={(newKey) => transposeChords(newKey)}
                >
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'].map(key => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => {
                  setTransposeAmount(0);
                  transposeChords(songData.key || 'C');
                }}>
                  <RotateCcw className="h-4 w-4" />
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
                <Button variant="outline" size="sm">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <AlignRight className="h-4 w-4" />
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
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Song Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={songData.title}
                  onChange={(e) => setSongData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Song title"
                />
              </div>
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={songData.artist}
                  onChange={(e) => setSongData(prev => ({ ...prev, artist: e.target.value }))}
                  placeholder="Artist name"
                />
              </div>
              <div>
                <Label htmlFor="key">Key</Label>
                <select
                  id="key"
                  value={songData.key}
                  onChange={(e) => setSongData(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'].map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="tempo">Tempo (BPM)</Label>
                <Input
                  id="tempo"
                  type="number"
                  value={songData.tempo}
                  onChange={(e) => setSongData(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                  placeholder="120"
                />
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
                        {isEditMode ? 'Edit your song with advanced chord placement' : 'Preview the final formatted output'}
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
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {songData.tempo} BPM
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    ref={editorRef}
                    className="min-h-[600px] p-6 space-y-8"
                  >
                    {!songData?.sections || songData.sections.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No sections yet. Add a section to get started.</p>
                      </div>
                    ) : (
                      (songData?.sections || []).map((section, index) => (
                        <div key={section.id} className="border rounded-lg p-4 bg-card">
                          <div className="flex items-center justify-between mb-4">
                            <Input
                              value={section.label}
                              onChange={(e) => {
                                const newSections = [...songData.sections];
                                newSections[index].label = e.target.value;
                                setSongData(prev => ({ ...prev, sections: newSections }));
                              }}
                              className="font-bold text-xl border-0 focus:ring-0 p-0 h-auto"
                              disabled={!isEditMode}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newSections = songData.sections.filter((_, i) => i !== index);
                                setSongData(prev => ({ ...prev, sections: newSections }));
                              }}
                              disabled={!isEditMode}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={section.content}
                            onChange={(e) => {
                              const newSections = [...songData.sections];
                              newSections[index].content = e.target.value;
                              setSongData(prev => ({ ...prev, sections: newSections }));
                            }}
                            onFocus={() => setCurrentSection(index)}
                            onBlur={saveEditorRange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter lyrics here... Use Ctrl+K to insert chords"
                            className="min-h-[200px] font-mono text-base resize-none border-0 focus:ring-0 p-0"
                            disabled={!isEditMode}
                            style={{
                              fontFamily: 'Inter, system-ui, sans-serif',
                              lineHeight: '2',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-4">
              {/* Chord Panel */}
              {showChordPanel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chord Insertion</CardTitle>
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
                      <Label>Chord Styling</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label className="text-xs">Color</Label>
                          <div className="flex gap-1">
                            {chordColors.slice(0, 8).map((color, index) => (
                              <button
                                key={index}
                                className="w-6 h-6 rounded border-2"
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedChordColor(color)}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Size</Label>
                          <select
                            value={chordSize}
                            onChange={(e) => setChordSize(e.target.value as 'small' | 'medium' | 'large')}
                            className="w-full px-2 py-1 text-sm border rounded"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={chordBold ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChordBold(!chordBold)}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={chordItalic ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChordItalic(!chordItalic)}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chord Library */}
              {showChordLibrary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chord Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {commonChords.slice(0, 20).map((chord, index) => (
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
                  </CardContent>
                </Card>
              )}

              {/* Section Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Song Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sectionTypes.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Button
                        key={section.type}
                        variant="outline"
                        size="sm"
                        onClick={() => addSection(section.type as SongSection['type'])}
                        className="w-full justify-start"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        Add {section.label}
                      </Button>
                    );
                  })}
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
                    <FileText className="h-4 w-4 mr-2" />
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
                    onClick={() => exportSong('xml')}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as XML
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
