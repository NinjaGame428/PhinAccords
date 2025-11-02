import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const serverClient = createServerClient();

    // Fetch favorites with song details
    const { data: favorites, error } = await serverClient
      .from('favorites')
      .select(`
        id,
        created_at,
        songs (
          id,
          title,
          artist,
          genre,
          key_signature,
          slug
        )
      `)
      .eq('user_id', userId)
      .not('song_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching favorite songs:', error);
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    // Transform to match FavoriteSong interface
    const favoriteSongs = (favorites || [])
      .filter(fav => fav.songs)
      .map(fav => ({
        id: fav.songs.id,
        title: fav.songs.title,
        artist: fav.songs.artist || 'Unknown Artist',
        genre: fav.songs.genre || 'Gospel',
        key_signature: fav.songs.key_signature || 'C',
        created_at: fav.created_at,
        slug: fav.songs.slug
      }));

    return NextResponse.json({ favorites: favoriteSongs });
  } catch (error: any) {
    console.error('❌ Error in GET /api/users/[userId]/favorites:', error);
    return NextResponse.json({ 
      favorites: [],
      error: 'Internal server error'
    }, { status: 200 });
  }
}

