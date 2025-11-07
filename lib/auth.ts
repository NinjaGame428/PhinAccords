import { supabase, createServerClient } from './supabase';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'moderator' | 'admin';
  created_at?: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) return null;
    
    const serverClient = createServerClient();
    const { data: { user }, error } = await serverClient.auth.getUser(accessToken);
    
    if (error || !user) return null;
    
    // Get user profile from public.users table
    const { data: profile } = await serverClient
      .from('users')
      .select('id, email, full_name, avatar_url, role, created_at')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      // Fallback to auth user data if profile doesn't exist
      return {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'user',
        created_at: user.created_at || new Date().toISOString()
      };
    }
    
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      created_at: profile.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const serverClient = createServerClient();
    const { data, error } = await serverClient
      .from('users')
      .select('id, email, full_name, avatar_url, role')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      role: data.role
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const serverClient = createServerClient();
    const { data, error } = await serverClient
      .from('users')
      .select('id, email, full_name, avatar_url, role')
      .eq('email', email.toLowerCase().trim())
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      role: data.role
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}
