import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    try {
      const serverClient = createServerClient();
      
      // Sign in with Supabase Auth
      const { data, error } = await serverClient.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (error || !data.user || !data.session) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Get user profile
      const { data: profile } = await serverClient
        .from('users')
        .select('id, email, full_name, avatar_url, role')
        .eq('id', data.user.id)
        .single();

      // Set cookies
      const cookieStore = await cookies();
      cookieStore.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      cookieStore.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      const user = profile || {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || null,
        avatar_url: data.user.user_metadata?.avatar_url || null,
        role: 'user' as const
      };

      return NextResponse.json({ user }, { status: 200 });
    } catch (error: any) {
      console.error('❌ Login error:', {
        message: error.message,
        stack: error.stack
      });
      return NextResponse.json({ 
        error: 'Login failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Login request error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
