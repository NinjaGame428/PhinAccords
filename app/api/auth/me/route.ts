import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch full user data from database including created_at
    const serverClient = createServerClient();
    const { data: userProfile, error } = await serverClient
      .from('users')
      .select('id, email, full_name, avatar_url, role, created_at, preferences')
      .eq('id', authUser.id)
      .single();

    if (error || !userProfile) {
      // Fallback to auth user data
      const fullName = authUser.full_name || '';
      const nameParts = fullName.split(' ');
      
      return NextResponse.json({ 
        user: {
          id: authUser.id,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: authUser.email,
          avatar: authUser.avatar_url || undefined,
          role: authUser.role,
          joinDate: authUser.created_at || new Date().toISOString(),
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: true
          },
          stats: {
            favoriteSongs: 0,
            downloadedResources: 0,
            ratingsGiven: 0,
            lastActive: new Date().toISOString()
          }
        }
      }, { status: 200 });
    }

    // Process full_name into firstName and lastName
    const fullName = userProfile.full_name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return NextResponse.json({ 
      user: {
        id: userProfile.id,
        firstName,
        lastName,
        email: userProfile.email,
        avatar: userProfile.avatar_url || undefined,
        role: userProfile.role as 'user' | 'admin' | 'moderator',
        joinDate: userProfile.created_at || new Date().toISOString(),
        preferences: userProfile.preferences || {
          language: 'en',
          theme: 'light',
          notifications: true
        },
        stats: {
          favoriteSongs: 0,
          downloadedResources: 0,
          ratingsGiven: 0,
          lastActive: new Date().toISOString()
        }
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
