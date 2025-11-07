'use client'

import React from 'react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onRetry) onRetry()
    }
  }

  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center p-5 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center mb-4">
        <i
          className="bi bi-exclamation-triangle text-warning"
          style={{ fontSize: '3rem' }}
          aria-hidden="true"
        ></i>
      </div>
      <h3 className="h5 mb-2">{title}</h3>
      <p className="text-muted mb-4">{message}</p>
      {onRetry && (
        <button
          className="btn-one tran3s"
          onClick={onRetry}
          onKeyDown={handleKeyDown}
          aria-label={retryLabel}
          tabIndex={0}
        >
          <i className="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
          {retryLabel}
        </button>
      )}
    </div>
  )
}

export default ErrorState

