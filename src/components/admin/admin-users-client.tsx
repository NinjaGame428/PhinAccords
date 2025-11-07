'use client'

import React, { useState, useEffect } from 'react'
import type { User } from '@/types/user'
import { useNotification } from '@/contexts/NotificationContext'

const AdminUsersClient: React.FC = () => {
  const { success, error: notifyError } = useNotification()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [searchQuery])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err: any) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user role')
      }

      success('User role updated successfully!')
      fetchUsers()
    } catch (err: any) {
      notifyError(err.message)
    }
  }

  const handleBanToggle = async (user: User) => {
    const action = user.is_banned ? 'unban' : 'ban'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_banned: !user.is_banned,
          status: !user.is_banned ? 'banned' : 'active',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${action} user`)
      }

      success(`User ${action}ned successfully!`)
      fetchUsers()
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
    <div className="admin-users">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Users</h1>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '300px' }}
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || user.first_name || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.is_banned
                            ? 'bg-danger'
                            : user.status === 'active'
                              ? 'bg-success'
                              : 'bg-secondary'
                        }`}
                      >
                        {user.is_banned ? 'Banned' : user.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      {user.join_date
                        ? new Date(user.join_date).toLocaleDateString()
                        : new Date(user.created_at || '').toLocaleDateString()}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className={`btn ${user.is_banned ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleBanToggle(user)}
                        >
                          <i className={`bi ${user.is_banned ? 'bi-unlock' : 'bi-lock'}`}></i>
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
    </div>
  )
}

export default AdminUsersClient

