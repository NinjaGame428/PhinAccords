import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { name, bio, image_url, website } = body;
    const serverClient = createServerClient();
    
    const { data: artistData, error } = await serverClient
      .from('artists')
      .update({
        name: name?.trim(),
        bio: bio || null,
        image_url: image_url || null,
        website: website || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error || !artistData) {
      console.error('Error updating artist:', error);
      return NextResponse.json({ 
        error: 'Failed to update artist',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ artist: artistData });
  } catch (error: any) {
    console.error('Error in PUT /api/artists/[id]:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const serverClient = createServerClient();
    
    const { data: artistData, error } = await serverClient
      .from('artists')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error || !artistData) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json({ artist: artistData });
  } catch (error: any) {
    console.error('Error in GET /api/artists/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const serverClient = createServerClient();
    
    const { error } = await serverClient
      .from('artists')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete artist' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Artist deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/artists/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
