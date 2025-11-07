// URL translations for language-aware routing
// All routes use language prefixes: /en/... or /fr/...
// Internal routes are always in English

export const routeTranslations = {
  en: {
    '/': '/',
    '/songs': '/songs',
    '/piano-chords': '/piano-chords',
    '/artists': '/artists',
    '/about': '/about',
    '/resources': '/resources',
    '/contact': '/contact',
    '/admin': '/admin',
    '/login': '/login',
    '/register': '/register',
    '/dashboard': '/dashboard',
  },
  fr: {
    '/': '/',
    '/songs': '/chansons',
    '/piano-chords': '/accords-piano',
    '/artists': '/artistes',
    '/about': '/a-propos',
    '/resources': '/ressources',
    '/contact': '/contact',
    '/admin': '/admin',
    '/login': '/connexion',
    '/register': '/inscription',
    '/dashboard': '/tableau-de-bord',
  }
};

/**
 * Get route with language prefix (e.g., /en/songs or /fr/chansons)
 * This is the main function to use for generating URLs
 */
export function getTranslatedRoute(path: string, language: 'en' | 'fr'): string {
  // Handle API routes and external URLs
  if (path.includes('/api/') || path.startsWith('http')) {
    return path;
  }

  // Handle paths with query parameters
  const [basePath, queryString] = path.split('?');
  
  // Remove any existing language prefix
  const cleanPath = basePath.replace(/^\/(en|fr)/, '') || '/';
  
  // Handle root path
  if (cleanPath === '/') {
    return queryString ? `/${language}?${queryString}` : `/${language}`;
  }

  // Handle dynamic routes like /songs/[slug] or /artists/[id]
  const dynamicPatterns = [
    { en: /^\/songs\/(.+)$/, fr: /^\/chansons\/(.+)$/, enBase: '/songs', frBase: '/chansons' },
    { en: /^\/artists\/(.+)$/, fr: /^\/artistes\/(.+)$/, enBase: '/artists', frBase: '/artistes' },
    { en: /^\/piano-chords\/(.+)$/, fr: /^\/accords-piano\/(.+)$/, enBase: '/piano-chords', frBase: '/accords-piano' },
    { en: /^\/resources\/(.+)$/, fr: /^\/ressources\/(.+)$/, enBase: '/resources', frBase: '/ressources' },
  ];

  // Check if path matches any dynamic pattern
  for (const pattern of dynamicPatterns) {
    const enMatch = cleanPath.match(pattern.en);
    const frMatch = cleanPath.match(pattern.fr);
    
    if (language === 'fr') {
      // Convert to French route if it's English
      if (enMatch && enMatch[1]) {
        const translatedPath = `/${language}${pattern.frBase}/${enMatch[1]}`;
        return queryString ? `${translatedPath}?${queryString}` : translatedPath;
      }
      // Already French, just add prefix
      if (frMatch && frMatch[1]) {
        const translatedPath = `/${language}${cleanPath}`;
        return queryString ? `${translatedPath}?${queryString}` : translatedPath;
      }
    } else {
      // Convert to English route if it's French
      if (frMatch && frMatch[1]) {
        const translatedPath = `/${language}${pattern.enBase}/${frMatch[1]}`;
        return queryString ? `${translatedPath}?${queryString}` : translatedPath;
      }
      // Already English, just add prefix
      if (enMatch && enMatch[1]) {
        const translatedPath = `/${language}${cleanPath}`;
        return queryString ? `${translatedPath}?${queryString}` : translatedPath;
      }
    }
  }

  // Handle static routes
  const langRoutes = routeTranslations[language];
  if (langRoutes && langRoutes[cleanPath]) {
    const translatedPath = `/${language}${langRoutes[cleanPath]}`;
    return queryString ? `${translatedPath}?${queryString}` : translatedPath;
  }

  // If path not in translations, return with language prefix
  const translatedPath = `/${language}${cleanPath}`;
  return queryString ? `${translatedPath}?${queryString}` : translatedPath;
}

/**
 * Get English route from any route (for internal use)
 * Removes language prefix and returns the base route
 */
export function getEnglishRoute(path: string): string {
  const [basePath, queryString] = path.split('?');
  
  // Remove language prefix
  const routeWithoutLang = basePath.replace(/^\/(en|fr)/, '') || '/';
  
  // Remove French translations and convert to English
  const frenchToEnglish: { [key: string]: string } = {
    '/chansons': '/songs',
    '/accords-piano': '/piano-chords',
    '/artistes': '/artists',
    '/a-propos': '/about',
    '/ressources': '/resources',
    '/connexion': '/login',
    '/inscription': '/register',
    '/tableau-de-bord': '/dashboard',
  };
  
  // Handle dynamic routes
  if (routeWithoutLang.startsWith('/chansons/')) {
    const slug = routeWithoutLang.replace('/chansons/', '');
    return queryString ? `/songs/${slug}?${queryString}` : `/songs/${slug}`;
  }
  
  if (routeWithoutLang.startsWith('/artistes/')) {
    const id = routeWithoutLang.replace('/artistes/', '');
    return queryString ? `/artists/${id}?${queryString}` : `/artists/${id}`;
  }
  
  if (routeWithoutLang.startsWith('/accords-piano/')) {
    const slug = routeWithoutLang.replace('/accords-piano/', '');
    return queryString ? `/piano-chords/${slug}?${queryString}` : `/piano-chords/${slug}`;
  }
  
  if (routeWithoutLang.startsWith('/ressources/')) {
    const slug = routeWithoutLang.replace('/ressources/', '');
    return queryString ? `/resources/${slug}?${queryString}` : `/resources/${slug}`;
  }
  
  // Handle static French routes
  if (frenchToEnglish[routeWithoutLang]) {
    return queryString ? `${frenchToEnglish[routeWithoutLang]}?${queryString}` : frenchToEnglish[routeWithoutLang];
  }
  
  return queryString ? `${routeWithoutLang}?${queryString}` : routeWithoutLang;
}

/**
 * Get base route (without dynamic segments) for translation
 */
export function getBaseRoute(path: string): string {
  // Remove language prefix first
  const cleanPath = path.replace(/^\/(en|fr)/, '') || '/';
  // Remove dynamic segments like [id] or UUIDs
  const pathWithoutDynamic = cleanPath.replace(/\/[^\/]+$/, '');
  // Handle root paths
  if (pathWithoutDynamic === '' || pathWithoutDynamic === '/') {
    return '/';
  }
  // Get the base route (first segment)
  const parts = pathWithoutDynamic.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  return '/' + parts[0];
}
