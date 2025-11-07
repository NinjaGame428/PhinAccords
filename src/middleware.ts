import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectLanguageFromUrl, getTranslatedUrl } from '@/lib/url-translations'

type Language = 'en' | 'fr'

/**
 * Get language from various sources (priority order)
 */
function getLanguage(request: NextRequest): Language {
  const { pathname } = request.nextUrl

  // 1. Check URL path
  const urlLang = detectLanguageFromUrl(pathname)
  if (urlLang) {
    return urlLang
  }

  // 2. Check cookie
  const cookieLang = request.cookies.get('language')?.value as Language
  if (cookieLang === 'en' || cookieLang === 'fr') {
    return cookieLang
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    if (acceptLanguage.includes('fr')) {
      return 'fr'
    }
  }

  // 4. Default to English
  return 'en'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const language = getLanguage(request)

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Set language cookie if not already set
  const response = NextResponse.next()
  
  // Only set cookie if it's different or doesn't exist
  const currentCookie = request.cookies.get('language')?.value
  if (currentCookie !== language) {
    response.cookies.set('language', language, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    })
  }

  // Handle language-specific redirects for main routes
  const mainRoutes = ['/songs', '/piano-chords', '/artists', '/resources', '/dashboard', '/request-song', '/login', '/register']
  const isMainRoute = mainRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))

  if (isMainRoute && !pathname.startsWith('/fr/')) {
    const translatedUrl = getTranslatedUrl(pathname, language)
    
    // Only redirect if the URL should be different
    if (translatedUrl !== pathname && language === 'fr') {
      const url = request.nextUrl.clone()
      url.pathname = translatedUrl
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

