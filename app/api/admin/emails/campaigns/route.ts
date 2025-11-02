import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const serverClient = createServerClient();
    const { data: campaigns, error } = await serverClient
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({ campaigns: campaigns || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, content, recipients, scheduledFor } = body;
    const serverClient = createServerClient();

    const { data: campaign, error } = await serverClient
      .from('email_campaigns')
      .insert({
        name,
        subject,
        content: content || null,
        recipients: recipients?.ids || recipients || null,
        status: 'draft',
        scheduled_for: scheduledFor || null,
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ 
        error: 'Failed to create campaign',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ 
      error: 'Failed to create campaign',
      details: error.message
    }, { status: 500 });
  }
}
