import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

/**
 * DELETE /api/ratings/[id] - Delete rating
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit({ maxRequests: 20, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const userId = authResult.user.id
    const { id } = await params
    const supabase = createServerClient()

    // Check if rating exists and belongs to user (or user is admin)
    const { data: rating, error: fetchError } = await supabase
      .from('ratings')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rating not found' }, { status: 404 })
      }
      console.error('Supabase error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Users can only delete their own ratings unless admin
    if (rating.user_id !== userId && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete rating
    const { error: deleteError } = await supabase
      .from('ratings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Supabase error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

