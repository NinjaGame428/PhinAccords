import { NextRequest, NextResponse } from 'next/server'

/**
 * DeChord Analysis API Route
 * PhinAccords - Heavenkeys Ltd
 * 
 * Proxies requests to the DeChord service
 * Handles file uploads and forwards to DeChord service
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

    // Forward to DeChord service
    const response = await fetch(`${DECHORD_SERVICE_URL}/analyze`, {
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
    console.error('DeChord analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze audio' },
      { status: 500 }
    )
  }
}

