import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createServerClient()
    const { slug } = await params

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
        return NextResponse.json({ error: 'Song not found' }, { status: 404 })
      }
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten artist_data
    const song = {
      ...data,
      artist_data: data.artist_data?.[0] || null,
    }

    return NextResponse.json({ song })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

