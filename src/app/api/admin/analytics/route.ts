import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const supabase = createServerClient()

    // Get page views from analytics
    const { count: pageViews } = await supabase
      .from('user_analytics')
      .select('*', { count: 'exact', head: true })

    // Get downloads count
    const { count: downloads } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', 'download')

    // Get popular songs (by downloads and ratings)
    const { data: songs } = await supabase
      .from('songs')
      .select('id, title, artist, downloads, rating')
      .order('downloads', { ascending: false })
      .limit(10)

    // Get popular artists
    const { data: artistsData } = await supabase
      .from('artists')
      .select(`
        id,
        name,
        songs:songs(count)
      `)
      .limit(10)

    // Calculate artist stats
    const popularArtists = await Promise.all(
      (artistsData || []).map(async (artist: any) => {
        const { data: artistSongs } = await supabase
          .from('songs')
          .select('downloads, rating')
          .eq('artist_id', artist.id)

        const totalViews = artistSongs?.reduce((sum, song) => sum + (song.downloads || 0), 0) || 0
        const avgRating =
          artistSongs && artistSongs.length > 0
            ? artistSongs.reduce((sum, song) => sum + (song.rating || 0), 0) / artistSongs.length
            : 0

        return {
          id: artist.id,
          name: artist.name,
          song_count: artistSongs?.length || 0,
          total_views: totalViews,
          avg_rating: avgRating,
        }
      })
    )

    // Sort artists by total views
    popularArtists.sort((a, b) => b.total_views - a.total_views)

    return NextResponse.json({
      userGrowth: [], // TODO: Implement user growth over time
      pageViews: pageViews || 0,
      downloads: downloads || 0,
      popularSongs: songs || [],
      popularArtists: popularArtists.slice(0, 10),
      engagement: {
        activeUsers: 0, // TODO: Calculate active users
        avgSession: 0, // TODO: Calculate average session time
      },
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

