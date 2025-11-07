import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit({ maxRequests: 200, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams

    const songId = searchParams.get('songId') || undefined
    const resourceId = searchParams.get('resourceId') || undefined

    if (!songId && !resourceId) {
      return NextResponse.json({ error: 'songId or resourceId is required' }, { status: 400 })
    }

    let query = supabase.from('ratings').select('*').order('created_at', { ascending: false })

    if (songId) {
      query = query.eq('song_id', songId)
    } else if (resourceId) {
      query = query.eq('resource_id', resourceId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const ratings = data || []
    const totalRatings = ratings.length
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
        : 0

    return NextResponse.json({
      ratings,
      totalRatings,
      averageRating,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit({ maxRequests: 50, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const userId = authResult.user.id
    const supabase = createServerClient()
    const body = await request.json()

    const { song_id, resource_id, rating, comment } = body

    if (!rating || (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!song_id && !resource_id) {
      return NextResponse.json({ error: 'song_id or resource_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert({
        user_id: userId,
        song_id: song_id || null,
        resource_id: resource_id || null,
        rating,
        comment: comment || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rating: data }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

