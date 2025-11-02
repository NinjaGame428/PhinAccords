import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const songId = searchParams.get('songId');
    const resourceId = searchParams.get('resourceId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        favorites: []
      }, { status: 400 });
    }

    const serverClient = createServerClient();
    
    let query = serverClient
      .from('favorites')
      .select(`
        *,
        songs (*),
        resources (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (songId) {
      query = query.eq('song_id', songId);
    }
    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data: favorites, error } = await query;

    if (error) {
      console.error('❌ Error fetching favorites:', error);
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    return NextResponse.json({ favorites: favorites || [] });
  } catch (error: any) {
    console.error('❌ Error in GET /api/favorites:', error);
    return NextResponse.json({ 
      favorites: [],
      error: 'Internal server error'
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, songId, resourceId } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!songId && !resourceId) {
      return NextResponse.json({ 
        error: 'Either songId or resourceId is required'
      }, { status: 400 });
    }

    const serverClient = createServerClient();

    const { data: favorite, error } = await serverClient
      .from('favorites')
      .insert({
        user_id: userId,
        song_id: songId || null,
        resource_id: resourceId || null
      })
      .select(`
        *,
        songs (*),
        resources (*)
      `)
      .single();

    if (error) {
      // Check if it's a unique constraint violation (already favorited)
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'Already favorited',
          favorite: null
        }, { status: 409 });
      }
      console.error('Error creating favorite:', error);
      return NextResponse.json({ 
        error: 'Failed to create favorite',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating favorite:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const songId = searchParams.get('songId');
    const resourceId = searchParams.get('resourceId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!songId && !resourceId) {
      return NextResponse.json({ 
        error: 'Either songId or resourceId is required'
      }, { status: 400 });
    }

    const serverClient = createServerClient();

    let query = serverClient
      .from('favorites')
      .delete()
      .eq('user_id', userId);

    if (songId) {
      query = query.eq('song_id', songId);
    }
    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting favorite:', error);
      return NextResponse.json({ 
        error: 'Failed to delete favorite',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

