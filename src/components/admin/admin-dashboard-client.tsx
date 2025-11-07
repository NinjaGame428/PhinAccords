'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const AdminDashboardClient: React.FC = () => {
  const [stats, setStats] = useState({
    songs: 0,
    artists: 0,
    resources: 0,
    users: 0,
    songRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }

      const activityResponse = await fetch('/api/admin/activity?limit=10')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.activities || [])
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <Link href="/dashboard" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Dashboard
        </Link>
      </div>

      {/* System Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Songs</h6>
                  <h3 className="mb-0">{stats.songs}</h3>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-music-note-list"></i>
                </div>
              </div>
              <Link href="/admin/songs" className="btn btn-sm btn-outline-primary mt-2 w-100">
                Manage Songs
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Artists</h6>
                  <h3 className="mb-0">{stats.artists}</h3>
                </div>
                <div className="text-success" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-person-badge"></i>
                </div>
              </div>
              <Link href="/admin/artists" className="btn btn-sm btn-outline-success mt-2 w-100">
                Manage Artists
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Resources</h6>
                  <h3 className="mb-0">{stats.resources}</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-file-earmark-text"></i>
                </div>
              </div>
              <Link href="/admin/resources" className="btn btn-sm btn-outline-info mt-2 w-100">
                Manage Resources
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Users</h6>
                  <h3 className="mb-0">{stats.users}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-people"></i>
                </div>
              </div>
              <Link href="/admin/users" className="btn btn-sm btn-outline-warning mt-2 w-100">
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Quick Actions</h5>
              <div className="d-grid gap-2">
                <Link href="/admin/songs" className="btn btn-outline-primary">
                  <i className="bi bi-music-note-list me-2"></i>
                  Manage Songs
                </Link>
                <Link href="/admin/artists" className="btn btn-outline-success">
                  <i className="bi bi-person-badge me-2"></i>
                  Manage Artists
                </Link>
                <Link href="/admin/users" className="btn btn-outline-warning">
                  <i className="bi bi-people me-2"></i>
                  Manage Users
                </Link>
                <Link href="/admin/resources" className="btn btn-outline-info">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Manage Resources
                </Link>
                <Link href="/admin/analytics" className="btn btn-outline-secondary">
                  <i className="bi bi-graph-up me-2"></i>
                  View Analytics
                </Link>
                <Link href="/admin/settings" className="btn btn-outline-dark">
                  <i className="bi bi-gear me-2"></i>
                  System Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Pending Requests</h5>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Song Requests</span>
                <span className="badge bg-warning">{stats.songRequests}</span>
              </div>
              <Link href="/admin/song-requests" className="btn btn-sm btn-outline-primary w-100">
                Review Requests
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">Recent System Activity</h5>
          {recentActivity.length === 0 ? (
            <p className="text-muted mb-0">No recent activity</p>
          ) : (
            <div className="list-group list-group-flush">
              {recentActivity.map((activity, index) => (
                <div key={index} className="list-group-item px-0">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <i className={`bi ${getActivityIcon(activity.activity_type)} text-primary`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0">{activity.description || activity.activity_type}</p>
                      <small className="text-muted">
                        {new Date(activity.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'song_added':
      return 'bi-music-note-list'
    case 'user_registered':
      return 'bi-person-plus'
    case 'download':
      return 'bi-download'
    default:
      return 'bi-circle'
  }
}

export default AdminDashboardClient

