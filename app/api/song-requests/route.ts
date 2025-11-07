import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const maxLimit = Math.min(limit, 200);
    const offset = (page - 1) * maxLimit;
    
    const serverClient = createServerClient();
    
    let query = serverClient
      .from('song_requests')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + maxLimit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('❌ Error fetching song requests:', error);
      return NextResponse.json({ 
        requests: [],
        pagination: { page, limit: maxLimit, total: 0, totalPages: 0 }
      }, { status: 200 });
    }

    // Get count separately
    let countQuery = serverClient.from('song_requests').select('*', { count: 'exact', head: true });
    if (userId) countQuery = countQuery.eq('user_id', userId);
    if (status) countQuery = countQuery.eq('status', status);
    const { count: totalCount } = await countQuery;

    console.log(`✅ Successfully fetched ${requests?.length || 0} song requests`);

    return NextResponse.json({ 
      requests: requests || [],
      pagination: {
        page,
        limit: maxLimit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / maxLimit)
      }
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/song-requests:', error);
    return NextResponse.json({ 
      requests: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      error: 'Internal server error'
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId,
      title, 
      artist,
      genre,
      message
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ 
        error: 'Title is required',
        details: 'Please provide a song title'
      }, { status: 400 });
    }

    const serverClient = createServerClient();

    const { data: requestData, error } = await serverClient
      .from('song_requests')
      .insert({
        user_id: userId || null,
        title: title.trim(),
        artist: artist?.trim() || null,
        genre: genre?.trim() || null,
        message: message?.trim() || null,
        status: 'pending'
      })
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
      console.error('Error creating song request:', error);
      return NextResponse.json({ 
        error: 'Failed to create song request',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ request: requestData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating song request:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

