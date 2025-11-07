import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const fullName = firstName && lastName ? `${firstName} ${lastName}`.trim() : null;

    try {
      const serverClient = createServerClient();
      
      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await serverClient.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (authError || !authData.user) {
        console.error('Registration error:', authError);
        if (authError?.message?.includes('already registered')) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: process.env.NODE_ENV === 'development' ? authError?.message : 'Registration failed'
        }, { status: 500 });
      }

      // Create profile in public.users table
      const { data: profileData, error: profileError } = await serverClient
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: fullName,
          role: 'user'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // User is created in auth but profile failed - this is recoverable
      }

      // Get session for cookie
      const { data: sessionData } = await serverClient.auth.getSession();
      
      if (sessionData?.session) {
        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('sb-access-token', sessionData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        });
        cookieStore.set('sb-refresh-token', sessionData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        });
      }

      const user = profileData || {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        avatar_url: null,
        role: 'user'
      };

      return NextResponse.json({ user }, { status: 201 });
    } catch (error: any) {
      console.error('❌ Registration error:', {
        message: error.message,
        stack: error.stack
      });
      
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Database error occurred'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Registration request error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
