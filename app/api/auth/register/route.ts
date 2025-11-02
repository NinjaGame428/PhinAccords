import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken } from '@/lib/auth';
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
      const user = await createUser({
        email,
        password,
        full_name: fullName || undefined
      });

      if (!user) {
        console.error('❌ createUser returned null');
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      const token = generateToken(user);

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      return NextResponse.json({ user }, { status: 201 });
    } catch (error: any) {
      console.error('❌ Registration error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.message && (error.message.includes('already exists') || error.message.includes('unique constraint'))) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      
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
