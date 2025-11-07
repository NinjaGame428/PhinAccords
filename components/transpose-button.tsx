"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Music, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";

interface TransposeButtonProps {
  currentKey: string;
  onTranspose: (newKey: string) => void;
  className?: string;
}

const TransposeButton = ({ currentKey, onTranspose, className }: TransposeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(currentKey);

  const keys = [
    { value: "C", label: "C" },
    { value: "C#", label: "C#" },
    { value: "D", label: "D" },
    { value: "D#", label: "D#" },
    { value: "E", label: "E" },
    { value: "F", label: "F" },
    { value: "F#", label: "F#" },
    { value: "G", label: "G" },
    { value: "G#", label: "G#" },
    { value: "A", label: "A" },
    { value: "A#", label: "A#" },
    { value: "B", label: "B" },
  ];

  const minorKeys = [
    { value: "Cm", label: "Cm" },
    { value: "C#m", label: "C#m" },
    { value: "Dm", label: "Dm" },
    { value: "D#m", label: "D#m" },
    { value: "Em", label: "Em" },
    { value: "Fm", label: "Fm" },
    { value: "F#m", label: "F#m" },
    { value: "Gm", label: "Gm" },
    { value: "G#m", label: "G#m" },
    { value: "Am", label: "Am" },
    { value: "A#m", label: "A#m" },
    { value: "Bm", label: "Bm" },
  ];

  const allKeys = [...keys, ...minorKeys];

  const handleTranspose = (newKey: string) => {
    setSelectedKey(newKey);
    onTranspose(newKey);
    setIsOpen(false);
  };

  const getKeyType = (key: string) => {
    return key.includes('m') ? 'minor' : 'major';
  };

  const getKeyColor = (key: string) => {
    const isMinor = key.includes('m');
    return isMinor 
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Music className="h-4 w-4 mr-2" />
              Transpose
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change the key of this song</p>
          </TooltipContent>
        </Tooltip>

        {isOpen && (
          <Card className="absolute top-full left-0 mt-2 z-50 w-80 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Transpose Song
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a new key for this song. The chords will be automatically adjusted.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Current Key:</span>
                <Badge className={getKeyColor(currentKey)}>
                  {currentKey}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ChevronUp className="h-4 w-4" />
                    Major Keys
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {keys.map((key) => (
                      <Button
                        key={key.value}
                        variant={selectedKey === key.value ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => handleTranspose(key.value)}
                      >
                        {key.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    Minor Keys
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {minorKeys.map((key) => (
                      <Button
                        key={key.value}
                        variant={selectedKey === key.value ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => handleTranspose(key.value)}
                      >
                        {key.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    New Key: <strong>{selectedKey}</strong>
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleTranspose(selectedKey)}
                    className="rounded-full"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TransposeButton;
