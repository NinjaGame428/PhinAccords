'use client'

import React, { useState, useEffect } from 'react'

const AnalyticsClient: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    pageViews: 0,
    downloads: 0,
    popularSongs: [],
    popularArtists: [],
    engagement: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <h1 className="mb-4">Platform Analytics</h1>

      {/* Key Metrics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Page Views</h6>
              <h3>{analytics.pageViews.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Downloads</h6>
              <h3>{analytics.downloads.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Active Users</h6>
              <h3>{analytics.engagement.activeUsers || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Avg Session</h6>
              <h3>{analytics.engagement.avgSession || '0'} min</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Songs */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Most Popular Songs</h5>
          {analytics.popularSongs.length === 0 ? (
            <p className="text-muted">No data available</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Song</th>
                    <th>Artist</th>
                    <th>Views</th>
                    <th>Downloads</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.popularSongs.map((song: any, index: number) => (
                    <tr key={song.id}>
                      <td>{index + 1}</td>
                      <td>{song.title}</td>
                      <td>{song.artist || 'Unknown'}</td>
                      <td>{song.views || 0}</td>
                      <td>{song.downloads || 0}</td>
                      <td>
                        {song.rating ? (
                          <>
                            <i className="bi bi-star-fill text-warning"></i> {song.rating.toFixed(1)}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Popular Artists */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">Most Popular Artists</h5>
          {analytics.popularArtists.length === 0 ? (
            <p className="text-muted">No data available</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Artist</th>
                    <th>Songs</th>
                    <th>Total Views</th>
                    <th>Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.popularArtists.map((artist: any, index: number) => (
                    <tr key={artist.id}>
                      <td>{index + 1}</td>
                      <td>{artist.name}</td>
                      <td>{artist.song_count || 0}</td>
                      <td>{artist.total_views || 0}</td>
                      <td>
                        {artist.avg_rating ? (
                          <>
                            <i className="bi bi-star-fill text-warning"></i> {artist.avg_rating.toFixed(1)}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsClient

