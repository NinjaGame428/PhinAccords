import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const maxLimit = Math.min(limit, 200);
    const offset = (page - 1) * maxLimit;
    
    const songsData = await query(async (sql) => {
      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM songs
      `;
      const total = parseInt(countResult[0]?.total || '0');

      // Fetch songs with artist info using LEFT JOIN
      const songs = await sql`
        SELECT 
          s.*,
          json_build_object(
            'id', a.id,
            'name', a.name,
            'bio', a.bio,
            'image_url', a.image_url
          ) as artists
        FROM songs s
        LEFT JOIN artists a ON s.artist_id = a.id
        ORDER BY s.created_at DESC
        LIMIT ${maxLimit}
        OFFSET ${offset}
      `;

      return { songs, total };
    });

    // Handle null artist_ids
    const processedSongs = songsData.songs.map((song: any) => {
      if (!song.artists && song.artist) {
        song.artists = {
          id: song.artist_id || null,
          name: song.artist,
          bio: null,
          image_url: null
        };
      }
      return song;
    });

    const response = NextResponse.json({ 
      songs: processedSongs || [], 
      pagination: {
        page,
        limit: maxLimit,
        total: songsData.total || 0,
        totalPages: Math.ceil((songsData.total || 0) / maxLimit)
      }
    });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Error in GET /api/songs:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
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

    const songData = await query(async (sql) => {
      // Fetch artist name
      let artistName: string | null = null;
      try {
        const [artist] = await sql`
          SELECT name
          FROM artists
          WHERE id = ${trimmedArtistId}
        `;
        if (artist) artistName = artist.name.trim();
      } catch (error) {
        console.warn('Could not fetch artist name:', error);
      }

      // Insert song
      const [song] = await sql`
        INSERT INTO songs (
          title,
          artist_id,
          artist,
          slug,
          lyrics,
          key_signature,
          tempo,
          chords,
          rating,
          downloads,
          created_at,
          updated_at
        ) VALUES (
          ${trimmedTitle},
          ${trimmedArtistId},
          ${artistName || null},
          ${slug && slug.trim() ? slug.trim() : createSlug(trimmedTitle)},
          ${lyrics !== undefined && lyrics !== null ? (typeof lyrics === 'string' ? lyrics.trim() : String(lyrics).trim()) : null},
          ${(key_signature || key) && (key_signature || key).trim() !== '' ? (key_signature || key).trim() : null},
          ${(tempo || bpm) !== null && (tempo || bpm) !== undefined && (tempo || bpm) !== '' ? (parseInt(String(tempo || bpm)) || null) : null},
          ${chords ? (typeof chords === 'string' ? chords : JSON.stringify(chords)) : null},
          0,
          0,
          NOW(),
          NOW()
        )
        RETURNING *
      `;

      // Fetch artist info for response
      const [artist] = await sql`
        SELECT id, name, bio, image_url
        FROM artists
        WHERE id = ${trimmedArtistId}
      `;

      return {
        ...song,
        artists: artist || null
      };
    });

    if (!songData) {
      return NextResponse.json({ 
        error: 'Failed to create song: No data returned'
      }, { status: 500 });
    }

    if (!songData.artists && songData.artist) {
      songData.artists = {
        id: songData.artist_id || null,
        name: songData.artist,
        bio: null,
        image_url: null
      };
    }

    const response = NextResponse.json({ song: songData }, { status: 201 });
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
