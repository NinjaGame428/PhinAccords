'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  fullPage = false,
  text,
}) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg',
  }

  const spinner = (
    <div
      className={`spinner-border ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={text || 'Loading'}
    >
      <span className="visually-hidden">{text || 'Loading...'}</span>
    </div>
  )

  if (fullPage) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-center">
          {spinner}
          {text && (
            <div className="mt-3 text-muted" role="status">
              {text}
            </div>
          )}
        </div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner

