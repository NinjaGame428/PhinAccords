import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, optionalAuth } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET /api/users/[userId] - Get user profile
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
    const supabase = createServerClient()

    // Optional auth - users can view their own profile, admins can view any
    const currentUser = await optionalAuth(request)

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, avatar_url, preferences, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check permissions: users can only view their own profile unless admin
    if (currentUser && currentUser.id !== userId && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/users/[userId] - Update user
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const rateLimitResult = await rateLimit({ maxRequests: 20, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { userId } = await params
    const authResult = await requireAuth(request)
    
    if (authResult.error) {
      return authResult.error
    }

    const user = authResult.user

    // Users can only update their own profile unless admin
    if (user.id !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServerClient()
    const body = await request.json()

    // Prevent role changes unless admin
    if (body.role && user.role !== 'admin') {
      delete body.role
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/users/[userId] - Delete user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const rateLimitResult = await rateLimit({ maxRequests: 10, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { userId } = await params
    
    // Require admin
    const { requireAdmin } = await import('@/lib/auth-middleware')
    const authResult = await requireAdmin(request)
    
    if (authResult.error) {
      return authResult.error
    }

    const supabase = createServerClient()

    // Delete from database
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Delete from auth (requires admin client)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth error:', authError)
      // Continue even if auth deletion fails (user might not exist in auth)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

