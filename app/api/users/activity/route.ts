import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const admin = searchParams.get('admin') === 'true';
    const serverClient = createServerClient();

    let query = serverClient
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json({ activities: [] }, { status: 200 });
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error: any) {
    console.error('Error in GET /api/users/activity:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      activities: []
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      activityType,
      description,
      metadata,
      page,
      action
    } = body;

    if (!userId || !activityType) {
      return NextResponse.json({ error: 'User ID and activity type are required' }, { status: 400 });
    }

    const serverClient = createServerClient();
    const { data: activity, error } = await serverClient
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        description: description || null,
        activity_data: metadata || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json({ 
        error: 'Failed to create activity',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ activity });
  } catch (error: any) {
    console.error('Error in POST /api/users/activity:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
