/**
 * Rate Limiting Utility
 * Simple in-memory rate limiting for API routes
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  error?: string
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 15 * 60 * 1000 } // 100 requests per 15 minutes
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    rateLimitStore.set(identifier, newEntry)
    
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  if (entry.count >= options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: 'Rate limit exceeded',
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get user ID from auth token first
  // Otherwise use IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  return ip
}

/**
 * Rate limit middleware helper
 */
export function rateLimit(options?: Partial<RateLimitOptions>) {
  const defaultOptions: RateLimitOptions = {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    ...options,
  }

  return async (request: Request): Promise<RateLimitResult> => {
    const identifier = getClientIdentifier(request)
    return checkRateLimit(identifier, defaultOptions)
  }
}

