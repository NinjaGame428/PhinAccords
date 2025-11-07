'use client';

import React, { useRef, useState, useEffect } from 'react';
import './rich-text-editor.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Undo,
  Redo,
  Type,
  Music,
  Minus,
  Plus,
  Palette,
  Type as TypeIcon,
  AlignJustify,
  Tag,
  Repeat,
  Hash,
  FileText,
  Search,
  Replace,
  Copy,
  Layers,
  Zap,
  HelpCircle
} from 'lucide-react';
import { PianoChordTooltip } from './piano-chord-tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { frenchToEnglishChord, englishToFrenchChord } from '@/lib/chord-utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Enter lyrics...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedChord, setSelectedChord] = useState<{ name: string; position: { x: number; y: number } } | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [chordDialogOpen, setChordDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [findReplaceDialogOpen, setFindReplaceDialogOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [capoFret, setCapoFret] = useState(0);
  const [chordProgressionDialogOpen, setChordProgressionDialogOpen] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleChordClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if clicked element is a chord or inside a chord span
    const chordElement = target.closest('.chord');
    
    if (chordElement) {
      e.preventDefault();
      e.stopPropagation();
      
      // Extract chord name from the element
      const chordText = chordElement.textContent || '';
      const chordName = chordText.replace(/\[|\]/g, '').trim();
      
      if (chordName) {
        // Get position for tooltip
        const rect = chordElement.getBoundingClientRect();
        setSelectedChord({
          name: chordName,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.bottom
          }
        });
      }
    }
  };

  // Detect chord selection via text selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    
    // Check if selected text looks like a chord (common patterns)
    const chordPattern = /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|7|9|11|13)?(\d+)?$/i;
    if (chordPattern.test(selectedText)) {
      const containerElement = range.commonAncestorContainer.parentElement;
      if (containerElement) {
        const rect = range.getBoundingClientRect();
        setSelectedChord({
          name: selectedText,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10
          }
        });
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Generate chord options based on language
  const generateChordOptions = (): string[] => {
    // Base chords in English notation (including flats)
    const englishRoots = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    
    // French notation mapping
    const englishToFrench: { [key: string]: string } = {
      'C': 'Do', 'C#': 'Do#', 'Db': 'Ré♭',
      'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mi♭',
      'E': 'Mi',
      'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Sol♭',
      'G': 'Sol', 'G#': 'Sol#', 'Ab': 'La♭',
      'A': 'La', 'A#': 'La#', 'Bb': 'Si♭',
      'B': 'Si'
    };
    
    const roots = language === 'fr'
      ? englishRoots.map(root => englishToFrench[root] || root)
      : englishRoots;
    
    const suffixes = ['', 'm', 'dim', 'aug', 'sus2', 'sus4', '7', 'maj7', 'm7', 'maj9', '9', 'm9', 'add9', '6', 'm6'];
    
    const chords: string[] = [];
    roots.forEach(root => {
      suffixes.forEach(suffix => {
        chords.push(root + suffix);
      });
    });
    
    return chords;
  };

  const chordOptions = generateChordOptions();
  const [chordSearch, setChordSearch] = useState('');

  // Filter chords based on search
  const filteredChordOptions = chordOptions.filter(chord => 
    chord.toLowerCase().includes(chordSearch.toLowerCase())
  );

  // Save cursor position when dialog opens
  const handleChordDialogOpen = (open: boolean) => {
    if (typeof window === 'undefined') {
      setChordDialogOpen(open);
      return;
    }
    
    if (open && editorRef.current) {
      // Save the current selection/range before opening dialog
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      } else {
        // No selection, save cursor at end of editor
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        savedRangeRef.current = range;
      }
    }
    setChordDialogOpen(open);
  };

  const insertChord = (chordName: string) => {
    if (typeof window === 'undefined' || !editorRef.current) return;
    
    // Always store in English (for database consistency)
    // Convert input to English if needed
    const englishChord = chordName.match(/^(Do|Ré|Mi|Fa|Sol|La|Si)/) 
      ? frenchToEnglishChord(chordName) 
      : chordName;
    
    // Display in viewer's language
    const displayChord = language === 'fr' 
      ? englishToFrenchChord(englishChord)
      : englishChord;
    
    // Get saved range or create a new one
    let range: Range;
    const selection = window.getSelection();
    
    if (savedRangeRef.current) {
      // Use saved range
      range = savedRangeRef.current.cloneRange();
    } else if (selection && selection.rangeCount > 0) {
      // Use current selection
      range = selection.getRangeAt(0);
      range.deleteContents();
    } else {
      // Create range at end of editor
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    
    // Create the chord element
    const chordSpan = document.createElement('span');
    chordSpan.className = 'chord-marker';
    chordSpan.setAttribute('data-chord', englishChord);
    chordSpan.style.color = '#3b82f6';
    chordSpan.style.fontWeight = 'bold';
    chordSpan.style.cursor = 'pointer';
    chordSpan.style.backgroundColor = '#dbeafe';
    chordSpan.style.padding = '2px 6px';
    chordSpan.style.borderRadius = '4px';
    chordSpan.style.margin = '0 2px';
    chordSpan.style.border = '1px solid #93c5fd';
    chordSpan.style.display = 'inline-block';
    chordSpan.contentEditable = 'false';
    chordSpan.title = 'Click to view chord diagram';
    chordSpan.textContent = `[${displayChord}]`;
    
    // Insert the chord element at the saved/current position
    try {
      // Make sure range is within editor
      if (range.commonAncestorContainer !== editorRef.current && 
          !editorRef.current.contains(range.commonAncestorContainer)) {
        // Range is outside editor, place at end
        range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
      }
      
      // Insert the chord
      range.deleteContents(); // Remove any selected text
      range.insertNode(chordSpan);
      
      // Move cursor after the inserted chord
      range.setStartAfter(chordSpan);
      range.collapse(true);
      
      // Update selection
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Save the new range position
      savedRangeRef.current = range.cloneRange();
      
    } catch (error) {
      console.error('Error inserting chord:', error);
      // Fallback: insert at end
      const fallbackRange = document.createRange();
      fallbackRange.selectNodeContents(editorRef.current);
      fallbackRange.collapse(false);
      fallbackRange.insertNode(chordSpan);
      savedRangeRef.current = fallbackRange.cloneRange();
    }
    
    // Ensure editor has focus
    editorRef.current.focus();
    
    // Update content
    handleInput();
    
    // Close dialog and clear search
    setChordDialogOpen(false);
    setChordSearch('');
  };

  const formatText = (command: string) => {
    execCommand(command);
  };

  const setAlignment = (align: string) => {
    execCommand('justify' + align);
  };

  const insertList = (ordered: boolean = false) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const setFontSizeCommand = (size: number) => {
    execCommand('fontSize', '3'); // Base size
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        try {
          range.surroundContents(span);
        } catch (e) {
          // If surroundContents fails, use insertNode
          span.appendChild(range.extractContents());
          range.insertNode(span);
        }
        handleInput();
      }
    }
  };

  const increaseFontSize = () => {
    const newSize = fontSize + 2;
    setFontSize(newSize);
    setFontSizeCommand(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(8, fontSize - 2);
    setFontSize(newSize);
    setFontSizeCommand(newSize);
  };

  const setFontFamilyCommand = (family: string) => {
    execCommand('fontName', family);
    setFontFamily(family);
  };

  const setTextColorCommand = (color: string) => {
    execCommand('foreColor', color);
    setTextColor(color);
  };

  const undo = () => {
    execCommand('undo');
  };

  const redo = () => {
    execCommand('redo');
  };

  // Feature 1: Insert Section Marker (Verse, Chorus, Bridge, etc.)
  const insertSectionMarker = (sectionType: string) => {
    const sectionLabels: { [key: string]: { en: string; fr: string } } = {
      intro: { en: 'Intro', fr: 'Intro' },
      verse: { en: 'Verse', fr: 'Couplet' },
      chorus: { en: 'Chorus', fr: 'Refrain' },
      bridge: { en: 'Bridge', fr: 'Pont' },
      outro: { en: 'Outro', fr: 'Outro' },
      preChorus: { en: 'Pre-Chorus', fr: 'Pré-Refrain' },
      tag: { en: 'Tag', fr: 'Tag' },
    };
    
    const label = sectionLabels[sectionType] 
      ? (language === 'fr' ? sectionLabels[sectionType].fr : sectionLabels[sectionType].en)
      : sectionType;
    
    const sectionElement = `<div class="section-marker" style="font-weight: bold; color: #6366f1; margin: 16px 0 8px 0; font-size: ${fontSize + 2}px; border-left: 3px solid #6366f1; padding-left: 8px;">${label}</div>`;
    execCommand('insertHTML', sectionElement);
    setSectionDialogOpen(false);
  };

  // Feature 2: Insert Repeat Marker
  const insertRepeatMarker = (repeatType: 'start' | 'end' | 'x2' | 'x3' | 'x4') => {
    const markers: { [key: string]: string } = {
      start: '‖:',
      end: ':‖',
      x2: '×2',
      x3: '×3',
      x4: '×4',
    };
    
    const marker = markers[repeatType] || '×2';
    const repeatElement = `<span class="repeat-marker" style="font-weight: bold; color: #10b981; font-size: ${fontSize + 4}px; margin: 0 8px;">${marker}</span>`;
    execCommand('insertHTML', repeatElement);
  };

  // Feature 3: Find and Replace
  const handleFind = () => {
    if (typeof window === 'undefined' || !editorRef.current || !findText) return;
    const content = editorRef.current.innerHTML;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    // For now, just highlight - full replace functionality would need more work
    editorRef.current.innerHTML = content.replace(regex, (match) => 
      `<mark style="background-color: #fef08a;">${match}</mark>`
    );
    handleInput();
  };

  const handleReplace = () => {
    if (typeof window === 'undefined' || !editorRef.current || !findText) return;
    const content = editorRef.current.innerHTML;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    editorRef.current.innerHTML = content.replace(regex, replaceText);
    handleInput();
    setFindReplaceDialogOpen(false);
    setFindText('');
    setReplaceText('');
  };

  // Feature 4: Toggle Line Numbers
  useEffect(() => {
    if (typeof window === 'undefined' || !editorRef.current) return;
    if (showLineNumbers) {
      editorRef.current.classList.add('line-numbers');
      const lines = editorRef.current.innerText.split('\n').length;
      editorRef.current.style.counterReset = 'linenumber';
    } else {
      editorRef.current.classList.remove('line-numbers');
    }
  }, [showLineNumbers]);

  // Feature 5: Insert Capo Indicator
  const insertCapoIndicator = () => {
    const capoText = language === 'fr' 
      ? `Capo ${capoFret}`
      : `Capo ${capoFret}`;
    const capoElement = `<div class="capo-indicator" style="font-weight: bold; color: #f59e0b; margin: 8px 0; font-style: italic;">${capoText}</div>`;
    execCommand('insertHTML', capoElement);
  };

  // Feature 6: Insert Common Gospel Chord Progression
  const insertChordProgression = (progression: string) => {
    const progressions: { [key: string]: string[] } = {
      'I-IV-V': ['C', 'F', 'G'],
      'I-vi-IV-V': ['C', 'Am', 'F', 'G'],
      'I-V-vi-IV': ['C', 'G', 'Am', 'F'],
      'vi-IV-I-V': ['Am', 'F', 'C', 'G'],
      'ii-V-I': ['Dm', 'G', 'C'],
      'I-IV-I-V': ['C', 'F', 'C', 'G'],
    };
    
    const chords = progressions[progression] || [];
    const displayChords = chords.map(chord => 
      language === 'fr' ? englishToFrenchChord(chord) : chord
    );
    const progressionElement = `<div class="chord-progression" style="margin: 8px 0; padding: 8px; background: #f3f4f6; border-radius: 4px;"><span style="font-weight: bold; margin-right: 8px;">${progression}:</span>${displayChords.join(' - ')}</div>`;
    execCommand('insertHTML', progressionElement);
    setChordProgressionDialogOpen(false);
  };

  // Feature 7: Export to PDF (placeholder - would need pdf library)
  const exportToPDF = () => {
    if (typeof window === 'undefined' || !editorRef.current) return;
    window.print();
  };

  // Feature 8: Copy formatted text
  const copyFormatted = () => {
    if (typeof window === 'undefined' || !editorRef.current) return;
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      navigator.clipboard.writeText(selection.toString());
    } else {
      navigator.clipboard.writeText(editorRef.current.innerText);
    }
  };

  // Feature 9: Insert Time Signature
  const insertTimeSignature = (timeSig: string) => {
    const timeElement = `<span class="time-signature" style="font-weight: bold; color: #8b5cf6; margin: 0 4px;">${timeSig}</span>`;
    execCommand('insertHTML', timeElement);
  };

  // Feature 10: Insert Tempo/BPM
  const insertTempo = (bpm: number) => {
    const tempoText = language === 'fr' ? `${bpm} BPM` : `${bpm} BPM`;
    const tempoElement = `<span class="tempo-indicator" style="font-weight: bold; color: #ef4444; margin: 0 4px;">${tempoText}</span>`;
    execCommand('insertHTML', tempoElement);
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={undo}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={redo}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment('Left')}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment('Center')}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment('Right')}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertList(false)}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertList(true)}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Font Size Controls */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={decreaseFontSize}
            className="h-8 w-8 p-0"
            title="Decrease font size"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Select
            value={fontSize.toString()}
            onValueChange={(value) => {
              const size = parseInt(value);
              setFontSize(size);
              setFontSizeCommand(size);
            }}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={increaseFontSize}
            className="h-8 w-8 p-0"
            title="Increase font size"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Font Family */}
          <Select
            value={fontFamily}
            onValueChange={setFontFamilyCommand}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Text Color */}
          <div className="relative">
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                const color = e.target.value;
                setTextColor(color);
                setTextColorCommand(color);
              }}
              className="h-8 w-8 cursor-pointer opacity-0 absolute"
              title="Text color"
            />
            <div className="h-8 w-8 border border-gray-300 rounded flex items-center justify-center bg-white">
              <Palette className="h-4 w-4" />
            </div>
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment('Justify')}
            className="h-8 w-8 p-0"
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Feature 1: Section Markers */}
          <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={language === 'fr' ? 'Marqueurs de section' : 'Section Markers'}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Ajouter une section' : 'Add Section'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {['intro', 'verse', 'chorus', 'bridge', 'preChorus', 'outro', 'tag'].map((section) => (
                  <Button key={section} onClick={() => insertSectionMarker(section)} variant="outline">
                    {language === 'fr' 
                      ? section === 'verse' ? 'Couplet' : section === 'chorus' ? 'Refrain' : section === 'bridge' ? 'Pont' : section === 'preChorus' ? 'Pré-Refrain' : section
                      : section.charAt(0).toUpperCase() + section.slice(1)}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Feature 2: Repeat Markers */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={language === 'fr' ? 'Marqueurs de répétition' : 'Repeat Markers'}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Ajouter une répétition' : 'Add Repeat'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {['start', 'end', 'x2', 'x3', 'x4'].map((repeat) => (
                  <Button key={repeat} onClick={() => insertRepeatMarker(repeat as any)} variant="outline">
                    {repeat === 'start' ? '‖:' : repeat === 'end' ? ':‖' : repeat}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Feature 3: Find and Replace */}
          <Dialog open={findReplaceDialogOpen} onOpenChange={setFindReplaceDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={language === 'fr' ? 'Rechercher et remplacer' : 'Find & Replace'}
              >
                <Search className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Rechercher et remplacer' : 'Find & Replace'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Rechercher' : 'Find'}</label>
                  <Input value={findText} onChange={(e) => setFindText(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Remplacer par' : 'Replace with'}</label>
                  <Input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFind} variant="outline">{language === 'fr' ? 'Rechercher' : 'Find'}</Button>
                  <Button onClick={handleReplace}>{language === 'fr' ? 'Remplacer' : 'Replace'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Feature 4: Line Numbers Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`h-8 w-8 p-0 ${showLineNumbers ? 'bg-blue-100' : ''}`}
            title={language === 'fr' ? 'Numéros de ligne' : 'Line Numbers'}
          >
            <Hash className="h-4 w-4" />
          </Button>

          {/* Feature 5: Capo Indicator */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={language === 'fr' ? 'Capodastre' : 'Capo'}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Capodastre' : 'Capo'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">{language === 'fr' ? 'Fret' : 'Fret'}</label>
                  <Select value={capoFret.toString()} onValueChange={(v) => setCapoFret(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((fret) => (
                        <SelectItem key={fret} value={fret.toString()}>{fret}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={insertCapoIndicator}>{language === 'fr' ? 'Insérer' : 'Insert'}</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Feature 6: Chord Progressions */}
          <Dialog open={chordProgressionDialogOpen} onOpenChange={setChordProgressionDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={language === 'fr' ? 'Progressions d\'accords' : 'Chord Progressions'}
              >
                <Zap className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Progressions d\'accords' : 'Chord Progressions'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {['I-IV-V', 'I-vi-IV-V', 'I-V-vi-IV', 'vi-IV-I-V', 'ii-V-I', 'I-IV-I-V'].map((prog) => (
                  <Button key={prog} onClick={() => insertChordProgression(prog)} variant="outline">
                    {prog}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Feature 7: Export/Print */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={exportToPDF}
            className="h-8 w-8 p-0"
            title={language === 'fr' ? 'Exporter/Imprimer' : 'Export/Print'}
          >
            <FileText className="h-4 w-4" />
          </Button>

          {/* Feature 8: Copy */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyFormatted}
            className="h-8 w-8 p-0"
            title={language === 'fr' ? 'Copier' : 'Copy'}
          >
            <Copy className="h-4 w-4" />
          </Button>

          {/* Feature 9: Time Signature */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={language === 'fr' ? 'Signature rythmique' : 'Time Signature'}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Signature rythmique' : 'Time Signature'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {['4/4', '3/4', '2/4', '6/8', '12/8'].map((sig) => (
                  <Button key={sig} onClick={() => insertTimeSignature(sig)} variant="outline">
                    {sig}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Feature 10: Tempo/BPM */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={language === 'fr' ? 'Tempo/BPM' : 'Tempo/BPM'}
              >
                <Music className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Tempo/BPM' : 'Tempo/BPM'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[60, 80, 100, 120, 140, 160, 180, 200].map((bpm) => (
                  <Button key={bpm} onClick={() => insertTempo(bpm)} variant="outline">
                    {bpm}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <Dialog open={chordDialogOpen} onOpenChange={handleChordDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Insert chord"
              >
                <Music className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Sélectionner un accord' : 'Select a Chord'}</DialogTitle>
                <DialogDescription>
                  {language === 'fr' 
                    ? 'Choisissez un accord à insérer dans les paroles'
                    : 'Choose a chord to insert into the lyrics'}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={language === 'fr' ? 'Rechercher un accord...' : 'Search for a chord...'}
                    value={chordSearch}
                    onChange={(e) => setChordSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {filteredChordOptions.length > 0 ? (
                      filteredChordOptions.map((chord) => (
                        <Button
                          key={chord}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertChord(chord)}
                          className="text-sm font-mono hover:bg-blue-50 hover:border-blue-300"
                        >
                          {chord}
                        </Button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-muted-foreground text-sm">
                        {language === 'fr' ? 'Aucun accord trouvé' : 'No chords found'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className={`min-h-[200px] p-4 focus:outline-none font-mono text-base leading-loose ${
            isFocused ? 'ring-2 ring-blue-500' : ''
          }`}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={handleChordClick}
          onMouseUp={handleMouseUp}
          onKeyDown={(e) => {
            // Keyboard shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
              e.preventDefault();
              undo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
              e.preventDefault();
              redo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
              e.preventDefault();
              formatText('bold');
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
              e.preventDefault();
              formatText('italic');
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
              e.preventDefault();
              formatText('underline');
            }
          }}
          data-placeholder={placeholder}
          style={{
            '--placeholder': `"${placeholder}"`,
          } as React.CSSProperties}
        />
        
        {/* Piano Chord Diagram Tooltip */}
        {selectedChord && (
          <PianoChordTooltip
            chordName={selectedChord.name}
            position={selectedChord.position}
            onClose={() => setSelectedChord(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};
