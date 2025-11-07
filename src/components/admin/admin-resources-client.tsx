'use client'

import React, { useState, useEffect } from 'react'
import type { Resource } from '@/types/resource'
import { useNotification } from '@/contexts/NotificationContext'

const AdminResourcesClient: React.FC = () => {
  const { success, error: notifyError } = useNotification()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    file_url: '',
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/resources')
      if (!response.ok) throw new Error('Failed to fetch resources')

      const data = await response.json()
      setResources(data.resources || [])
    } catch (err: any) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources'
      const method = editingResource ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save resource')
      }

      success(editingResource ? 'Resource updated successfully!' : 'Resource added successfully!')
      setShowAddModal(false)
      setEditingResource(null)
      setFormData({ title: '', description: '', type: '', category: '', file_url: '' })
      fetchResources()
    } catch (err: any) {
      notifyError(err.message)
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || '',
      type: resource.type || '',
      category: resource.category || '',
      file_url: resource.file_url || '',
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete resource')
      }

      success('Resource deleted successfully!')
      fetchResources()
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
    <div className="admin-resources">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Resources</h1>
        <button className="btn-one tran3s" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i>
          Add Resource
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Downloads</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.title}</td>
                    <td>{resource.type || '-'}</td>
                    <td>{resource.category || '-'}</td>
                    <td>{resource.downloads || 0}</td>
                    <td>
                      {resource.rating ? (
                        <>
                          <i className="bi bi-star-fill text-warning"></i> {resource.rating.toFixed(1)}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn-six tran3s"
                          onClick={() => handleEdit(resource)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn-six tran3s"
                          onClick={() => handleDelete(resource.id)}
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
                <h5 className="modal-title">{editingResource ? 'Edit Resource' : 'Add Resource'}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingResource(null)
                    setFormData({ title: '', description: '', type: '', category: '', file_url: '' })
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="template">Template</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3 mt-3">
                    <label className="form-label">File URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-six tran3s"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingResource(null)
                      setFormData({ title: '', description: '', type: '', category: '', file_url: '' })
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-one tran3s">
                    {editingResource ? 'Update' : 'Add'} Resource
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

export default AdminResourcesClient

