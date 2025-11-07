import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const serverClient = createServerClient();
    
    // Get all users
    const { data: users, error: usersError } = await serverClient
      .from('users')
      .select('id, created_at, status');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter((u: any) => u.status === 'active').length || 0;
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsersToday = users?.filter((u: any) => 
      new Date(u.created_at) >= new Date(today.toDateString())
    ).length || 0;

    const newUsersThisWeek = users?.filter((u: any) => 
      new Date(u.created_at) >= thisWeek
    ).length || 0;

    const newUsersThisMonth = users?.filter((u: any) => 
      new Date(u.created_at) >= thisMonth
    ).length || 0;

    // Get analytics data if available
    const { data: analyticsData } = await serverClient
      .from('user_analytics')
      .select('last_location, device_info, browser_info')
      .limit(100);

    // Country distribution
    const countryCounts: { [key: string]: number } = {};
    analyticsData?.forEach((item: any) => {
      const country = item.last_location?.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const usersByCountry = Object.entries(countryCounts)
      .map(([country, count]) => ({
        country,
        users: count
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);

    // Device distribution
    const deviceCounts: { [key: string]: number } = {};
    analyticsData?.forEach((item: any) => {
      const device = item.device_info?.type || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    const usersByDevice = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        users: count
      }))
      .sort((a, b) => b.users - a.users);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      usersByCountry,
      usersByDevice,
      usersByBrowser: [],
      usersByOS: []
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user analytics',
      details: error.message
    }, { status: 500 });
  }
}
