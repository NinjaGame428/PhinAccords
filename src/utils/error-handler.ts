/**
 * Error Handling Utilities
 * Centralized error handling with user-friendly messages
 */

export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: unknown
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof AuthenticationError) {
    return 'Please log in to continue'
  }

  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action'
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
  // Only log in development or when explicitly needed
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const timestamp = new Date().toISOString()
  const contextMsg = context ? `[${context}]` : ''
  
  try {
    const errorInfo: Record<string, unknown> = {
      message: getErrorMessage(error),
    }

    if (error instanceof Error) {
      errorInfo.stack = error.stack
      errorInfo.name = error.name
    } else if (error && typeof error === 'object') {
      errorInfo.error = error
    }

    console.error(`${timestamp} ${contextMsg}`, errorInfo)
  } catch (logError) {
    // Fallback if error serialization fails
    console.error(`${timestamp} ${contextMsg}`, 'Error logging failed:', logError)
  }
}

/**
 * Handle API errors with fallback
 */
export async function handleApiError<T>(
  promise: Promise<T>,
  fallback?: T,
  context?: string
): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    logError(error, context)
    
    if (fallback !== undefined) {
      return fallback
    }
    
    return null
  }
}

/**
 * Safe async function wrapper
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (error) {
    const appError: AppError = {
      message: getErrorMessage(error),
      code: error instanceof ApiError ? error.code : 'UNKNOWN_ERROR',
      statusCode: error instanceof ApiError ? error.statusCode : 500,
      details: error instanceof Error ? error.stack : error,
    }
    
    // Only log unexpected errors or errors in development
    if (process.env.NODE_ENV === 'development' || !(error instanceof ApiError)) {
      logError(error, context)
    }
    
    return { data: fallback || null, error: appError }
  }
}

/**
 * Validate and throw validation error
 */
export function validate(
  condition: boolean,
  message: string,
  field?: string
): asserts condition {
  if (!condition) {
    throw new ValidationError(message, field)
  }
}

/**
 * Create error response for API routes
 */
export function createErrorResponse(
  error: unknown,
  defaultStatusCode: number = 500
): Response {
  const message = getErrorMessage(error)
  const statusCode =
    error instanceof ApiError ? error.statusCode : defaultStatusCode

  return new Response(
    JSON.stringify({
      error: message,
      code: error instanceof ApiError ? error.code : 'UNKNOWN_ERROR',
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

