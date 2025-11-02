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
  Music
} from 'lucide-react';
import { ChordTooltip } from './chord-tooltip';

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
  const [isFocused, setIsFocused] = useState(false);
  const [selectedChord, setSelectedChord] = useState<{ name: string; position: { x: number; y: number } } | null>(null);

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

  const insertChord = () => {
    const chord = prompt('Enter chord name:');
    if (chord) {
      const chordElement = `<span class="chord" style="color: #3b82f6; font-weight: bold; margin-right: 8px;">[${chord}]</span>`;
      execCommand('insertHTML', chordElement);
    }
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
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertChord}
            className="h-8 w-8 p-0"
          >
            <Music className="h-4 w-4" />
          </Button>
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
        
        {/* Chord Diagram Tooltip */}
        {selectedChord && (
          <ChordTooltip
            chordName={selectedChord.name}
            position={selectedChord.position}
            onClose={() => setSelectedChord(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};
