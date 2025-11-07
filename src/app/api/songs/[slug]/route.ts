import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import songCache from '@/lib/song-cache'
import { requireAdmin, optionalAuth } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit({ maxRequests: 200, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createServerClient()
    const { slug } = await params
    const body = await request.json()

    // Require admin
    const authResult = await requireAdmin(request)
    if (authResult.error) {
      return authResult.error
    }

    const { data, error } = await supabase
      .from('songs')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invalidate cache
    songCache.invalidatePattern(/^songs:/)

    return NextResponse.json({ song: data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createServerClient()
    const { slug } = await params

    // Require admin
    const authResult = await requireAdmin(request)
    if (authResult.error) {
      return authResult.error
    }

    const { error } = await supabase.from('songs').delete().eq('slug', slug)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invalidate cache
    songCache.invalidatePattern(/^songs:/)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

