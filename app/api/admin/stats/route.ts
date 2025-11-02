import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const serverClient = createServerClient();
    
    // Fetch overview statistics
    const [songsResult, artistsResult, usersResult, resourcesResult] = await Promise.all([
      serverClient.from('songs').select('*', { count: 'exact', head: true }),
      serverClient.from('artists').select('*', { count: 'exact', head: true }),
      serverClient.from('users').select('*', { count: 'exact', head: true }),
      serverClient.from('resources').select('*', { count: 'exact', head: true })
    ]);

    const totalSongs = songsResult.count || 0;
    const totalArtists = artistsResult.count || 0;
    const totalUsers = usersResult.count || 0;
    const totalResources = resourcesResult.count || 0;

    return NextResponse.json({
      overview: {
        totalSongs,
        totalArtists,
        totalUsers,
        totalResources,
        totalCollections: 0 // Can be calculated separately if needed
      }
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
