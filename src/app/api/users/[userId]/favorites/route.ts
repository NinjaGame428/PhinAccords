import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET /api/users/[userId]/favorites - Get user favorites
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

    // Users can only view their own favorites unless admin
    if (user.id !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams
    const itemType = searchParams.get('type') || undefined

    let query = supabase
      .from('favorites')
      .select(`
        *,
        song:songs(*),
        resource:resources(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ favorites: data || [] })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

