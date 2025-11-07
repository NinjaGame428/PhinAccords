import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { SongFilters } from '@/types/song'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams

    const filters: SongFilters = {
      search: searchParams.get('q') || undefined,
      genre: searchParams.get('genre') || undefined,
      key_signature: searchParams.get('key') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      category: searchParams.get('category') || undefined,
      artist_id: searchParams.get('artist_id') || undefined,
      limit: parseInt(searchParams.get('limit') || '12'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    let query = supabase
      .from('songs')
      .select(`
        *,
        artist_data:artists(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.genre) {
      query = query.eq('genre', filters.genre)
    }

    if (filters.key_signature) {
      query = query.eq('key_signature', filters.key_signature)
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.artist_id) {
      query = query.eq('artist_id', filters.artist_id)
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,artist.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    // Apply pagination
    query = query.range(filters.offset!, filters.offset! + filters.limit! - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten artist_data
    const songs = data?.map((song: any) => ({
      ...song,
      artist_data: song.artist_data?.[0] || null,
    })) || []

    return NextResponse.json({
      songs,
      total: count || 0,
      limit: filters.limit,
      offset: filters.offset,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

