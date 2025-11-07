import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET /api/users/activity - Get current user's activity
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit({ maxRequests: 100, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const authResult = await requireAuth(request)
    
    if (authResult.error) {
      return authResult.error
    }

    const userId = authResult.user.id
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams

    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const activityType = searchParams.get('type') || undefined

    let query = supabase
      .from('user_activities')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (activityType) {
      query = query.eq('activity_type', activityType)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      activities: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

