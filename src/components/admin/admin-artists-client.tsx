'use client'

import React, { useState, useEffect } from 'react'
import type { Artist } from '@/types/song'
import { useNotification } from '@/contexts/NotificationContext'

const AdminArtistsClient: React.FC = () => {
  const { success, error: notifyError } = useNotification()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image_url: '',
    website: '',
  })
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalSongs: 0,
    avgSongsPerArtist: 0,
  })

  useEffect(() => {
    fetchArtists()
    fetchStats()
  }, [])

  const fetchArtists = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/artists')
      if (!response.ok) throw new Error('Failed to fetch artists')

      const data = await response.json()
      setArtists(data.artists || [])
    } catch (err: any) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Calculate statistics
      const response = await fetch('/api/artists')
      if (response.ok) {
        const data = await response.json()
        const totalArtists = data.artists?.length || 0

        // Get total songs
        const songsResponse = await fetch('/api/songs?limit=1000')
        const songsData = await songsResponse.json()
        const totalSongs = songsData.total || 0

        setStats({
          totalArtists,
          totalSongs,
          avgSongsPerArtist: totalArtists > 0 ? totalSongs / totalArtists : 0,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingArtist ? `/api/artists/${editingArtist.id}` : '/api/artists'
      const method = editingArtist ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save artist')
      }

      success(editingArtist ? 'Artist updated successfully!' : 'Artist added successfully!')
      setShowAddModal(false)
      setEditingArtist(null)
      setFormData({ name: '', bio: '', image_url: '', website: '' })
      fetchArtists()
      fetchStats()
    } catch (err: any) {
      notifyError(err.message)
    }
  }

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist)
    setFormData({
      name: artist.name,
      bio: artist.bio || '',
      image_url: artist.image_url || '',
      website: artist.website || '',
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artist?')) return

    try {
      const response = await fetch(`/api/artists/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete artist')
      }

      success('Artist deleted successfully!')
      fetchArtists()
      fetchStats()
    } catch (err: any) {
      notifyError(err.message)
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
    <div className="admin-artists">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Artists</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i>
          Add Artist
        </button>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Artists</h5>
              <h2 className="mb-0">{stats.totalArtists}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Songs</h5>
              <h2 className="mb-0">{stats.totalSongs}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Avg Songs/Artist</h5>
              <h2 className="mb-0">{stats.avgSongsPerArtist.toFixed(1)}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Artists Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Bio</th>
                  <th>Website</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist.id}>
                    <td>{artist.name}</td>
                    <td>
                      <small className="text-muted">
                        {artist.bio ? artist.bio.substring(0, 50) + '...' : '-'}
                      </small>
                    </td>
                    <td>
                      {artist.website ? (
                        <a href={artist.website} target="_blank" rel="noopener noreferrer">
                          <i className="bi bi-link-45deg"></i>
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(artist)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(artist.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingArtist ? 'Edit Artist' : 'Add Artist'}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingArtist(null)
                    setFormData({ name: '', bio: '', image_url: '', website: '' })
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingArtist(null)
                      setFormData({ name: '', bio: '', image_url: '', website: '' })
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingArtist ? 'Update' : 'Add'} Artist
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminArtistsClient

