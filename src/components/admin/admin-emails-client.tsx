'use client'

import React, { useState, useEffect } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: string
  sent_count: number
  open_count: number
  click_count: number
  created_at: string
}

const AdminEmailsClient: React.FC = () => {
  const { success, error: notifyError } = useNotification()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
  })

  useEffect(() => {
    fetchCampaigns()
    fetchAnalytics()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/emails/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/emails/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
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
    <div className="admin-emails">
      <h1 className="mb-4">Email Management</h1>

      {/* Analytics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Sent</h6>
              <h3>{analytics.totalSent.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Opened</h6>
              <h3>{analytics.totalOpened.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Open Rate</h6>
              <h3>{analytics.openRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Click Rate</h6>
              <h3>{analytics.clickRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Email Campaigns</h5>
          <button className="btn btn-primary btn-sm">
            <i className="bi bi-plus-circle me-1"></i>
            New Campaign
          </button>
        </div>
        <div className="card-body">
          {campaigns.length === 0 ? (
            <p className="text-muted">No campaigns yet</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Sent</th>
                    <th>Opened</th>
                    <th>Clicked</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.subject}</td>
                      <td>
                        <span
                          className={`badge ${
                            campaign.status === 'sent'
                              ? 'bg-success'
                              : campaign.status === 'sending'
                                ? 'bg-warning'
                                : 'bg-secondary'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td>{campaign.sent_count}</td>
                      <td>{campaign.open_count}</td>
                      <td>{campaign.click_count}</td>
                      <td>{new Date(campaign.created_at).toLocaleDateString()}</td>
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

export default AdminEmailsClient

