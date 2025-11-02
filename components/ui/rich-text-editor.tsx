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
  AlignJustify
} from 'lucide-react';
import { PianoChordTooltip } from './piano-chord-tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

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
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Generate chord options based on language
  const generateChordOptions = (): string[] => {
    const roots = language === 'fr'
      ? ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']
      : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
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

  const insertChord = (chordName: string) => {
    const chordElement = `<span class="chord" style="color: #3b82f6; font-weight: bold; margin-right: 8px;">[${chordName}]</span>`;
    execCommand('insertHTML', chordElement);
    setChordDialogOpen(false);
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
          
          <Dialog open={chordDialogOpen} onOpenChange={setChordDialogOpen}>
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
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-4">
                {chordOptions.map((chord) => (
                  <Button
                    key={chord}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertChord(chord)}
                    className="text-sm font-mono"
                  >
                    {chord}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className={`min-h-[200px] p-4 focus:outline-none ${
            isFocused ? 'ring-2 ring-blue-500' : ''
          }`}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={handleChordClick}
          onMouseUp={handleMouseUp}
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
