'use client'

import React, { useState, useEffect } from 'react'
import type { Resource } from '@/types/resource'

const DownloadsClient: React.FC = () => {
  const [downloads, setDownloads] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    type: '',
  })

  useEffect(() => {
    fetchDownloads()
  }, [filters])

  const fetchDownloads = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get user's download activities
      const activityResponse = await fetch('/api/dashboard/activity?type=download&limit=100')
      if (!activityResponse.ok) throw new Error('Failed to fetch downloads')

      const activityData = await activityResponse.json()
      const resourceIds = activityData.activities
        ?.map((a: any) => a.metadata?.resource_id)
        .filter((id: string) => id) || []

      if (resourceIds.length === 0) {
        setDownloads([])
        setLoading(false)
        return
      }

      // Fetch resource details
      const resourcesResponse = await fetch(`/api/resources?ids=${resourceIds.join(',')}`)
      if (!resourcesResponse.ok) throw new Error('Failed to fetch resources')

      const resourcesData = await resourcesResponse.json()
      let resources = resourcesData.resources || []

      // Apply filters
      if (filters.search) {
        resources = resources.filter(
          (r: Resource) =>
            r.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            (r.description && r.description.toLowerCase().includes(filters.search.toLowerCase()))
        )
      }

      if (filters.type) {
        resources = resources.filter((r: Resource) => r.type === filters.type)
      }

      setDownloads(resources)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading downloads...</span>
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
    <div className="downloads-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Downloads</h1>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '300px' }}
            placeholder="Search downloads..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="form-select"
            style={{ maxWidth: '150px' }}
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
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-download display-1 text-muted"></i>
          <h3 className="mt-3">No downloads yet</h3>
          <p className="text-muted">Start downloading resources to see them here</p>
          <a href="/resources" className="btn btn-primary">
            Browse Resources
          </a>
        </div>
      ) : (
        <div className="row g-4">
          {downloads.map((resource) => (
            <div key={resource.id} className="col-md-6 col-lg-4">
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
                        {resource.file_size && (
                          <span>
                            {(resource.file_size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                      </small>
                      {resource.file_url && (
                        <a
                          href={resource.file_url}
                          download
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            fetch(`/api/resources/${resource.id}/download`, { method: 'POST' })
                          }}
                        >
                          <i className="bi bi-download me-1"></i>
                          Download Again
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

export default DownloadsClient

