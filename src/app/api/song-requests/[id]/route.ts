import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const { id } = await params
    const body = await request.json()

    // TODO: Add admin authentication check

    const { status, ...updates } = body

    const updateData: Record<string, any> = {}
    if (status) {
      updateData.status = status
    }
    if (Object.keys(updates).length > 0) {
      Object.assign(updateData, updates)
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('song_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

