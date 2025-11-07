export interface Artist {
  id: string;
  name: string;
  bio?: string;
  image_url?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Song {
  id: string;
  title: string;
  slug: string;
  artist_id?: string;
  artist?: string;
  artist_data?: Artist;
  genre?: string;
  key_signature?: string;
  original_key?: string;
  difficulty?: string;
  category?: string;
  year?: number;
  tempo?: string;
  time_signature?: string;
  chords?: string[];
  chord_progression?: string;
  lyrics?: string;
  chord_chart?: string;
  capo?: string;
  strumming_pattern?: string;
  tags?: string[];
  description?: string;
  rating?: number;
  downloads?: number;
  youtube_url?: string;
  youtube_id?: string;
  thumbnail_url?: string;
  duration?: string;
  published_at?: string;
  quality?: string;
  language?: string;
  captions_available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SongFilters {
  genre?: string;
  key_signature?: string;
  difficulty?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SongListResponse {
  songs: Song[];
  total: number;
  limit: number;
  offset: number;
}

