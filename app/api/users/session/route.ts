import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      deviceType,
      browser,
      operatingSystem,
      screenResolution,
      country,
      city,
      region,
      ipAddress,
      timezone,
      userAgent,
      sessionId
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const serverClient = createServerClient();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: session, error } = await serverClient
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionId || crypto.randomUUID(),
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ 
        error: 'Failed to create session',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Error in POST /api/users/session:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
