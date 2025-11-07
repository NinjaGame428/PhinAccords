'use client'

import React, { useState, useEffect } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

const AdminSettingsClient: React.FC = () => {
  const { success, error: notifyError } = useNotification()
  const [settings, setSettings] = useState({
    general: {
      siteName: 'PhinAccords',
      siteDescription: 'Gospel Music Chords & Worship Resources',
      siteUrl: '',
    },
    database: {
      status: 'connected',
      lastBackup: null as string | null,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
    notifications: {
      emailEnabled: true,
      adminNotifications: true,
    },
    performance: {
      caching: true,
      cdn: false,
      compression: true,
    },
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async (section: string) => {
    setLoading(true)
    try {
      // TODO: Implement settings save API
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
      success(`${section} settings saved successfully!`)
    } catch (err: any) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-settings">
      <h1 className="mb-4">System Settings</h1>

      {/* General Settings */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">General Settings</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Site Name</label>
              <input
                type="text"
                className="form-control"
                value={settings.general.siteName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, siteName: e.target.value },
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Site URL</label>
              <input
                type="url"
                className="form-control"
                value={settings.general.siteUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, siteUrl: e.target.value },
                  })
                }
              />
            </div>
            <div className="col-12">
              <label className="form-label">Site Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={settings.general.siteDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, siteDescription: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => handleSave('General')}
            disabled={loading}
          >
            Save General Settings
          </button>
        </div>
      </div>

      {/* Database Settings */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Database Settings</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Connection Status</label>
              <div>
                <span className={`badge ${settings.database.status === 'connected' ? 'bg-success' : 'bg-danger'}`}>
                  {settings.database.status}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Last Backup</label>
              <div>
                {settings.database.lastBackup ? (
                  <span>{new Date(settings.database.lastBackup).toLocaleString()}</span>
                ) : (
                  <span className="text-muted">No backup recorded</span>
                )}
              </div>
            </div>
          </div>
          <button className="btn btn-outline-primary mt-3">
            <i className="bi bi-download me-1"></i>
            Create Backup
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Security Settings</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorAuth: e.target.checked },
                    })
                  }
                />
                <label className="form-check-label">Enable Two-Factor Authentication</label>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Session Timeout (minutes)</label>
              <input
                type="number"
                className="form-control"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) },
                  })
                }
              />
            </div>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => handleSave('Security')}
            disabled={loading}
          >
            Save Security Settings
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Notification Settings</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailEnabled: e.target.checked },
                    })
                  }
                />
                <label className="form-check-label">Enable Email Notifications</label>
              </div>
            </div>
            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.notifications.adminNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        adminNotifications: e.target.checked,
                      },
                    })
                  }
                />
                <label className="form-check-label">Admin Notifications</label>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => handleSave('Notifications')}
            disabled={loading}
          >
            Save Notification Settings
          </button>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Performance Settings</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.performance.caching}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      performance: { ...settings.performance, caching: e.target.checked },
                    })
                  }
                />
                <label className="form-check-label">Enable Caching</label>
              </div>
            </div>
            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.performance.cdn}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      performance: { ...settings.performance, cdn: e.target.checked },
                    })
                  }
                />
                <label className="form-check-label">Enable CDN</label>
              </div>
            </div>
            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.performance.compression}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      performance: { ...settings.performance, compression: e.target.checked },
                    })
                  }
                />
                <label className="form-check-label">Enable Compression</label>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => handleSave('Performance')}
            disabled={loading}
          >
            Save Performance Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsClient

