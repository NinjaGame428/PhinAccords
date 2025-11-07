import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from authenticated session
    const userId = request.headers.get('x-user-id') // Placeholder - should come from auth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get favorites count
    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get downloads count (from resources)
    const { count: downloadsCount } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('activity_type', 'download')

    // Get ratings count
    const { count: ratingsCount } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get user join date
    const { data: userData } = await supabase
      .from('users')
      .select('join_date, created_at')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      favorites: favoritesCount || 0,
      downloads: downloadsCount || 0,
      ratings: ratingsCount || 0,
      memberSince: userData?.join_date || userData?.created_at || null,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

