import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getEnglishRoute } from './lib/url-translations';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internals
  // This MUST come first to prevent blocking CSS, JS, images, fonts, etc.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    // Exclude file extensions (CSS, JS, images, fonts, etc.)
    /\.(css|js|jsx|ts|tsx|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|otf|mp4|webm|pdf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // Handle language-prefixed admin routes (/fr/admin/... or /en/admin/...)
  const adminPathParts = pathname.split('/').filter(Boolean);
  if (adminPathParts.length >= 2 && (adminPathParts[0] === 'fr' || adminPathParts[0] === 'en') && adminPathParts[1] === 'admin') {
    const language = adminPathParts[0] as 'en' | 'fr';
    // Get the admin path after /fr/admin or /en/admin
    const adminPath = adminPathParts.length > 2 
      ? '/admin/' + adminPathParts.slice(2).join('/')  // e.g., /admin/songs from /fr/admin/songs
      : '/admin';  // Just /fr/admin -> /admin
    
    // Rewrite to internal admin route and set language cookie
    const url = request.nextUrl.clone();
    url.pathname = adminPath;
    url.searchParams.set('lang', language);
    
    const response = NextResponse.rewrite(url);
    response.cookies.set('language', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }
  
  // Skip middleware for admin routes (but after language prefix handling)
  if (pathname.startsWith('/admin')) {
    // Still set language cookie if not set, from query param or default
    const language = request.nextUrl.searchParams.get('lang') as 'en' | 'fr' | null || 
                     request.cookies.get('language')?.value || 
                     'en';
    
    if (language === 'en' || language === 'fr') {
      const response = NextResponse.next();
      if (!request.cookies.get('language')) {
        response.cookies.set('language', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
      }
      return response;
    }
    
    return NextResponse.next();
  }
  
  // Handle dashboard routes with language support (but not /admin)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/tableau-de-bord')) {
    const language = request.cookies.get('language')?.value || 'en';
    
    // If it's already prefixed, let it through
    if (pathname.startsWith(`/${language}/dashboard`) || pathname.startsWith(`/${language}/tableau-de-bord`)) {
      // Rewrite to internal route
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(`/${language}/tableau-de-bord`, '/dashboard').replace(`/${language}/dashboard`, '/dashboard');
      const response = NextResponse.rewrite(url);
      response.cookies.set('language', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
      return response;
    }
    
    // If not prefixed, redirect to prefixed version
    const dashboardPath = language === 'fr' ? '/tableau-de-bord' : '/dashboard';
    const url = request.nextUrl.clone();
    url.pathname = `/${language}${dashboardPath}`;
    const response = NextResponse.redirect(url);
    response.cookies.set('language', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  // Handle language-prefixed URLs (/en/... or /fr/...)
  const pathParts = pathname.split('/').filter(Boolean);
  const langPrefix = pathParts[0];
  
  if (langPrefix === 'fr' || langPrefix === 'en') {
    // Remove language prefix to get the route
    const routeWithoutLang = '/' + pathParts.slice(1).join('/') || '/';
    
    // If French, translate French routes to English routes
    let englishRoute = routeWithoutLang;
    if (langPrefix === 'fr') {
      englishRoute = getEnglishRoute(pathname);
    }
    
    // Rewrite to the actual route (internal routes are in English)
    const url = request.nextUrl.clone();
    url.pathname = englishRoute;
    
    // Set language cookie
    const response = NextResponse.rewrite(url);
    response.cookies.set('language', langPrefix, { path: '/', maxAge: 60 * 60 * 24 * 365 }); // 1 year
    
    // Also set query param for client-side access
    url.searchParams.set('lang', langPrefix);
    
    return response;
  }

  // For non-prefixed routes, detect language and redirect to prefixed version
  // Get language from cookie or default to 'en'
  const language = request.cookies.get('language')?.value || 'en';
  
  // Get the translated route for the redirect
  const routeTranslations: { [key: string]: { en: string; fr: string } } = {
    '/login': { en: '/login', fr: '/connexion' },
    '/register': { en: '/register', fr: '/inscription' },
    '/songs': { en: '/songs', fr: '/chansons' },
    '/piano-chords': { en: '/piano-chords', fr: '/accords-piano' },
    '/artists': { en: '/artists', fr: '/artistes' },
    '/about': { en: '/about', fr: '/a-propos' },
    '/resources': { en: '/resources', fr: '/ressources' },
    '/contact': { en: '/contact', fr: '/contact' },
    '/dashboard': { en: '/dashboard', fr: '/tableau-de-bord' },
  };
  
  // Handle dynamic routes
  if (pathname.startsWith('/songs/')) {
    const slug = pathname.replace('/songs/', '');
    const translated = language === 'fr' ? `/chansons/${slug}` : `/songs/${slug}`;
    const url = request.nextUrl.clone();
    url.pathname = `/${language}${translated}`;
    const response = NextResponse.redirect(url);
    response.cookies.set('language', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }
  
  if (pathname.startsWith('/artists/')) {
    const id = pathname.replace('/artists/', '');
    const translated = language === 'fr' ? `/artistes/${id}` : `/artists/${id}`;
    const url = request.nextUrl.clone();
    url.pathname = `/${language}${translated}`;
    const response = NextResponse.redirect(url);
    response.cookies.set('language', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }
  
  // Check if we need to translate the route
  let translatedPath = pathname;
  if (language === 'fr' && routeTranslations[pathname]) {
    translatedPath = routeTranslations[pathname].fr;
  }
  
  // Redirect to language-prefixed URL
  const url = request.nextUrl.clone();
  url.pathname = `/${language}${translatedPath === '/' ? '' : translatedPath}`;
  
  // Set language cookie
  const response = NextResponse.redirect(url);
  response.cookies.set('language', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Direct /admin routes (but /fr/admin and /en/admin will match)
     * - Direct /dashboard routes (but /fr/dashboard will match)
     * - Files with extensions (css, js, images, fonts, etc.)
     * 
     * Note: Routes like /fr/admin and /en/admin WILL be processed
     * because they start with /fr or /en, not /admin
     */
    '/((?!api|_next/static|_next/image|favicon.ico|^/admin|^/dashboard|.*\\.css|.*\\.js|.*\\.jsx|.*\\.ts|.*\\.tsx|.*\\.json|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.eot|.*\\.otf|.*\\.mp4|.*\\.webm|.*\\.pdf).*)',
  ],
};
