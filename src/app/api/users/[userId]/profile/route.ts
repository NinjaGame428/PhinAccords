import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET /api/users/[userId]/profile - Get user profile with extended data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const rateLimitResult = await rateLimit({ maxRequests: 100, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { userId } = await params
    const authResult = await requireAuth(request)
    
    if (authResult.error) {
      return authResult.error
    }

    const user = authResult.user

    // Users can only view their own profile unless admin
    if (user.id !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServerClient()

    // Get user with profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        profile:user_profiles(*)
      `)
      .eq('id', userId)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      console.error('Supabase error:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Get stats
    const [favoritesCount, ratingsCount, downloadsCount] = await Promise.all([
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('ratings').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('user_activities').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'download'),
    ])

    return NextResponse.json({
      user: userData,
      stats: {
        favorites: favoritesCount.count || 0,
        ratings: ratingsCount.count || 0,
        downloads: downloadsCount.count || 0,
      },
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

