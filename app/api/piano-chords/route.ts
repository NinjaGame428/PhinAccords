import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keySignature = searchParams.get('key');
    const difficulty = searchParams.get('difficulty');
    const chordName = searchParams.get('chordName');
    
    const serverClient = createServerClient();
    
    let query = serverClient
      .from('piano_chords')
      .select('*')
      .order('chord_name', { ascending: true });

    if (keySignature) {
      query = query.eq('key_signature', keySignature);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (chordName) {
      // Search by exact chord name or root_name
      // This allows finding all inversions of a chord (e.g., "C" finds C, C/firstinversion, C/secondinversion)
      query = query.or(`chord_name.ilike.%${chordName}%,root_name.ilike.%${chordName}%`);
    }

    const { data: chords, error } = await query;

    if (error) {
      console.error('❌ Error fetching piano chords:', error);
      return NextResponse.json({ chords: [] }, { status: 200 });
    }

    console.log(`✅ Successfully fetched ${chords?.length || 0} piano chords`);

    return NextResponse.json({ chords: chords || [] });
  } catch (error: any) {
    console.error('❌ Error in GET /api/piano-chords:', error);
    return NextResponse.json({ 
      chords: [],
      error: 'Internal server error'
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      chord_name, 
      key_signature,
      difficulty,
      notes,
      finger_positions,
      description
    } = body;

    if (!chord_name || !chord_name.trim()) {
      return NextResponse.json({ 
        error: 'Chord name is required',
        details: 'Please provide a chord name'
      }, { status: 400 });
    }
    
    if (!key_signature || !key_signature.trim()) {
      return NextResponse.json({ 
        error: 'Key signature is required',
        details: 'Please provide a key signature'
      }, { status: 400 });
    }

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ 
        error: 'Notes are required',
        details: 'Please provide an array of notes'
      }, { status: 400 });
    }

    const serverClient = createServerClient();

    const { data: chordData, error } = await serverClient
      .from('piano_chords')
      .insert({
        chord_name: chord_name.trim(),
        key_signature: key_signature.trim(),
        difficulty: difficulty || 'medium',
        notes: notes,
        finger_positions: finger_positions || null,
        description: description?.trim() || null
      })
      .select()
      .single();

    if (error || !chordData) {
      console.error('Error creating piano chord:', error);
      return NextResponse.json({ 
        error: 'Failed to create piano chord',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ chord: chordData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating piano chord:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

