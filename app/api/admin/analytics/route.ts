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

    // Get recent signups
    const { data: recentSignups } = await serverClient
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

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
        activeUsers: totalUsers,
        youtubeVideos: 0,
        collections: 1,
        totalSessions: 0,
        totalActivities: 0
      },
      userGrowth: {
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: totalUsers,
        userGrowthRate: 0
      },
      engagement: {
        averageSessionsPerUser: 0,
        totalPageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0
      },
      geographic: {
        usersByCountry: [],
        usersByCity: [],
        topCountries: []
      },
      device: {
        usersByDevice: [],
        usersByBrowser: [],
        usersByOS: []
      },
      content: {
        mostPopularSongs: [],
        mostPopularArtists: [],
        totalDownloads: 0,
        averageRating: 0
      },
      recentActivity: {
        recentSignups: recentSignups || [],
        recentSessions: [],
        recentActivities: []
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
