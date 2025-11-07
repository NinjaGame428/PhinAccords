/**
 * URL Translations
 * Handle language-specific URL routing
 */

type Language = 'en' | 'fr'

interface RouteTranslation {
  en: string
  fr: string
}

const routeTranslations: Record<string, RouteTranslation> = {
  '/': { en: '/', fr: '/' },
  '/songs': { en: '/songs', fr: '/fr/chansons' },
  '/piano-chords': { en: '/piano-chords', fr: '/fr/accords-piano' },
  '/artists': { en: '/artists', fr: '/fr/artistes' },
  '/resources': { en: '/resources', fr: '/fr/ressources' },
  '/dashboard': { en: '/dashboard', fr: '/fr/tableau-de-bord' },
  '/request-song': { en: '/request-song', fr: '/fr/demander-chanson' },
  '/login': { en: '/login', fr: '/fr/connexion' },
  '/register': { en: '/register', fr: '/fr/inscription' },
}

/**
 * Get translated URL for a given route and language
 */
export function getTranslatedUrl(path: string, language: Language): string {
  // Normalize path (remove trailing slash, handle query params)
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/'
  
  const translation = routeTranslations[normalizedPath]
  
  if (!translation) {
    // If no translation exists, return path with language prefix for French
    if (language === 'fr' && !normalizedPath.startsWith('/fr/')) {
      return `/fr${normalizedPath}`
    }
    return normalizedPath
  }

  return translation[language]
}

/**
 * Get route from translated URL
 */
export function getRouteFromTranslatedUrl(path: string): string {
  // Remove language prefix
  if (path.startsWith('/fr/')) {
    const route = path.replace('/fr', '')
    
    // Find matching English route
    for (const [enRoute, translation] of Object.entries(routeTranslations)) {
      if (translation.fr === path) {
        return enRoute
      }
    }
    
    return route
  }

  return path
}

/**
 * Detect language from URL
 */
export function detectLanguageFromUrl(path: string): Language {
  return path.startsWith('/fr/') || path === '/fr' ? 'fr' : 'en'
}

/**
 * Get all route translations
 */
export function getAllRouteTranslations(): Record<string, RouteTranslation> {
  return routeTranslations
}

