'use client'

import React, { useState, useEffect } from 'react'

const ActivityClient: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: '',
  })

  useEffect(() => {
    fetchActivities()
  }, [filters])

  const fetchActivities = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      params.append('limit', '50')

      const response = await fetch(`/api/dashboard/activity?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch activities')

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activityTypes = [
    { value: '', label: 'All Activities' },
    { value: 'favorite', label: 'Favorites' },
    { value: 'rating', label: 'Ratings' },
    { value: 'download', label: 'Downloads' },
    { value: 'view', label: 'Views' },
  ]

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading activity...</span>
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
    <div className="activity-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Activity History</h1>
        <select
          className="form-select"
          style={{ maxWidth: '200px' }}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          {activityTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-clock-history display-1 text-muted"></i>
          <h3 className="mt-3">No activity yet</h3>
          <p className="text-muted">Your activity will appear here</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="timeline">
              {activities.map((activity, index) => (
                <div key={activity.id || index} className="timeline-item mb-4">
                  <div className="d-flex">
                    <div className="me-3">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className={`bi ${getActivityIcon(activity.activity_type)}`}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{activity.description || activity.activity_type}</h6>
                          {activity.page && (
                            <small className="text-muted">
                              <i className="bi bi-file-earmark me-1"></i>
                              {activity.page}
                            </small>
                          )}
                        </div>
                        <small className="text-muted">
                          {new Date(activity.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'favorite':
      return 'bi-heart-fill'
    case 'rating':
      return 'bi-star-fill'
    case 'download':
      return 'bi-download'
    case 'view':
      return 'bi-eye'
    default:
      return 'bi-circle'
  }
}

export default ActivityClient

