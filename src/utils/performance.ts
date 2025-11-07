/**
 * Performance Optimization Utilities
 * Memoization, debouncing, throttling, and code splitting helpers
 */

import React, { useMemo, useCallback, DependencyList } from 'react'

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Memoized debounce hook
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: DependencyList
): T {
  return useMemo(
    () => debounce(callback, delay) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  )
}

/**
 * Memoized throttle hook
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number,
  deps: DependencyList
): T {
  return useMemo(
    () => throttle(callback, limit) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, ...deps]
  )
}

/**
 * Lazy load component
 */
export function lazyLoad<T extends React.ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

/**
 * Optimistic update helper
 */
export interface OptimisticUpdateOptions<T> {
  currentData: T
  optimisticData: T
  onSuccess?: (data: T) => void
  onError?: (error: unknown) => void
  updateFn: () => Promise<T>
}

export async function optimisticUpdate<T>({
  currentData,
  optimisticData,
  onSuccess,
  onError,
  updateFn,
}: OptimisticUpdateOptions<T>): Promise<T> {
  // Return optimistic data immediately
  if (onSuccess) {
    onSuccess(optimisticData)
  }

  try {
    // Perform actual update
    const result = await updateFn()
    if (onSuccess) {
      onSuccess(result)
    }
    return result
  } catch (error) {
    // Revert to original data on error
    if (onError) {
      onError(error)
    } else if (onSuccess) {
      onSuccess(currentData)
    }
    throw error
  }
}

/**
 * Measure performance
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
    return result
  }
  return fn()
}

/**
 * Async performance measurement
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
    return result
  }
  return fn()
}

/**
 * Memoize expensive calculation
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: DependencyList
): T {
  return useMemo(factory, deps)
}

/**
 * Memoize callback function
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList
): T {
  return useCallback(callback, deps) as T
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, options])

  return isIntersecting
}

