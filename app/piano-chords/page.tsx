"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Music, 
  Search, 
  Filter, 
  Piano,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import PianoChordDiagram from "@/components/piano-chord-diagram";
import Link from "next/link";

interface ChordDiagram {
  name: string;
  frets: number[];
  fingers: number[];
  barre?: number;
  capo?: number;
  description: string;
}

interface PianoChord {
  name: string;
  notes: string[];
  fingers: number[];
  description: string;
  chordId?: string;
  inversion?: number;
}

interface Chord {
  name: string;
  key: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pianoChords: PianoChord[];
  description: string;
  commonUses: string[];
  alternativeNames: string[];
  category: string;
}

const PianoChordsPage = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState(language === 'fr' ? "Toutes les Tonalités" : "All Keys");
  const [selectedDifficulty, setSelectedDifficulty] = useState(language === 'fr' ? "Tous les Niveaux" : "All Levels");
  const [playingChord, setPlayingChord] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chords, setChords] = useState<Chord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update selected filters when language changes
  useEffect(() => {
    setSelectedKey(t('chord.allKeys'));
    setSelectedDifficulty(t('chord.allLevels'));
  }, [language, t]);

  // Reinitialize Scales-Chords API when page loads
  useEffect(() => {
    // Give a small delay for components to render
    setTimeout(() => {
      // Trigger API processing
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('scalesChordsApiReady');
        window.dispatchEvent(event);
        
        // Try to trigger API processing directly
        if (typeof (window as any).scalesChordsApi !== 'undefined') {
          (window as any).scalesChordsApi?.process?.();
        }
        
        // Alternative: find all scales_chords_api elements and force reprocess
        const chordElements = document.querySelectorAll('.scales_chords_api');
        if (chordElements.length > 0) {
          // Force API to reprocess by dispatching a custom event
          window.dispatchEvent(new Event('DOMContentLoaded'));
        }
      }
    }, 300);
  }, []);

  // Function to convert chord names to French
  const getChordName = (chordName: string) => {
    if (!chordName) return chordName;
    
    if (language === 'fr') {
      // First check if chord name is already in French (avoid double translation)
      // Order matters: check longer patterns first to avoid partial matches
      // Check "Do" before "D" to avoid splitting "Do" into "D" + "o"
      const frenchNotes = [
        'Do#', 'Do', // Must check Do# before Do
        'Ré#', 'Ré♭', 'Ré', // Must check Ré# and Ré♭ before Ré
        'Mi♭', 'Mi',
        'Fa#', 'Fa',
        'Sol#', 'Sol♭', 'Sol',
        'La#', 'La♭', 'La',
        'Si♭', 'Si'
      ];
      
      for (const frenchNote of frenchNotes) {
        if (chordName.startsWith(frenchNote)) {
          return chordName; // Already in French, return as-is
        }
      }
      
      // Order matters: replace longer patterns first to avoid partial matches
      // Process from longest to shortest to avoid "D" matching inside "D#" or "Do" being split
      const replacements: Array<{ pattern: RegExp; replacement: string }> = [
        { pattern: /^C#/, replacement: 'Do#' },
        { pattern: /^C(?![#b])/, replacement: 'Do' }, // C not followed by # or b - MUST come before D patterns
        { pattern: /^Db/, replacement: 'Ré♭' },
        { pattern: /^D#/, replacement: 'Ré#' },
        { pattern: /^D(?![#b])/, replacement: 'Ré' }, // D not followed by # or b - AFTER C patterns
        { pattern: /^Eb/, replacement: 'Mi♭' },
        { pattern: /^E(?![#b])/, replacement: 'Mi' },
        { pattern: /^F#/, replacement: 'Fa#' },
        { pattern: /^F(?![#b])/, replacement: 'Fa' },
        { pattern: /^Gb/, replacement: 'Sol♭' },
        { pattern: /^G#/, replacement: 'Sol#' },
        { pattern: /^G(?![#b])/, replacement: 'Sol' },
        { pattern: /^Ab/, replacement: 'La♭' },
        { pattern: /^A#/, replacement: 'La#' },
        { pattern: /^A(?![#b])/, replacement: 'La' },
        { pattern: /^Bb/, replacement: 'Si♭' },
        { pattern: /^B(?![#b])/, replacement: 'Si' },
      ];
      
      // Replace chord names in the chord name string (only match at start to avoid issues)
      let frenchChord = chordName;
      replacements.forEach(({ pattern, replacement }) => {
        frenchChord = frenchChord.replace(pattern, replacement);
      });
      return frenchChord;
    }
    return chordName;
  };

  // Generate keys based on language
  const keys = language === 'fr' 
    ? [t('chord.allKeys'), t('piano.key.C'), t('piano.key.C#'), t('piano.key.D'), t('piano.key.D#'), t('piano.key.E'), t('piano.key.F'), t('piano.key.F#'), t('piano.key.G'), t('piano.key.G#'), t('piano.key.A'), t('piano.key.A#'), t('piano.key.B')]
    : [t('chord.allKeys'), t('piano.key.C'), t('piano.key.C#'), t('piano.key.D'), t('piano.key.D#'), t('piano.key.E'), t('piano.key.F'), t('piano.key.F#'), t('piano.key.G'), t('piano.key.G#'), t('piano.key.A'), t('piano.key.A#'), t('piano.key.B')];

  const difficulties = language === 'fr'
    ? [t('chord.allLevels'), t('chord.easy'), t('chord.medium'), t('chord.hard')]
    : [t('chord.allLevels'), t('chord.easy'), t('chord.medium'), t('chord.hard')];

  // Clear cache and fetch fresh data
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Cache cleared');
    }
  };

  // Fetch piano chords from database
  useEffect(() => {
    const fetchPianoChords = async () => {
      console.log('🎹 Fetching piano chords from database...');
      setIsLoading(true);
      
      // Clear cache on first load to ensure fresh data
      await clearCache();

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedKey && selectedKey !== t('chord.allKeys') && selectedKey !== 'All Keys' && selectedKey !== 'Toutes les Tonalités') {
          // Map language-specific key names to English
          const keyMap: { [key: string]: string } = {
            [t('piano.key.C')]: 'C',
            [t('piano.key.C#')]: 'C#',
            [t('piano.key.Db')]: 'Db',
            [t('piano.key.D')]: 'D',
            [t('piano.key.D#')]: 'D#',
            [t('piano.key.Eb')]: 'Eb',
            [t('piano.key.E')]: 'E',
            [t('piano.key.F')]: 'F',
            [t('piano.key.F#')]: 'F#',
            [t('piano.key.Gb')]: 'Gb',
            [t('piano.key.G')]: 'G',
            [t('piano.key.G#')]: 'G#',
            [t('piano.key.Ab')]: 'Ab',
            [t('piano.key.A')]: 'A',
            [t('piano.key.A#')]: 'A#',
            [t('piano.key.Bb')]: 'Bb',
            [t('piano.key.B')]: 'B',
          };
          const englishKey = keyMap[selectedKey] || selectedKey;
          params.append('key', englishKey);
        }
        if (selectedDifficulty && selectedDifficulty !== t('chord.allLevels') && selectedDifficulty !== 'All Levels' && selectedDifficulty !== 'Tous les Niveaux') {
          const difficultyMap: { [key: string]: string } = {
            [t('chord.easy')]: 'Easy',
            [t('chord.medium')]: 'Medium',
            [t('chord.hard')]: 'Hard',
            'Facile': 'Easy',
            'Moyen': 'Medium',
            'Difficile': 'Hard',
          };
          const englishDifficulty = difficultyMap[selectedDifficulty] || selectedDifficulty;
          params.append('difficulty', englishDifficulty);
        }

        // Add language parameter
        params.append('language', language);
        
        const response = await fetch(`/api/piano-chords?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch piano chords');
        }

        const data = await response.json();
        const dbChords = data.chords || [];

        // Normalize chord names to English for comparison (to handle mixed French/English in database)
        const normalizeForComparison = (chordName: string): string => {
          if (!chordName) return chordName;
          
          // Check if it's French notation and convert to English
          // Order matters: check longer patterns first (Do# before Do, Ré# before Ré, etc.)
          const frenchToEnglish: Array<[string, string]> = [
            ['Do#', 'C#'],
            ['Do', 'C'], // Must come after Do# to avoid partial match
            ['Ré#', 'D#'],
            ['Ré♭', 'Db'],
            ['Ré', 'D'], // Must come after Ré# and Ré♭ to avoid partial match
            ['Mi♭', 'Eb'],
            ['Mi', 'E'], // Must come after Mi♭
            ['Fa#', 'F#'],
            ['Fa', 'F'], // Must come after Fa#
            ['Sol#', 'G#'],
            ['Sol♭', 'Gb'],
            ['Sol', 'G'], // Must come after Sol# and Sol♭
            ['La#', 'A#'],
            ['La♭', 'Ab'],
            ['La', 'A'], // Must come after La# and La♭
            ['Si♭', 'Bb'],
            ['Si', 'B'], // Must come after Si♭
          ];
          
          // Check each French note in order (longest first)
          for (const [french, english] of frenchToEnglish) {
            if (chordName.startsWith(french)) {
              return english + chordName.substring(french.length);
            }
          }
          
          // If no French note found, assume it's already in English
          return chordName;
        };

        // Remove duplicates based on normalized chord_name and inversion combination
        const uniqueChordsMap = new Map<string, any>();
        dbChords.forEach((chord: any) => {
          // Normalize root_name and chord_name to English for comparison
          const normalizedRootName = normalizeForComparison(chord.root_name || chord.chord_name);
          const normalizedChordName = normalizeForComparison(chord.chord_name);
          const inversion = chord.inversion ?? 0;
          
          // Create a unique key: normalized_root_name + inversion
          const uniqueKey = `${normalizedRootName}_${inversion}`;
          
          // Keep only the first occurrence (prioritize root position)
          if (!uniqueChordsMap.has(uniqueKey)) {
            uniqueChordsMap.set(uniqueKey, chord);
          } else {
            // If duplicate found, prefer root position (inversion = 0)
            const existing = uniqueChordsMap.get(uniqueKey);
            if (chord.inversion === 0 && existing.inversion !== 0) {
              uniqueChordsMap.set(uniqueKey, chord);
            }
          }
        });

        // Group unique chords by normalized root_name (to show all inversions together)
        const chordGroups = new Map<string, any[]>();
        const processedNormalizedChordNames = new Set<string>();
        
        uniqueChordsMap.forEach((chord: any) => {
          // Normalize chord name for comparison
          const normalizedChordName = normalizeForComparison(chord.chord_name);
          const normalizedRootName = normalizeForComparison(chord.root_name || chord.chord_name);
          
          // Skip if we've already processed this normalized chord name
          if (processedNormalizedChordNames.has(normalizedChordName)) {
            return;
          }
          
          processedNormalizedChordNames.add(normalizedChordName);
          
          // Use normalized root name for grouping (ensures consistent grouping)
          if (!chordGroups.has(normalizedRootName)) {
            chordGroups.set(normalizedRootName, []);
          }
          chordGroups.get(normalizedRootName)!.push(chord);
        });

        // Convert database format to component format and remove duplicate inversions
        const chordsArray: Chord[] = Array.from(chordGroups.entries()).map(([normalizedRootName, chordVariations]) => {
          // Remove duplicate inversions (keep only one per inversion number)
          const uniqueInversions = new Map<number, any>();
          chordVariations.forEach((c: any) => {
            const inversion = c.inversion ?? 0;
            if (!uniqueInversions.has(inversion)) {
              uniqueInversions.set(inversion, c);
            }
          });
          
          // Sort inversions by number
          const sortedVariations = Array.from(uniqueInversions.values()).sort((a, b) => {
            return (a.inversion ?? 0) - (b.inversion ?? 0);
          });

          // Get root position chord (inversion = 0) as primary
          const rootChord = sortedVariations.find((c: any) => c.inversion === 0) || sortedVariations[0];
          
          // Use the ORIGINAL chord_name from API (already in correct language if language=fr)
          // Normalize only for extracting root note for sorting/filtering
          const rootNoteMatch = normalizedRootName.match(/^([A-G][#b]?)/);
          const rootNote = rootNoteMatch ? rootNoteMatch[1] : 'C';
          
          // Get the actual display name from root chord (already in correct language from API)
          const displayName = rootChord.chord_name || normalizedRootName;

          return {
            name: displayName, // Use actual chord_name from API (already in correct language)
            key: rootNote,
            difficulty: (rootChord.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
            pianoChords: sortedVariations.map((c: any) => ({
              name: c.inversion === 0 ? 'Root Position' : 
                    c.inversion === 1 ? 'First Inversion' :
                    c.inversion === 2 ? 'Second Inversion' :
                    c.inversion === 3 ? 'Third Inversion' : 'Inversion',
              notes: c.notes || [],
              fingers: c.finger_positions || [1, 3, 5],
              description: c.description || '', // Already in correct language from API
              chordId: c.id, // Store database ID for reference
              inversion: c.inversion || 0,
            })),
            description: rootChord.description || '', // Already in correct language from API
            commonUses: [],
            alternativeNames: [],
            category: rootChord.chord_type || 'Chord'
          };
        });

        // Sort chords in musical order
        const musicalOrder = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
        chordsArray.sort((a, b) => {
          const aRoot = a.key;
          const bRoot = b.key;
          const aIndex = musicalOrder.indexOf(aRoot);
          const bIndex = musicalOrder.indexOf(bRoot);
          
          if (aIndex !== -1 && bIndex !== -1) {
            if (aIndex !== bIndex) return aIndex - bIndex;
          }
          
          return a.name.localeCompare(b.name);
        });
        
        console.log(`✅ Fetched ${chordsArray.length} piano chord groups from database`);
        setChords(chordsArray);
      } catch (error) {
        console.error('❌ Error fetching chords:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPianoChords();
  }, [selectedKey, selectedDifficulty, t]);

  // Filter chords - only show chords that have piano chords
  const filteredChords = chords.filter(chord => {
    // Only include chords that have piano chords
    if (!chord.pianoChords || chord.pianoChords.length === 0) {
      return false;
    }
    
    const matchesSearch = chord.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chord.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (chord.alternativeNames && chord.alternativeNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                         (chord.commonUses && chord.commonUses.some(use => use.toLowerCase().includes(searchQuery.toLowerCase())));
    
    // Map key names to English root notes for filtering (handles both languages)
    const keyMap: { [key: string]: string } = {
      [t('chord.allKeys')]: 'all',
      [t('piano.key.C')]: 'C',
      [t('piano.key.C#')]: 'C#',
      [t('piano.key.Db')]: 'Db',
      [t('piano.key.D')]: 'D',
      [t('piano.key.D#')]: 'D#',
      [t('piano.key.Eb')]: 'Eb',
      [t('piano.key.E')]: 'E',
      [t('piano.key.F')]: 'F',
      [t('piano.key.F#')]: 'F#',
      [t('piano.key.Gb')]: 'Gb',
      [t('piano.key.G')]: 'G',
      [t('piano.key.G#')]: 'G#',
      [t('piano.key.Ab')]: 'Ab',
      [t('piano.key.A')]: 'A',
      [t('piano.key.A#')]: 'A#',
      [t('piano.key.Bb')]: 'Bb',
      [t('piano.key.B')]: 'B',
      // Legacy support for direct values
      'Toutes les Tonalités': 'all',
      'All Keys': 'all',
      'Do': 'C', 'Do#': 'C#', 'Ré': 'D', 'Ré#': 'D#', 'Mi': 'E',
      'Fa': 'F', 'Fa#': 'F#', 'Sol': 'G', 'Sol#': 'G#',
      'La': 'A', 'La#': 'A#', 'Si': 'B',
    };
    
    const englishKey = keyMap[selectedKey] || selectedKey;
    const matchesKey = englishKey === 'all' || chord.key === englishKey || 
                      (englishKey === 'C#' && (chord.key === 'C#' || chord.name.startsWith('C#'))) ||
                      (englishKey === 'D#' && (chord.key === 'D#' || chord.name.startsWith('D#'))) ||
                      (englishKey === 'F#' && (chord.key === 'F#' || chord.name.startsWith('F#'))) ||
                      (englishKey === 'G#' && (chord.key === 'G#' || chord.name.startsWith('G#'))) ||
                      (englishKey === 'A#' && (chord.key === 'A#' || chord.name.startsWith('A#')));
    
    // Map difficulty names to English (handles both languages)
    const difficultyMap: { [key: string]: string } = {
      [t('chord.allLevels')]: 'all',
      [t('chord.easy')]: 'Easy',
      [t('chord.medium')]: 'Medium',
      [t('chord.hard')]: 'Hard',
      // Legacy support
      'Tous les Niveaux': 'all',
      'All Levels': 'all',
      'Facile': 'Easy',
      'Moyen': 'Medium',
      'Difficile': 'Hard',
    };
    
    const englishDifficulty = difficultyMap[selectedDifficulty] || selectedDifficulty;
    const matchesDifficulty = englishDifficulty === 'all' || chord.difficulty === englishDifficulty;
    
    return matchesSearch && matchesKey && matchesDifficulty;
  });

  const handlePlayChord = (chordName: string) => {
    setPlayingChord(playingChord === chordName ? null : chordName);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t('piano.title')}
            </h1>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('piano.subtitle')}
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Piano className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{filteredChords.length}</div>
                  <div className="text-sm text-muted-foreground">{t('piano.chords')}</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Music className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{t('piano.interactive')}</div>
                  <div className="text-sm text-muted-foreground">{t('piano.diagramsSounds')}</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{t('piano.learn')}</div>
                  <div className="text-sm text-muted-foreground">{t('piano.playPractice')}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('piano.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('piano.filterByKey')} />
                  </SelectTrigger>
                  <SelectContent>
                    {keys.map(key => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('piano.filterByDifficulty')} />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {t('piano.advanced')}
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('piano.category')}</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('piano.allCategories')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('piano.allCategories')}</SelectItem>
                        <SelectItem value="major">{t('piano.major')}</SelectItem>
                        <SelectItem value="minor">{t('piano.minor')}</SelectItem>
                        <SelectItem value="seventh">{t('piano.seventh')}</SelectItem>
                        <SelectItem value="suspended">{t('piano.suspended')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('piano.sortBy')}</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('piano.name')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">{t('piano.name')}</SelectItem>
                        <SelectItem value="difficulty">{t('common.difficulty')}</SelectItem>
                        <SelectItem value="key">{t('common.key')}</SelectItem>
                        <SelectItem value="popularity">{t('piano.popularity')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Chord Display */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">{t('piano.loading')}</p>
            </div>
          ) : filteredChords.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredChords.flatMap((chord) =>
                chord.pianoChords.map((pianoChord, index) => (
                  <PianoChordDiagram
                    key={`${chord.name}-piano-${index}`}
                    chordName={chord.name} // Already in correct language from API (Do, Ré♭m6, etc.)
                    notes={pianoChord.notes}
                    fingers={pianoChord.fingers}
                    description={pianoChord.description} // Already in correct language from API
                    difficulty={chord.difficulty}
                    category={chord.category}
                    commonUses={chord.commonUses}
                    onPlay={() => handlePlayChord(`${chord.name}-piano-${index}`)}
                    onStop={() => setPlayingChord(null)}
                    isPlaying={playingChord === `${chord.name}-piano-${index}`}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{t('piano.noChords')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('piano.tryAdjusting')}
              </p>
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedKey(t('chord.allKeys'));
                  setSelectedDifficulty(t('chord.allLevels'));
                }}
              >
                {t('piano.clearFilters')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Reference */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {t('piano.quickReference')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('piano.essentialProgressions')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t('piano.commonProgressions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>C - Am - F - G</strong> (I - vi - IV - V)</div>
                  <div><strong>G - D - Em - C</strong> (I - V - vi - IV)</div>
                  <div><strong>Am - F - C - G</strong> (vi - IV - I - V)</div>
                  <div><strong>D - A - Bm - G</strong> (I - V - vi - IV)</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Piano className="h-5 w-5" />
                  {t('piano.jazzProgressions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Am7 - D7 - Gmaj7</strong> (ii7 - V7 - I)</div>
                  <div><strong>Cmaj7 - Am7 - Dm7 - G7</strong> (I - vi - ii - V)</div>
                  <div><strong>Em7 - A7 - Dm7 - G7</strong> (iii7 - VI7 - ii7 - V7)</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Piano className="h-5 w-5" />
                  {t('piano.pianoTechniques')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>{t('piano.inversions')}</strong> - Root, 1st, 2nd</div>
                  <div><strong>{t('piano.voicings')}</strong> - {t('piano.openClosed')}</div>
                  <div><strong>{t('piano.progressions')}</strong> - {t('piano.commonPatterns')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PianoChordsPage;

