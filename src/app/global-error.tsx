'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import ErrorState from '@/components/common/error-state'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="container py-5">
          <ErrorState
            title="Application Error"
            message="A critical error occurred. Please refresh the page or contact support if the problem persists."
            onRetry={reset}
            retryLabel="Reload Page"
          />
          <div className="text-center mt-4">
            <Link href="/" className="btn btn-primary">
              Go to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}

