import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (with service role key if needed)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'moderator' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      artists: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          image_url: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          image_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          image_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      songs: {
        Row: {
          id: string;
          title: string;
          artist_id: string | null;
          genre: string | null;
          key_signature: string | null;
          tempo: number | null;
          chords: string[] | null;
          lyrics: string | null;
          description: string | null;
          year: number | null;
          rating: number;
          downloads: number;
          created_at: string;
          updated_at: string;
          slug?: string | null;
          artist?: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          artist_id?: string | null;
          genre?: string | null;
          key_signature?: string | null;
          tempo?: number | null;
          chords?: string[] | null;
          lyrics?: string | null;
          description?: string | null;
          year?: number | null;
          rating?: number;
          downloads?: number;
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
          artist?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          artist_id?: string | null;
          genre?: string | null;
          key_signature?: string | null;
          tempo?: number | null;
          chords?: string[] | null;
          lyrics?: string | null;
          description?: string | null;
          year?: number | null;
          rating?: number;
          downloads?: number;
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
          artist?: string | null;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'pdf' | 'video' | 'audio' | 'image' | 'document' | null;
          category: string | null;
          file_url: string | null;
          file_size: number | null;
          downloads: number;
          rating: number;
          author: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type?: 'pdf' | 'video' | 'audio' | 'image' | 'document' | null;
          category?: string | null;
          file_url?: string | null;
          file_size?: number | null;
          downloads?: number;
          rating?: number;
          author: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'pdf' | 'video' | 'audio' | 'image' | 'document' | null;
          category?: string | null;
          file_url?: string | null;
          file_size?: number | null;
          downloads?: number;
          rating?: number;
          author?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

