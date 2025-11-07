import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serverClient = createServerClient();

    const { data: requestData, error } = await serverClient
      .from('song_requests')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq('id', id)
      .single();

    if (error || !requestData) {
      console.error('Error fetching song request:', error);
      return NextResponse.json({ 
        error: 'Song request not found',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 404 });
    }

    return NextResponse.json({ request: requestData });
  } catch (error: any) {
    console.error('Error in GET /api/song-requests/[id]:', error);
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
    const { id } = await params;
    const body = await request.json();
    const { status, title, artist, genre, message } = body;

    const serverClient = createServerClient();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (title) updateData.title = title.trim();
    if (artist !== undefined) updateData.artist = artist?.trim() || null;
    if (genre !== undefined) updateData.genre = genre?.trim() || null;
    if (message !== undefined) updateData.message = message?.trim() || null;

    const { data: requestData, error } = await serverClient
      .from('song_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name
        )
      `)
      .single();

    if (error || !requestData) {
      console.error('Error updating song request:', error);
      return NextResponse.json({ 
        error: 'Failed to update song request',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ request: requestData });
  } catch (error: any) {
    console.error('Error in PUT /api/song-requests/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serverClient = createServerClient();

    const { error } = await serverClient
      .from('song_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting song request:', error);
      return NextResponse.json({ 
        error: 'Failed to delete song request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/song-requests/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

