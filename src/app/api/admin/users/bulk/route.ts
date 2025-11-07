import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'

/**
 * POST /api/admin/users/bulk - Bulk user operations
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for bulk operations)
    const rateLimitResult = await rateLimit({ maxRequests: 5, windowMs: 60 * 1000 })(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Require admin
    const authResult = await requireAdmin(request)
    if (authResult.error) {
      return authResult.error
    }

    const supabase = createServerClient()
    const body = await request.json()

    const { operation, user_ids, data } = body

    if (!operation || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: 'operation and user_ids array are required' },
        { status: 400 }
      )
    }

    let result: any

    switch (operation) {
      case 'delete':
        // Bulk delete users
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .in('id', user_ids)

        if (deleteError) {
          console.error('Bulk delete error:', deleteError)
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        // Delete from auth (requires admin client)
        // Note: This might need to be done one by one depending on Supabase limits
        for (const userId of user_ids) {
          await supabase.auth.admin.deleteUser(userId).catch((err) => {
            console.error(`Failed to delete auth user ${userId}:`, err)
          })
        }

        result = { deleted: user_ids.length }
        break

      case 'update_role':
        if (!data || !data.role) {
          return NextResponse.json({ error: 'role is required for update_role operation' }, { status: 400 })
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({ role: data.role, updated_at: new Date().toISOString() })
          .in('id', user_ids)

        if (updateError) {
          console.error('Bulk update error:', updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        result = { updated: user_ids.length, role: data.role }
        break

      case 'activate':
        const { error: activateError } = await supabase
          .from('users')
          .update({ updated_at: new Date().toISOString() })
          .in('id', user_ids)

        if (activateError) {
          console.error('Bulk activate error:', activateError)
          return NextResponse.json({ error: activateError.message }, { status: 500 })
        }

        result = { activated: user_ids.length }
        break

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}. Supported: delete, update_role, activate` },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

