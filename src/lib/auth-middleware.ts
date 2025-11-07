/**
 * Authentication Middleware for API Routes
 * Handles authentication and authorization checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { User } from '@/types/user'

export interface AuthenticatedRequest extends NextRequest {
  user?: User
  userId?: string
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{ user: User | null; error: Response | null }> {
  try {
    const supabase = createServerClient()
    
    // Get auth token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('sb-access-token')?.value

    if (!token) {
      return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    // Verify token and get user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return { user: null, error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) }
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError || !user) {
      return { user: null, error: NextResponse.json({ error: 'User not found' }, { status: 404 }) }
    }

    return { user: user as User, error: null }
  } catch (error: any) {
    console.error('Auth middleware error:', error)
    return { user: null, error: NextResponse.json({ error: 'Authentication failed' }, { status: 500 }) }
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<{ user: User; error: null } | { user: null; error: Response }> {
  const { user, error } = await getAuthenticatedUser(request)
  
  if (error || !user) {
    return { user: null, error: error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { user, error: null }
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: User; error: null } | { user: null; error: Response }> {
  const authResult = await requireAuth(request)
  
  if (authResult.error || !authResult.user) {
    return authResult
  }

  if (authResult.user.role !== 'admin') {
    return { 
      user: null, 
      error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) 
    }
  }

  return { user: authResult.user, error: null }
}

/**
 * Optional authentication (doesn't fail if not authenticated)
 */
export async function optionalAuth(request: NextRequest): Promise<User | null> {
  const { user } = await getAuthenticatedUser(request)
  return user
}

