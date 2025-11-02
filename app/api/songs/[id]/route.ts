import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const serverClient = createServerClient();
    
    const { data: songData, error } = await serverClient
      .from('songs')
      .select(`
        *,
        artists:artist_id (
          id,
          name,
          bio,
          image_url
        )
      `)
      .eq('id', resolvedParams.id)
      .single();
    
    if (error || !songData) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    
    // Process artist data
    const processedSong = {
      ...songData,
      artists: Array.isArray(songData.artists) ? songData.artists[0] : songData.artists || 
        (songData.artist ? {
          id: songData.artist_id || null,
          name: songData.artist,
          bio: null,
          image_url: null
        } : null)
    };

    const response = NextResponse.json({ song: processedSong });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', '*');
    return response;
  } catch (error: any) {
    console.error('Error in GET /api/songs/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const serverClient = createServerClient();
    
    // Extract only the fields we want to update, and handle them properly
    const {
      title,
      artist_id,
      key_signature,
      tempo,
      lyrics,
      slug,
      genre,
      description,
      year
    } = body;

    // Build update object with only valid fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined && title !== null) {
      updateData.title = title.trim();
    }
    if (artist_id !== undefined && artist_id !== null) {
      updateData.artist_id = artist_id.trim();
      
      // Also update artist text field if we have artist_id
      if (artist_id) {
        try {
          const { data: artist } = await serverClient
            .from('artists')
            .select('name')
            .eq('id', artist_id)
            .single();
          
          if (artist?.name) {
            updateData.artist = artist.name;
          }
        } catch (err) {
          console.warn('Could not fetch artist name for update:', err);
        }
      }
    }
    if (key_signature !== undefined) {
      updateData.key_signature = key_signature && key_signature.trim() !== '' ? key_signature.trim() : null;
    }
    if (tempo !== undefined) {
      updateData.tempo = tempo && tempo !== '' ? parseInt(String(tempo)) || null : null;
    }
    if (lyrics !== undefined) {
      updateData.lyrics = lyrics || null;
    }
    if (slug !== undefined && slug !== null) {
      updateData.slug = slug.trim();
    }
    if (genre !== undefined) {
      updateData.genre = genre && genre.trim() !== '' ? genre.trim() : null;
    }
    if (description !== undefined) {
      updateData.description = description && description.trim() !== '' ? description.trim() : null;
    }
    if (year !== undefined) {
      updateData.year = year && year !== '' ? parseInt(String(year)) || null : null;
    }

    console.log('📝 Updating song:', {
      id: resolvedParams.id,
      updateFields: Object.keys(updateData),
      hasTitle: !!updateData.title,
      hasArtistId: !!updateData.artist_id,
      hasLyrics: !!updateData.lyrics,
      lyricsLength: updateData.lyrics?.length || 0
    });

    // First check if song exists
    const { data: existingSong, error: checkError } = await serverClient
      .from('songs')
      .select('id')
      .eq('id', resolvedParams.id)
      .single();

    if (checkError || !existingSong) {
      console.error('❌ Song not found:', checkError);
      return NextResponse.json({ 
        error: 'Song not found',
        details: process.env.NODE_ENV === 'development' ? checkError?.message : undefined
      }, { status: 404 });
    }

    // Perform the update
    const { data: updateResult, error: updateError } = await serverClient
      .from('songs')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating song:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update song',
        details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      }, { status: 500 });
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('❌ No rows updated - possible RLS policy issue');
      return NextResponse.json({ 
        error: 'Update failed - no rows affected',
        details: 'This may be due to Row Level Security policies. Please check your permissions.'
      }, { status: 500 });
    }

    // Fetch the updated song with artist relation
    const { data: songData, error: fetchError } = await serverClient
      .from('songs')
      .select(`
        *,
        artists:artist_id (
          id,
          name,
          bio,
          image_url
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !songData) {
      console.error('❌ Error fetching updated song:', fetchError);
      // Return the update result even if we can't fetch with relations
      const songWithoutRelations = updateResult[0];
      return NextResponse.json({ 
        song: {
          ...songWithoutRelations,
          artists: songWithoutRelations.artist_id ? null : null
        }
      });
    }

    // Process artist data
    const processedSong = {
      ...songData,
      artists: Array.isArray(songData.artists) ? songData.artists[0] : songData.artists || 
        (songData.artist ? {
          id: songData.artist_id || null,
          name: songData.artist,
          bio: null,
          image_url: null
        } : null)
    };

    const response = NextResponse.json({ song: processedSong });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('❌ Error in PUT /api/songs/[id]:', error);
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
      .from('songs')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/songs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
