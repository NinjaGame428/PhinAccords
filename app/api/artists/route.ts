import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bio, image_url, website } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
    }

    const serverClient = createServerClient();
    const { data: artistData, error } = await serverClient
      .from('artists')
      .insert({
        name: name.trim(),
        bio: bio || null,
        image_url: image_url || null,
        website: website || null
      })
      .select()
      .single();

    if (error || !artistData) {
      console.error('❌ Error creating artist:', error);
      return NextResponse.json({ 
        error: 'Failed to create artist',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const maxLimit = Math.min(limit, 500);
    const offset = (page - 1) * maxLimit;
    
    const serverClient = createServerClient();
    
    // Get total count
    const { count } = await serverClient
      .from('artists')
      .select('*', { count: 'exact', head: true });

    // Fetch artists
    const { data: artists, error } = await serverClient
      .from('artists')
      .select('id, name, image_url, website, created_at, updated_at')
      .order('name', { ascending: true })
      .range(offset, offset + maxLimit - 1);

    if (error) {
      console.error('❌ Error in GET /api/artists:', error);
      return NextResponse.json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    const response = NextResponse.json({ 
      artists: artists || [],
      pagination: {
        page,
        limit: maxLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / maxLimit)
      }
    });
    
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
