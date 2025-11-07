"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Music, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  artist_id?: string;
  key_signature?: string;
  genre?: string;
  chords?: any[];
  description?: string;
  slug?: string;
  year?: number;
}

interface EnhancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

const EnhancedSearch = ({
  placeholder = "Search songs, artists, chords...",
  onSearch,
  onResultSelect,
  className = "",
}: EnhancedSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    genre: "All",
    key: "All",
  });
  const [sortBy, setSortBy] = useState("recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchDatabase = async () => {
      setIsLoading(true);

      try {
        // Build search URL with query parameters
        const searchParams = new URLSearchParams({
          q: query,
          limit: '20'
        });

        if (selectedFilters.genre && selectedFilters.genre !== "All") {
          searchParams.append('genre', selectedFilters.genre);
        }
        if (selectedFilters.key && selectedFilters.key !== "All") {
          searchParams.append('key', selectedFilters.key);
        }

        const response = await fetch(`/api/songs?${searchParams.toString()}`);
        
        if (!response.ok) {
          setResults([]);
          return;
        }

        const data = await response.json();
        const songs = data.songs || [];

        // Filter and format results
        const formattedResults: SearchResult[] = songs
          .filter((song: any) => {
            const searchLower = query.toLowerCase();
            return (
              song.title?.toLowerCase().includes(searchLower) ||
              song.artists?.name?.toLowerCase().includes(searchLower) ||
              song.artist?.toLowerCase().includes(searchLower) ||
              song.description?.toLowerCase().includes(searchLower)
            );
          })
          .slice(0, 20)
          .map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artists?.name || song.artist || 'Unknown Artist',
            artist_id: song.artist_id,
            key_signature: song.key_signature || 'C',
            genre: song.genre || 'Gospel',
            chords: song.chords || [],
            description: song.description,
            slug: song.slug,
            year: song.year,
          }));

        setResults(formattedResults);
        setIsOpen(formattedResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchDatabase, 300);
    return () => clearTimeout(timeoutId);
  }, [query, selectedFilters, sortBy, sortOrder]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setIsOpen(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border rounded-md shadow-lg max-h-[400px] overflow-y-auto">
          <div className="p-2">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/songs/${result.slug || result.id}`}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                  <Music className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.artist}
                      {result.key_signature && ` • Key: ${result.key_signature}`}
                      {result.genre && ` • ${result.genre}`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isOpen && results.length === 0 && !isLoading && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          No results found
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
