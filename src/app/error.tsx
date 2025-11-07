'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ErrorState from '@/components/common/error-state'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ErrorState
              title="Something went wrong!"
              message={error.message || 'An unexpected error occurred. Please try again.'}
              onRetry={reset}
              retryLabel="Try Again"
            />
            <div className="text-center mt-4">
              <Link href="/" className="btn btn-outline-primary">
                Go Home
              </Link>
            </div>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

