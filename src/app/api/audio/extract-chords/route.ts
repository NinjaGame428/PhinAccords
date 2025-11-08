/**
 * PhinAccords Audio Chord Extraction API
 * Heavenkeys Ltd
 * 
 * This endpoint processes audio files and extracts chord progressions
 * by calling the Python microservice with librosa and madmom
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { hasFeature } from '@/lib/subscription';

// Note: Python service is optional. Can use DeChord service instead via /api/dechord/analyze
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  maxDuration: 300, // 5 minutes for processing
};

interface ChordSegment {
  startTime: number;
  endTime: number;
  chord: string;
  confidence: number;
}

interface BeatPosition {
  time: number;
  beat: number;
  downbeat: boolean;
}

interface ExtractionResult {
  chords: ChordSegment[];
  beats: BeatPosition[];
  tempo: number;
  key: string;
  timeSignature: string;
  duration: number;
  title?: string;
  artist?: string;
}

/**
 * Extract chords from audio file
 * POST /api/audio/extract-chords
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication from cookies/headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use anon client with user token for RLS
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check subscription for upload feature
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = (profile?.subscription_tier as string) || 'free';
    
    if (!hasFeature(tier as any, 'upload')) {
      return NextResponse.json(
        {
          error: 'Upload feature requires Basic, Premium, or Premium + Toolkit subscription',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const url = formData.get('url') as string | null;
    const title = formData.get('title') as string | null;
    const artist = formData.get('artist') as string | null;

    if (!file && !url) {
      return NextResponse.json(
        { error: 'Either file or URL is required' },
        { status: 400 }
      );
    }

    // Validate file if provided
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size exceeds 50MB limit' },
          { status: 400 }
        );
      }

      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Supported: MP3, MP4, OGG' },
          { status: 400 }
        );
      }
    }

    // Call Python service for chord extraction
    try {
      const pythonFormData = new FormData();
      if (file) {
        pythonFormData.append('file', file);
      }
      if (url) {
        pythonFormData.append('url', url);
      }
      if (title) {
        pythonFormData.append('title', title);
      }
      if (artist) {
        pythonFormData.append('artist', artist);
      }

      const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/extract-chords`, {
        method: 'POST',
        body: pythonFormData,
        headers: {
          // Don't set Content-Type, let fetch set it with boundary
        },
      });

      if (!pythonResponse.ok) {
        const errorText = await pythonResponse.text();
        throw new Error(`Python service error: ${pythonResponse.status} - ${errorText}`);
      }

      const result: ExtractionResult = await pythonResponse.json();

      // Save to database
      const { data: songData, error: dbError } = await supabase
        .from('songs')
        .insert({
          title: result.title || title || 'Untitled',
          artist: result.artist || artist || 'Unknown',
          user_id: user.id,
          chord_progression: JSON.stringify(result.chords),
          tempo: result.tempo,
          key_signature: result.key,
          time_signature: result.timeSignature,
          duration: result.duration,
          source_type: file ? 'upload' : 'url',
          source_url: url || null,
          status: 'completed',
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Failed to save song data', details: dbError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        songId: songData.id,
        result: {
          chords: result.chords,
          beats: result.beats,
          tempo: result.tempo,
          key: result.key,
          timeSignature: result.timeSignature,
          duration: result.duration,
        },
        message: 'Chords extracted successfully',
      });
    } catch (pythonError: any) {
      console.error('Python service error:', pythonError);
      return NextResponse.json(
        {
          error: 'Failed to extract chords',
          details: pythonError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error extracting chords:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract chords',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Get extraction status
 * GET /api/audio/extract-chords?songId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json(
        { error: 'songId parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: song, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .single();

    if (error || !song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      songId: song.id,
      status: song.status || 'processing',
      chords: song.chord_progression ? JSON.parse(song.chord_progression) : null,
      progress: song.processing_progress || 0,
    });
  } catch (error: any) {
    console.error('Error getting extraction status:', error);
    return NextResponse.json(
      { error: 'Failed to get extraction status' },
      { status: 500 }
    );
  }
}

