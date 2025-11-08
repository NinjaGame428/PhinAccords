import { NextRequest, NextResponse } from 'next/server'

/**
 * DeChord YouTube Analysis API Route
 * PhinAccords - Heavenkeys Ltd
 * 
 * Proxies YouTube URL requests to the DeChord service
 * Handles YouTube URL and forwards to DeChord service for analysis
 */

export async function POST(request: NextRequest) {
  try {
    const DECHORD_SERVICE_URL = process.env.DECHORD_SERVICE_URL || process.env.NEXT_PUBLIC_DECHORD_SERVICE_URL

    if (!DECHORD_SERVICE_URL) {
      return NextResponse.json(
        { error: 'DeChord service URL not configured' },
        { status: 500 }
      )
    }

    // Get form data from request
    const formData = await request.formData()
    const url = formData.get('url') as string

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    // Validate YouTube URL
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // Forward to DeChord service
    const response = await fetch(`${DECHORD_SERVICE_URL}/analyze-youtube`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      return NextResponse.json(
        { error: errorData.detail || `DeChord service error: ${response.status}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('DeChord YouTube analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze YouTube video' },
      { status: 500 }
    )
  }
}

