'use client'

import React from 'react'

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'list' | 'image' | 'avatar'
  lines?: number
  className?: string
  width?: string
  height?: string
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  lines = 3,
  className = '',
  width,
  height,
}) => {
  const baseClasses = 'skeleton-loader'

  if (type === 'card') {
    return (
      <div className={`${baseClasses} skeleton-card ${className}`} aria-hidden="true">
        <div className="skeleton-image" style={{ height: height || '200px' }}></div>
        <div className="skeleton-content p-3">
          <div className="skeleton-line mb-2" style={{ width: width || '80%' }}></div>
          <div className="skeleton-line mb-2" style={{ width: width || '60%' }}></div>
          <div className="skeleton-line" style={{ width: width || '40%' }}></div>
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={`${baseClasses} skeleton-list ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton-line mb-2" style={{ width: width || '100%' }}></div>
        ))}
      </div>
    )
  }

  if (type === 'image') {
    return (
      <div
        className={`${baseClasses} skeleton-image ${className}`}
        style={{ width: width || '100%', height: height || '200px' }}
        aria-hidden="true"
      ></div>
    )
  }

  if (type === 'avatar') {
    return (
      <div
        className={`${baseClasses} skeleton-avatar ${className}`}
        style={{ width: width || '50px', height: height || '50px' }}
        aria-hidden="true"
      ></div>
    )
  }

  // Default: text lines
  return (
    <div className={`${baseClasses} skeleton-text ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line mb-2"
          style={{
            width: i === lines - 1 ? width || '60%' : '100%',
          }}
        ></div>
      ))}
    </div>
  )
}

export default SkeletonLoader

