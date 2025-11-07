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

    // Get active users (users who had activity in last 24 hours)
    let activeUsers = 0;
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: activeCount } = await serverClient
        .from('user_sessions')
        .select('user_id', { count: 'exact', head: false })
        .gte('updated_at', yesterday.toISOString());
      
      if (activeCount !== null) {
        // Count distinct users
        const { data: uniqueUsers } = await serverClient
          .from('user_sessions')
          .select('user_id')
          .gte('updated_at', yesterday.toISOString());
        
        activeUsers = new Set(uniqueUsers?.map(u => u.user_id) || []).size;
      }
    } catch (error) {
      console.warn('Could not fetch active users:', error);
      activeUsers = 0;
    }

    return NextResponse.json({
      stats: {
        totalSongs,
        totalArtists,
        totalUsers,
        totalResources,
        activeUsers,
        collections: 0 // Can be calculated separately if needed
      },
      overview: {
        totalSongs,
        totalArtists,
        totalUsers,
        totalResources,
        totalCollections: 0
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
