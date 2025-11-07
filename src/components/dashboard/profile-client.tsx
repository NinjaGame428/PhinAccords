'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { safeAsync, getErrorMessage } from '@/utils/error-handler'
import LoadingSpinner from '@/components/common/loading-spinner'
import ErrorState from '@/components/common/error-state'

const ProfileClient: React.FC = () => {
  const { user, appUser, updateProfile } = useAuth()
  const { success, error: notifyError } = useNotification()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  })

  useEffect(() => {
    if (appUser) {
      setFormData({
        full_name: appUser.full_name || '',
        email: appUser.email || user?.email || '',
      })
    }
  }, [appUser, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await safeAsync(async () => {
      if (!user) throw new Error('Not authenticated')

      const result = await updateProfile({
        full_name: formData.full_name,
      })

      if (result.error) {
        throw result.error
      }
    })

    if (error) {
      notifyError(getErrorMessage(error))
    } else {
      success('Profile updated successfully!')
    }

    setSaving(false)
  }

  if (loading) {
    return <LoadingSpinner fullPage />
  }

  if (!user) {
    return <ErrorState title="Not authenticated" message="Please log in to view your profile" />
  }

  return (
    <div className="profile-client">
      <h1 className="h2 mb-4">{t('dashboard.profile')}</h1>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <h3 className="h5 mb-4">Profile Information</h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="full_name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    aria-label="Full name"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    aria-label="Email address (read-only)"
                  />
                  <small className="form-text text-muted">
                    Email cannot be changed. Contact support if you need to update it.
                  </small>
                </div>

                {appUser?.created_at && (
                  <div className="mb-3">
                    <label className="form-label">Member Since</label>
                    <p className="form-control-plaintext">
                      {new Date(appUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className="btn-one tran3s touch-target"
                    disabled={saving}
                    aria-label="Save profile changes"
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      t('common.save')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h3 className="h5 mb-3">Account Status</h3>
              <p className="mb-2">
                <strong>Status:</strong>{' '}
                <span className="badge bg-success">Active</span>
              </p>
              {appUser?.role && (
                <p className="mb-0">
                  <strong>Role:</strong>{' '}
                  <span className="badge bg-primary">{appUser.role}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileClient

