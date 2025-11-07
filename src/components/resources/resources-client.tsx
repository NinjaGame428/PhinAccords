'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Resource } from '@/types/resource'

interface ResourcesClientProps {}

const ResourcesClient: React.FC<ResourcesClientProps> = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    search: '',
  })

  useEffect(() => {
    fetchResources()
  }, [filters])

  const fetchResources = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('q', filters.search)

      const response = await fetch(`/api/resources?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch resources')

      const data = await response.json()
      setResources(data.resources || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Theory',
    'Scales',
    'Chords',
    'Training',
    'Templates',
    'Leadership',
    'Technical',
    'Legal',
    'Certification',
  ]

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading resources...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="resources-page">
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="template">Template</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search resources..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No resources found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="row g-4">
          {resources.map((resource) => (
            <div key={resource.id} className="col-lg-4 col-md-6">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{resource.title}</h5>
                  {resource.description && (
                    <p className="card-text text-muted small flex-grow-1">{resource.description}</p>
                  )}
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {resource.category && (
                        <span className="badge bg-secondary">{resource.category}</span>
                      )}
                      {resource.type && <span className="badge bg-info">{resource.type}</span>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {resource.downloads || 0} downloads
                        {resource.rating && (
                          <span className="ms-2">
                            <i className="bi bi-star-fill text-warning"></i> {resource.rating.toFixed(1)}
                          </span>
                        )}
                      </small>
                      {resource.file_url && (
                        <a
                          href={resource.file_url}
                          download
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            // Track download
                            fetch(`/api/resources/${resource.id}/download`, { method: 'POST' })
                          }}
                        >
                          <i className="bi bi-download me-1"></i>
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResourcesClient

