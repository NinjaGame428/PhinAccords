'use client'

import React from 'react'

type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewChange: (mode: ViewMode) => void
  className?: string
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewChange,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, mode: ViewMode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onViewChange(mode)
    }
  }

  return (
    <div className={`btn-group ${className}`} role="group" aria-label="View mode selection">
      <button
        type="button"
        className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => onViewChange('grid')}
        onKeyDown={(e) => handleKeyDown(e, 'grid')}
        aria-pressed={viewMode === 'grid'}
        aria-label="Grid view"
        tabIndex={0}
      >
        <i className="bi bi-grid-3x3-gap" aria-hidden="true"></i>
        <span className="d-none d-md-inline ms-1">Grid</span>
      </button>
      <button
        type="button"
        className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => onViewChange('list')}
        onKeyDown={(e) => handleKeyDown(e, 'list')}
        aria-pressed={viewMode === 'list'}
        aria-label="List view"
        tabIndex={0}
      >
        <i className="bi bi-list" aria-hidden="true"></i>
        <span className="d-none d-md-inline ms-1">List</span>
      </button>
    </div>
  )
}

export default ViewToggle

