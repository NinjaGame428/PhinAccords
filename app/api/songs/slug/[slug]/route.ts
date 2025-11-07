import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const createSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = decodeURIComponent(resolvedParams.slug);
    const serverClient = createServerClient();
    
    // First try to find by slug column
    let { data: songData, error } = await serverClient
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
      .eq('slug', slug)
      .single();

    // If not found by slug, try by title
    if (error || !songData) {
      const titleFromSlug = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const titleResult = await serverClient
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
        .ilike('title', `%${titleFromSlug}%`)
        .limit(1)
        .single();
      
      if (!titleResult.error && titleResult.data) {
        songData = titleResult.data;
        error = null;
      }
    }

    // If still not found, check if slug is a UUID
    if (error || !songData) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      if (isUUID) {
        const uuidResult = await serverClient
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
          .eq('id', slug)
          .single();
        
        if (!uuidResult.error && uuidResult.data) {
          songData = uuidResult.data;
          error = null;
        }
      }
    }

    if (error || !songData) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
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

    const response = NextResponse.json({ song: processedSong });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error: any) {
    console.error('Error in GET /api/songs/slug/[slug]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
