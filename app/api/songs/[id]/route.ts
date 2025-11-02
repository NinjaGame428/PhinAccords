import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const serverClient = createServerClient();
    
    const { data: songData, error } = await serverClient
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
      .eq('id', resolvedParams.id)
      .single();
    
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
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', '*');
    return response;
  } catch (error: any) {
    console.error('Error in GET /api/songs/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const serverClient = createServerClient();
    
    const { data: songData, error } = await serverClient
      .from('songs')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
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
      return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
    }

    return NextResponse.json({ song: songData });
  } catch (error: any) {
    console.error('Error in PUT /api/songs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const serverClient = createServerClient();
    
    const { error } = await serverClient
      .from('songs')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/songs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
