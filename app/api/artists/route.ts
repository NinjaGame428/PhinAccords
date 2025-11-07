import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bio, image_url, website } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
    }

    // Get authenticated user
    const { getCurrentUser } = await import('@/lib/auth');
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'You must be logged in to create artists'
      }, { status: 401 });
    }

    // Check if user is admin
    const serverClient = createServerClient();
    const { data: userProfile } = await serverClient
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();
    
    const isAdmin = userProfile?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Forbidden',
        details: 'Only administrators can create artists'
      }, { status: 403 });
    }

    // Create authenticated client with user session for RLS policies
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Session token not found'
      }, { status: 401 });
    }

    // Create authenticated client using the user's session token
    const { createClient } = await import('@supabase/supabase-js');
    const authenticatedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const { data: artistData, error } = await authenticatedClient
      .from('artists')
      .insert({
        name: name.trim(),
        bio: bio || null,
        image_url: image_url || null,
        website: website || null
      })
      .select()
      .single();

    if (error || !artistData) {
      console.error('❌ Error creating artist:', error);
      return NextResponse.json({ 
        error: 'Failed to create artist',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    const response = NextResponse.json({ artist: artistData }, { status: 201 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error: any) {
    console.error('❌ Error creating artist:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Failed to create artist', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const maxLimit = Math.min(limit, 500);
    const offset = (page - 1) * maxLimit;
    
    const serverClient = createServerClient();
    
    // Get total count
    const { count } = await serverClient
      .from('artists')
      .select('*', { count: 'exact', head: true });

    // Fetch artists
    const { data: artists, error } = await serverClient
      .from('artists')
      .select('id, name, image_url, website, created_at, updated_at')
      .order('name', { ascending: true })
      .range(offset, offset + maxLimit - 1);

    if (error) {
      console.error('❌ Error in GET /api/artists:', error);
      return NextResponse.json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    // Check for cache-busting parameter
    const noCache = searchParams.get('_t') || searchParams.get('nocache');
    
    const response = NextResponse.json({ 
      artists: artists || [],
      pagination: {
        page,
        limit: maxLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / maxLimit)
      }
    });
    
    // Use no-cache if cache busting is requested, otherwise use short cache
    if (noCache) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Error in GET /api/artists:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
