import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateCacheKey, getCachedSongs } from '@/lib/song-cache'

/**
 * GET /api/songs/slug/[slug] - Get song by slug (cached)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createServerClient()

    // Generate cache key
    const cacheKey = `song:slug:${slug}`

    // Try to get from cache or fetch
    const result = await getCachedSongs(cacheKey, async () => {
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          artist_data:artists(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Song not found')
        }
        throw new Error(error.message)
      }

      // Transform the data to flatten artist_data
      return {
        ...data,
        artist_data: data.artist_data?.[0] || null,
      }
    })

    return NextResponse.json({ song: result })
  } catch (error: any) {
    if (error.message === 'Song not found') {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

