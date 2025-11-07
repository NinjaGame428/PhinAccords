/**
 * Responsive Design Utilities
 */

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1024,
} as const

export type Breakpoint = keyof typeof breakpoints

/**
 * Check if current viewport matches breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false

  const width = window.innerWidth
  const bp = breakpoints[breakpoint]

  switch (breakpoint) {
    case 'mobile':
      return width < bp
    case 'tablet':
      return width >= breakpoints.mobile && width < bp
    case 'desktop':
      return width >= bp
    default:
      return false
  }
}

/**
 * Get responsive class names based on breakpoint
 */
export function getResponsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  const classes = [mobile]
  
  if (tablet) {
    classes.push(`md:${tablet}`)
  }
  
  if (desktop) {
    classes.push(`lg:${desktop}`)
  }
  
  return classes.join(' ')
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Get viewport dimensions
 */
export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

