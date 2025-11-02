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
    // First get favorites that have song_id
    const { data: favorites, error } = await serverClient
      .from('favorites')
      .select(`
        id,
        created_at,
        song_id
      `)
      .eq('user_id', userId)
      .not('song_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching favorites:', error);
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    if (!favorites || favorites.length === 0) {
      return NextResponse.json({ favorites: [] });
    }

    // Fetch song details separately for each favorite
    const favoriteSongs = await Promise.all(
      favorites.map(async (fav) => {
        const { data: song } = await serverClient
          .from('songs')
          .select('id, title, artist, genre, key_signature, slug')
          .eq('id', fav.song_id)
          .single();

        if (!song) return null;

        return {
          id: song.id,
          title: song.title,
          artist: song.artist || 'Unknown Artist',
          genre: song.genre || 'Gospel',
          key_signature: song.key_signature || 'C',
          created_at: fav.created_at,
          slug: song.slug
        };
      })
    );

    // Filter out null values
    const validFavorites = favoriteSongs.filter((fav): fav is NonNullable<typeof fav> => fav !== null);

    return NextResponse.json({ favorites: validFavorites });
  } catch (error: any) {
    console.error('❌ Error in GET /api/users/[userId]/favorites:', error);
    return NextResponse.json({ 
      favorites: [],
      error: 'Internal server error'
    }, { status: 200 });
  }
}

