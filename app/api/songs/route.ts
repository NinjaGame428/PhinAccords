import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const maxLimit = Math.min(limit, 200);
    const offset = (page - 1) * maxLimit;
    
    const serverClient = createServerClient();
    
    try {
      // First, try to get total count
      const { count, error: countError } = await serverClient
        .from('songs')
        .select('*', { count: 'exact', head: true });

      // If table doesn't exist or RLS blocks access, return empty
      if (countError) {
        console.error('Error getting song count:', countError);
        // Check if it's a "relation does not exist" error
        if (countError.message?.includes('does not exist') || countError.code === '42P01') {
          console.warn('Songs table does not exist yet. Please deploy the database schema.');
          return NextResponse.json({ 
            songs: [], 
            pagination: {
              page,
              limit: maxLimit,
              total: 0,
              totalPages: 0
            },
            message: 'Database schema not deployed. Please run the SQL migration files in Supabase.'
          });
        }
        // For RLS errors, return empty but with count 0
        return NextResponse.json({ 
          songs: [], 
          pagination: {
            page,
            limit: maxLimit,
            total: 0,
            totalPages: 0
          }
        });
      }

      // Fetch songs - try with artist relation first, fallback to simple select
      let songs: any[] = [];
      let error: any = null;

      // Try with artist relation
      const songsWithArtists = await serverClient
        .from('songs')
        .select(`
          *,
          artists:artist_id (
            id,
            name,
            bio,
            image_url
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + maxLimit - 1);

      if (songsWithArtists.error) {
        // If relation fails (RLS or no foreign key), try simple select
        console.warn('Artist relation failed, trying simple select:', songsWithArtists.error);
        const simpleSelect = await serverClient
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + maxLimit - 1);
        
        if (simpleSelect.error) {
          error = simpleSelect.error;
        } else {
          songs = simpleSelect.data || [];
        }
      } else {
        songs = songsWithArtists.data || [];
      }

      if (error) {
        console.error('Error fetching songs:', error);
        // Don't fail completely - return empty array
        return NextResponse.json({ 
          songs: [], 
          pagination: {
            page,
            limit: maxLimit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / maxLimit)
          }
        });
      }

      // Process songs to handle null artist_ids
      const processedSongs = songs.map((song: any) => {
        const artist = Array.isArray(song.artists) ? song.artists[0] : song.artists;
        
        if (!artist && song.artist) {
          return {
            ...song,
            artists: {
              id: song.artist_id || null,
              name: song.artist,
              bio: null,
              image_url: null
            }
          };
        }
        
        return {
          ...song,
          artists: artist || null
        };
      });

      const response = NextResponse.json({ 
        songs: processedSongs, 
        pagination: {
          page,
          limit: maxLimit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / maxLimit)
        }
      });
      
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    } catch (dbError: any) {
      console.error('Database error in GET /api/songs:', dbError);
      return NextResponse.json({ 
        songs: [],
        pagination: {
          page,
          limit: maxLimit,
          total: 0,
          totalPages: 0
        },
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 200 }); // Return 200 with empty array instead of 500
    }
  } catch (error: any) {
    console.error('Error in GET /api/songs:', error);
    return NextResponse.json({ 
      songs: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      },
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 200 }); // Return 200 with empty array
  }
}

const createSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      title, 
      key,
      key_signature,
      bpm,
      tempo,
      slug,
      chords,
      lyrics,
      artist_id
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ 
        error: 'Title is required',
        details: 'Please provide a song title'
      }, { status: 400 });
    }
    
    if (!artist_id || !artist_id.trim()) {
      return NextResponse.json({ 
        error: 'Artist is required',
        details: 'Please select an artist for this song'
      }, { status: 400 });
    }

    const trimmedTitle = title.trim();
    const trimmedArtistId = artist_id.trim();
    const serverClient = createServerClient();

    // Fetch artist name
    const { data: artist } = await serverClient
      .from('artists')
      .select('name')
      .eq('id', trimmedArtistId)
      .single();

    // Insert song
    const { data: songData, error } = await serverClient
      .from('songs')
      .insert({
        title: trimmedTitle,
        artist_id: trimmedArtistId,
        artist: artist?.name || null,
        slug: slug && slug.trim() ? slug.trim() : createSlug(trimmedTitle),
        lyrics: lyrics !== undefined && lyrics !== null ? (typeof lyrics === 'string' ? lyrics.trim() : String(lyrics).trim()) : null,
        key_signature: (key_signature || key) && (key_signature || key).trim() !== '' ? (key_signature || key).trim() : null,
        tempo: (tempo || bpm) !== null && (tempo || bpm) !== undefined && (tempo || bpm) !== '' ? (parseInt(String(tempo || bpm)) || null) : null,
        chords: chords ? (typeof chords === 'string' ? JSON.parse(chords) : chords) : null,
        rating: 0,
        downloads: 0
      })
      .select(`
        *,
        artists:artist_id (
          id,
          name,
          bio,
          image_url
        )
      `)
      .single();

    if (error || !songData) {
      console.error('Error creating song:', error);
      return NextResponse.json({ 
        error: 'Failed to create song',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    // Process artist data
    const processedSong = {
      ...songData,
      artists: Array.isArray(songData.artists) ? songData.artists[0] : songData.artists || 
        (songData.artist ? {
          id: songData.artist_id || null,
          name: songData.artist,
          bio: null,
          image_url: null
        } : null)
    };

    const response = NextResponse.json({ song: processedSong }, { status: 201 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Error creating song:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
