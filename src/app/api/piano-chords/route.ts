import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams

    const keySignature = searchParams.get('key_signature') || undefined
    const difficulty = searchParams.get('difficulty') || undefined
    const chordType = searchParams.get('chord_type') || undefined
    const search = searchParams.get('q') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('piano_chords')
      .select('*', { count: 'exact' })
      .order('chord_name', { ascending: true })

    if (keySignature) {
      query = query.eq('key_signature', keySignature)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (chordType) {
      query = query.eq('chord_type', chordType)
    }

    if (search) {
      query = query.or(
        `chord_name.ilike.%${search}%,description.ilike.%${search}%,alternate_name.ilike.%${search}%`
      )
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      chords: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

