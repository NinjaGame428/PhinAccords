'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'

const DashboardClient: React.FC = () => {
  const { user, appUser } = useAuth()
  const { favorites } = useFavorites()
  const [stats, setStats] = useState({
    favorites: 0,
    downloads: 0,
    ratings: 0,
    memberSince: '',
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch user stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/dashboard/activity?limit=5')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.activities || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Welcome back{appUser?.full_name ? `, ${appUser.full_name}` : ''}!</h1>
          <p className="text-muted mb-0">Here's what's happening with your account</p>
        </div>
        {appUser?.role === 'admin' && (
          <Link href="/admin" className="btn btn-outline-primary">
            <i className="bi bi-shield-check me-1"></i>
            Admin Panel
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Favorites</h6>
                  <h3 className="mb-0">{favorites.length}</h3>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-heart-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Downloads</h6>
                  <h3 className="mb-0">{stats.downloads}</h3>
                </div>
                <div className="text-success" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-download"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Ratings Given</h6>
                  <h3 className="mb-0">{stats.ratings}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-star-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Member Since</h6>
                  <h6 className="mb-0">
                    {stats.memberSince
                      ? new Date(stats.memberSince).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </h6>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>
                  <i className="bi bi-calendar-check"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Quick Actions</h5>
          <div className="row g-3">
            <div className="col-md-3 col-sm-6">
              <Link href="/" className="btn btn-outline-primary w-100">
                <i className="bi bi-music-note-list me-1"></i>
                Browse Songs
              </Link>
            </div>
            <div className="col-md-3 col-sm-6">
              <Link href="/dashboard/favorites" className="btn btn-outline-primary w-100">
                <i className="bi bi-heart me-1"></i>
                My Favorites
              </Link>
            </div>
            <div className="col-md-3 col-sm-6">
              <Link href="/dashboard/downloads" className="btn btn-outline-primary w-100">
                <i className="bi bi-download me-1"></i>
                Downloads
              </Link>
            </div>
            <div className="col-md-3 col-sm-6">
              <Link href="/request-song" className="btn btn-outline-primary w-100">
                <i className="bi bi-plus-circle me-1"></i>
                Request Song
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Recent Activity</h5>
            <Link href="/dashboard/activity" className="btn btn-sm btn-outline-secondary">
              View All
            </Link>
          </div>
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
                      <p className="mb-0">{activity.description}</p>
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

export default DashboardClient

