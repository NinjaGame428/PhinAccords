import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-middleware'

/**
 * GET /api/admin/sync-data - Fetch all data from database
 * This endpoint fetches all data from all tables for syncing/backup purposes
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult.error) {
      return authResult.error
    }

    const supabase = createServerClient()

    // Fetch all data from all tables
    const [
      songsResult,
      artistsResult,
      pianoChordsResult,
      resourcesResult,
      usersResult,
      favoritesResult,
      ratingsResult,
      songRequestsResult,
      userProfilesResult,
      emailCampaignsResult,
      userActivitiesResult,
      userAnalyticsResult,
      userSessionsResult,
    ] = await Promise.all([
      // Songs
      supabase.from('songs').select('*').order('created_at', { ascending: false }),
      
      // Artists
      supabase.from('artists').select('*').order('created_at', { ascending: false }),
      
      // Piano Chords
      supabase.from('piano_chords').select('*').order('chord_name', { ascending: true }),
      
      // Resources
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      
      // Users
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      
      // Favorites
      supabase.from('favorites').select('*').order('created_at', { ascending: false }),
      
      // Ratings
      supabase.from('ratings').select('*').order('created_at', { ascending: false }),
      
      // Song Requests
      supabase.from('song_requests').select('*').order('created_at', { ascending: false }),
      
      // User Profiles
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      
      // Email Campaigns
      supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
      
      // User Activities
      supabase.from('user_activities').select('*').order('created_at', { ascending: false }),
      
      // User Analytics
      supabase.from('user_analytics').select('*').order('created_at', { ascending: false }),
      
      // User Sessions
      supabase.from('user_sessions').select('*').order('created_at', { ascending: false }),
    ])

    // Check for errors
    const errors: string[] = []
    if (songsResult.error) errors.push(`Songs: ${songsResult.error.message}`)
    if (artistsResult.error) errors.push(`Artists: ${artistsResult.error.message}`)
    if (pianoChordsResult.error) errors.push(`Piano Chords: ${pianoChordsResult.error.message}`)
    if (resourcesResult.error) errors.push(`Resources: ${resourcesResult.error.message}`)
    if (usersResult.error) errors.push(`Users: ${usersResult.error.message}`)
    if (favoritesResult.error) errors.push(`Favorites: ${favoritesResult.error.message}`)
    if (ratingsResult.error) errors.push(`Ratings: ${ratingsResult.error.message}`)
    if (songRequestsResult.error) errors.push(`Song Requests: ${songRequestsResult.error.message}`)
    if (userProfilesResult.error) errors.push(`User Profiles: ${userProfilesResult.error.message}`)
    if (emailCampaignsResult.error) errors.push(`Email Campaigns: ${emailCampaignsResult.error.message}`)
    if (userActivitiesResult.error) errors.push(`User Activities: ${userActivitiesResult.error.message}`)
    if (userAnalyticsResult.error) errors.push(`User Analytics: ${userAnalyticsResult.error.message}`)
    if (userSessionsResult.error) errors.push(`User Sessions: ${userSessionsResult.error.message}`)

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Some tables failed to fetch',
          errors,
          data: {
            songs: songsResult.data || [],
            artists: artistsResult.data || [],
            piano_chords: pianoChordsResult.data || [],
            resources: resourcesResult.data || [],
            users: usersResult.data || [],
            favorites: favoritesResult.data || [],
            ratings: ratingsResult.data || [],
            song_requests: songRequestsResult.data || [],
            user_profiles: userProfilesResult.data || [],
            email_campaigns: emailCampaignsResult.data || [],
            user_activities: userActivitiesResult.data || [],
            user_analytics: userAnalyticsResult.data || [],
            user_sessions: userSessionsResult.data || [],
          },
        },
        { status: 207 } // Multi-Status
      )
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        songs: songsResult.data?.length || 0,
        artists: artistsResult.data?.length || 0,
        piano_chords: pianoChordsResult.data?.length || 0,
        resources: resourcesResult.data?.length || 0,
        users: usersResult.data?.length || 0,
        favorites: favoritesResult.data?.length || 0,
        ratings: ratingsResult.data?.length || 0,
        song_requests: songRequestsResult.data?.length || 0,
        user_profiles: userProfilesResult.data?.length || 0,
        email_campaigns: emailCampaignsResult.data?.length || 0,
        user_activities: userActivitiesResult.data?.length || 0,
        user_analytics: userAnalyticsResult.data?.length || 0,
        user_sessions: userSessionsResult.data?.length || 0,
      },
      data: {
        songs: songsResult.data || [],
        artists: artistsResult.data || [],
        piano_chords: pianoChordsResult.data || [],
        resources: resourcesResult.data || [],
        users: usersResult.data || [],
        favorites: favoritesResult.data || [],
        ratings: ratingsResult.data || [],
        song_requests: songRequestsResult.data || [],
        user_profiles: userProfilesResult.data || [],
        email_campaigns: emailCampaignsResult.data || [],
        user_activities: userActivitiesResult.data || [],
        user_analytics: userAnalyticsResult.data || [],
        user_sessions: userSessionsResult.data || [],
      },
    })
  } catch (error: any) {
    console.error('Sync data error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

