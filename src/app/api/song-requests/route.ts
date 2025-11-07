import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // TODO: Add admin authentication check
    // For now, allow all GET requests

    let query = supabase
      .from('song_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      requests: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { title, artist, genre, key, difficulty, message, contact_email, priority } = body

    if (!title || !artist) {
      return NextResponse.json({ error: 'Title and artist are required' }, { status: 400 })
    }

    // Get user from request (if authenticated)
    // TODO: Get from authenticated session
    const userId = body.user_id || null

    const { data, error } = await supabase
      .from('song_requests')
      .insert({
        user_id: userId,
        title,
        artist,
        genre: genre || null,
        key: key || null,
        difficulty: difficulty || null,
        message: message || null,
        contact_email: contact_email || null,
        priority: priority || 'Normal',
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

