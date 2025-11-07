import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const supabase = createServerClient()

    const { data: campaigns, error } = await supabase.from('email_campaigns').select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0
    const totalOpened = campaigns?.reduce((sum, c) => sum + (c.open_count || 0), 0) || 0
    const totalClicked = campaigns?.reduce((sum, c) => sum + (c.click_count || 0), 0) || 0

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

    return NextResponse.json({
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

