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
      // Get total count
      const { count, error: countError } = await serverClient
        .from('songs')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Error getting song count:', countError);
        // Check if it's a "relation does not exist" error
        if (countError.message?.includes('does not exist') || countError.code === '42P01') {
          return NextResponse.json({ 
            songs: [], 
            pagination: { page, limit: maxLimit, total: 0, totalPages: 0 },
            message: 'Database schema not deployed. Please run the SQL migration files in Supabase.'
          });
        }
        // For RLS errors or other issues, return empty
        return NextResponse.json({ 
          songs: [], 
          pagination: { page, limit: maxLimit, total: 0, totalPages: 0 }
        });
      }

      // First try: Simple select (works even if artist_id foreign key doesn't exist)
      const { data: songs, error: songsError } = await serverClient
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + maxLimit - 1);

      if (songsError) {
        console.error('❌ Error fetching songs:', songsError);
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

      if (!songs || songs.length === 0) {
        console.log('ℹ️ No songs found in database');
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

      // Process songs and try to fetch artist info if artist_id exists
      const processedSongs = await Promise.all(
        songs.map(async (song: any) => {
          let artistData = null;

          // If song has artist_id, try to fetch artist details
          if (song.artist_id) {
            try {
              const { data: artist } = await serverClient
                .from('artists')
                .select('id, name, bio, image_url')
                .eq('id', song.artist_id)
                .single();
              
              if (artist) {
                artistData = artist;
              }
            } catch (error) {
              // Artist not found or RLS issue - use fallback
              console.warn(`Artist not found for ID ${song.artist_id}`);
            }
          }

          // Use artist data if available, otherwise use the artist text field from the song
          // Prioritize: fetched artist data > song.artist text field > extract from title if possible
          let finalArtist = null;
          
          if (artistData) {
            // Best case: We successfully fetched artist from artist_id
            finalArtist = artistData;
          } else if (song.artist && song.artist.trim() !== '') {
            // Fallback: Use the artist text field if it exists and is not empty
            finalArtist = {
              id: song.artist_id || null,
              name: song.artist.trim(),
              bio: null,
              image_url: null
            };
          } else if (song.artist_id) {
            // If we have artist_id but couldn't fetch, try to extract from title
            // Some songs might have artist name in title like "Artist Name - Song Title"
            const titleParts = song.title?.split(' - ') || [];
            if (titleParts.length > 1 && titleParts[0]?.trim()) {
              finalArtist = {
                id: song.artist_id,
                name: titleParts[0].trim(),
                bio: null,
                image_url: null
              };
            } else {
              // Last resort: Don't set Unknown Artist, let frontend handle it
              finalArtist = null;
            }
          }
          
          // Only set Unknown Artist if we truly have no artist information
          if (!finalArtist) {
            finalArtist = {
              id: null,
              name: null, // Return null instead of 'Unknown Artist' so frontend can handle gracefully
              bio: null,
              image_url: null
            };
          }

          return {
            ...song,
            artists: finalArtist,
            // Also include artist as a string field for backward compatibility
            // Use the actual artist name, not null
            artist: finalArtist.name || null
          };
        })
      );

      console.log(`✅ Successfully fetched ${processedSongs.length} songs`);

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
      console.error('❌ Database error in GET /api/songs:', dbError);
      return NextResponse.json({ 
        songs: [],
        pagination: { page, limit: maxLimit, total: 0, totalPages: 0 },
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('❌ Error in GET /api/songs:', error);
    return NextResponse.json({ 
      songs: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 200 });
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
      .select('*')
      .single();

    if (error || !songData) {
      console.error('Error creating song:', error);
      return NextResponse.json({ 
        error: 'Failed to create song',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    // Try to fetch artist info if available
    let artistInfo = null;
    if (songData.artist_id) {
      try {
        const { data: artist } = await serverClient
          .from('artists')
          .select('id, name, bio, image_url')
          .eq('id', songData.artist_id)
          .single();
        
        if (artist) artistInfo = artist;
      } catch (error) {
        // Ignore artist fetch errors
      }
    }

    // Process artist data
    const processedSong = {
      ...songData,
      artists: artistInfo || (songData.artist ? {
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
