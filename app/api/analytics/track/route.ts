import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const analytics = await request.json();
    const serverClient = createServerClient();

    const { error } = await serverClient
      .from('user_analytics')
      .insert({
        user_id: analytics.userId || null,
        page_views: analytics.pageViews || 0,
        last_location: analytics.location ? { 
          country: analytics.location.country,
          city: analytics.location.city,
          region: analytics.location.region
        } : null,
        device_info: analytics.device ? {
          type: analytics.device.type,
          os: analytics.device.os,
          browser: analytics.device.browser
        } : null,
        browser_info: analytics.browser ? {
          name: analytics.browser.name,
          version: analytics.browser.version
        } : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing analytics:', error);
      return NextResponse.json({ 
        error: 'Failed to store analytics',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error storing analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to store analytics',
      details: error.message
    }, { status: 500 });
  }
}
