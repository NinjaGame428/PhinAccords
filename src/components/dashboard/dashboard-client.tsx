'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import SkeletonLoader from '@/components/common/skeleton-loader'

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
    return undefined
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
      <div>
        <div className="row g-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-md-3 col-sm-6">
              <SkeletonLoader type="card" />
            </div>
          ))}
        </div>
        <SkeletonLoader type="list" lines={5} />
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div className="mb-3 mb-md-0">
              <h2 className="h3 mb-2 fw-bold">
                Welcome back{appUser?.full_name ? `, ${appUser.full_name.split(' ')[0]}` : ''}! 👋
              </h2>
              <p className="text-muted mb-0">
                Here's what's happening with your account today
              </p>
            </div>
            {appUser?.role === 'admin' && (
              <Link href="/admin" className="btn-one tran3s">
                <i className="bi bi-shield-check me-2"></i>
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card h-100 border-0 shadow-sm hover-shadow transition-base">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase small mb-2 fw-semibold">Favorites</h6>
                  <h2 className="h3 mb-0 fw-bold text-primary">{favorites.length}</h2>
                  <p className="text-muted small mb-0 mt-2">Saved songs</p>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-heart-fill text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card h-100 border-0 shadow-sm hover-shadow transition-base">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase small mb-2 fw-semibold">Downloads</h6>
                  <h2 className="h3 mb-0 fw-bold text-success">{stats.downloads}</h2>
                  <p className="text-muted small mb-0 mt-2">Resources downloaded</p>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-download text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card h-100 border-0 shadow-sm hover-shadow transition-base">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase small mb-2 fw-semibold">Ratings</h6>
                  <h2 className="h3 mb-0 fw-bold text-warning">{stats.ratings}</h2>
                  <p className="text-muted small mb-0 mt-2">Ratings given</p>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-star-fill text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card h-100 border-0 shadow-sm hover-shadow transition-base">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="text-muted text-uppercase small mb-2 fw-semibold">Member Since</h6>
                  <h6 className="h6 mb-0 fw-bold text-info">
                    {stats.memberSince
                      ? new Date(stats.memberSince).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </h6>
                  <p className="text-muted small mb-0 mt-2">Account created</p>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-calendar-check text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="card-title mb-4 fw-bold">Quick Actions</h5>
          <div className="row g-3">
            <div className="col-lg-3 col-md-6">
              <Link href="/songs" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-music-note-list me-2"></i>
                Browse Songs
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link href="/dashboard/favorites" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-heart me-2"></i>
                My Favorites
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link href="/dashboard/downloads" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-download me-2"></i>
                Downloads
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link href="/request-song" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-plus-circle me-2"></i>
                Request Song
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link href="/piano-chords" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-piano me-2"></i>
                Piano Chords
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link href="/resources" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-file-earmark-music me-2"></i>
                Resources
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link href="/dashboard/profile" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-person me-2"></i>
                Profile
              </Link>
            </div>
            <div className="col-lg-3 col-md-6">
              <Link href="/dashboard/settings" className="btn-six w-100 d-flex align-items-center justify-content-center tran3s">
                <i className="bi bi-gear me-2"></i>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0 fw-bold">Recent Activity</h5>
            <Link href="/dashboard/activity" className="btn-six tran3s">
              View All
              <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-4 text-muted mb-3"></i>
              <p className="text-muted mb-0">No recent activity</p>
              <p className="text-muted small">Start exploring songs and resources to see your activity here</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {recentActivity.map((activity, index) => (
                <div key={index} className="list-group-item px-0 border-0 border-bottom">
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1">
                      <div className={`rounded-circle p-2 bg-${getActivityColor(activity.activity_type)} bg-opacity-10`}>
                        <i className={`bi ${getActivityIcon(activity.activity_type)} text-${getActivityColor(activity.activity_type)}`}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1 fw-medium">{activity.description}</p>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
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

const getActivityColor = (type: string): string => {
  switch (type) {
    case 'favorite':
      return 'danger'
    case 'rating':
      return 'warning'
    case 'download':
      return 'success'
    case 'view':
      return 'primary'
    default:
      return 'secondary'
  }
}

export default DashboardClient
