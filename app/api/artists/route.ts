import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bio, image_url, website } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
    }

    const artistData = await query(async (sql) => {
      const [artist] = await sql`
        INSERT INTO artists (
          name,
          bio,
          image_url,
          website,
          created_at,
          updated_at
        ) VALUES (
          ${name.trim()},
          ${bio || null},
          ${image_url || null},
          ${website || null},
          NOW(),
          NOW()
        )
        RETURNING id, name, bio, image_url, website, created_at, updated_at
      `;

      return artist;
    });

    if (!artistData) {
      return NextResponse.json({ error: 'Failed to create artist: No data returned' }, { status: 500 });
    }

    return NextResponse.json({ artist: artistData }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating artist:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Failed to create artist', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Default 100, max 500
    const maxLimit = Math.min(limit, 500);
    const offset = (page - 1) * maxLimit;
    
    const artistsData = await query(async (sql) => {
      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM artists
      `;
      const total = parseInt(countResult[0]?.total || '0');

      // Fetch artists (excluding bio for list view)
      const artists = await sql`
        SELECT id, name, image_url, website, created_at, updated_at
        FROM artists
        ORDER BY name ASC
        LIMIT ${maxLimit}
        OFFSET ${offset}
      `;

      return { artists, total };
    });

    const response = NextResponse.json({ 
      artists: artistsData.artists || [],
      pagination: {
        page,
        limit: maxLimit,
        total: artistsData.total || 0,
        totalPages: Math.ceil((artistsData.total || 0) / maxLimit)
      }
    });
    
    // Aggressive caching - artists change less frequently
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error: any) {
    console.error('❌ Error in GET /api/artists:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
