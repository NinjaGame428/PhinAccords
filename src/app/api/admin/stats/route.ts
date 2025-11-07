import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const supabase = createServerClient()

    // Get counts for all main entities
    const [songsResult, artistsResult, resourcesResult, usersResult, requestsResult] =
      await Promise.all([
        supabase.from('songs').select('*', { count: 'exact', head: true }),
        supabase.from('artists').select('*', { count: 'exact', head: true }),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase
          .from('song_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ])

    return NextResponse.json({
      songs: songsResult.count || 0,
      artists: artistsResult.count || 0,
      resources: resourcesResult.count || 0,
      users: usersResult.count || 0,
      songRequests: requestsResult.count || 0,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

