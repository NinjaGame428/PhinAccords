import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const serverClient = createServerClient();

    // First try user_profiles table
    const { data: profile, error: profileError } = await serverClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profileError && profile) {
      return NextResponse.json({ profile });
    }

    // Fallback to users table
    const { data: user, error: userError } = await serverClient
      .from('users')
      .select('id, email, full_name, avatar_url, role, created_at, updated_at, preferences, stats')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user profile:', userError);
      return NextResponse.json({ 
        error: 'Profile not found',
        details: process.env.NODE_ENV === 'development' ? userError?.message : undefined
      }, { status: 404 });
    }

    return NextResponse.json({ 
      profile: {
        user_id: user.id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        bio: null,
        preferences: user.preferences || {},
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/users/[userId]/profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { full_name, avatar_url, bio, preferences } = body;

    const serverClient = createServerClient();

    // Try to update user_profiles first
    const { data: existingProfile } = await serverClient
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (full_name !== undefined) updateData.full_name = full_name?.trim() || null;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url?.trim() || null;
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (preferences !== undefined) updateData.preferences = preferences;

    let profile;
    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error } = await serverClient
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ 
          error: 'Failed to update profile',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
      }
      profile = updatedProfile;
    } else {
      // Create new profile
      const { data: newProfile, error } = await serverClient
        .from('user_profiles')
        .insert({
          user_id: userId,
          ...updateData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return NextResponse.json({ 
          error: 'Failed to create profile',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
      }
      profile = newProfile;
    }

    // Also update users table if full_name or avatar_url changed
    if (full_name !== undefined || avatar_url !== undefined) {
      const userUpdateData: any = {};
      if (full_name !== undefined) userUpdateData.full_name = full_name?.trim() || null;
      if (avatar_url !== undefined) userUpdateData.avatar_url = avatar_url?.trim() || null;
      if (Object.keys(userUpdateData).length > 0) {
        await serverClient
          .from('users')
          .update(userUpdateData)
          .eq('id', userId);
      }
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error in PUT /api/users/[userId]/profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

