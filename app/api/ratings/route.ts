import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const songId = searchParams.get('songId');
    const resourceId = searchParams.get('resourceId');
    
    const serverClient = createServerClient();
    
    let query = serverClient
      .from('ratings')
      .select(`
        *,
        songs (*),
        resources (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (songId) {
      query = query.eq('song_id', songId);
    }
    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data: ratings, error } = await query;

    if (error) {
      console.error('❌ Error fetching ratings:', error);
      return NextResponse.json({ ratings: [] }, { status: 200 });
    }

    return NextResponse.json({ ratings: ratings || [] });
  } catch (error: any) {
    console.error('❌ Error in GET /api/ratings:', error);
    return NextResponse.json({ 
      ratings: [],
      error: 'Internal server error'
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, songId, resourceId, rating, comment } = body;

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

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5'
      }, { status: 400 });
    }

    const serverClient = createServerClient();

    // Upsert rating (update if exists, insert if not)
    const { data: ratingData, error } = await serverClient
      .from('ratings')
      .upsert({
        user_id: userId,
        song_id: songId || null,
        resource_id: resourceId || null,
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,song_id,resource_id'
      })
      .select(`
        *,
        songs (*),
        resources (*)
      `)
      .single();

    if (error) {
      console.error('Error creating/updating rating:', error);
      return NextResponse.json({ 
        error: 'Failed to create rating',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    // Update song/resource average rating
    if (songId) {
      // Calculate average rating for song
      const { data: allRatings } = await serverClient
        .from('ratings')
        .select('rating')
        .eq('song_id', songId);

      if (allRatings && allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        await serverClient
          .from('songs')
          .update({ rating: parseFloat(avgRating.toFixed(2)) })
          .eq('id', songId);
      }
    }

    if (resourceId) {
      // Calculate average rating for resource
      const { data: allRatings } = await serverClient
        .from('ratings')
        .select('rating')
        .eq('resource_id', resourceId);

      if (allRatings && allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        await serverClient
          .from('resources')
          .update({ rating: parseFloat(avgRating.toFixed(2)) })
          .eq('id', resourceId);
      }
    }

    return NextResponse.json({ rating: ratingData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating rating:', error);
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
      .from('ratings')
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
      console.error('Error deleting rating:', error);
      return NextResponse.json({ 
        error: 'Failed to delete rating',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting rating:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

