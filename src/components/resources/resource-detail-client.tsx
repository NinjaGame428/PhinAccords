'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Resource } from '@/types/resource'
import { safeAsync, getErrorMessage } from '@/utils/error-handler'
import SongRating from '@/components/ratings/song-rating'

interface ResourceDetailClientProps {
  resource: Resource
}

const ResourceDetailClient: React.FC<ResourceDetailClientProps> = ({ resource }) => {
  const { user } = useAuth()
  const { success, error: notifyError } = useNotification()
  const { t } = useLanguage()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!user) {
      notifyError('Please log in to download resources')
      return
    }

    setDownloading(true)

    const { error } = await safeAsync(async () => {
      // Track download
      const response = await fetch('/api/resources/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resource.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to track download')
      }

      // If resource has a file_url, trigger download
      if (resource.file_url) {
        window.open(resource.file_url, '_blank')
      }

      success('Download started!')
    })

    if (error) {
      notifyError(getErrorMessage(error))
    }

    setDownloading(false)
  }

  return (
    <div className="resource-detail">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/resources">Resources</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {resource.title}
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <h1 className="h2 mb-3">{resource.title}</h1>

              <div className="d-flex flex-wrap gap-3 mb-4">
                {resource.category && (
                  <span className="badge bg-primary">{resource.category}</span>
                )}
                {resource.type && (
                  <span className="badge bg-secondary">{resource.type}</span>
                )}
                {resource.difficulty && (
                  <span className="badge bg-info">{resource.difficulty}</span>
                )}
              </div>

              {resource.description && (
                <div className="mb-4">
                  <h3 className="h5 mb-3">Description</h3>
                  <p className="text-muted">{resource.description}</p>
                </div>
              )}

              {resource.content && (
                <div className="mb-4">
                  <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                </div>
              )}

              <div className="d-flex gap-3 mt-4">
                <button
                  className="btn-one tran3s touch-target"
                  onClick={handleDownload}
                  disabled={downloading || !user}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleDownload()
                    }
                  }}
                  aria-label={`Download ${resource.title}`}
                  tabIndex={0}
                >
                  {downloading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2" aria-hidden="true"></i>
                      {t('resources.download')}
                    </>
                  )}
                </button>

                {!user && (
                  <Link href="/login" className="btn btn-outline-primary">
                    {t('nav.login')} to Download
                  </Link>
                )}
              </div>
            </div>
          </div>

          {resource.id && (
            <div className="card">
              <div className="card-body">
                <h3 className="h5 mb-3">{t('song.rating')}</h3>
                <SongRating songId={resource.id} />
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h3 className="h5 mb-3">Resource Information</h3>
              <dl className="row mb-0">
                {resource.file_type && (
                  <>
                    <dt className="col-sm-5">File Type:</dt>
                    <dd className="col-sm-7">{resource.file_type}</dd>
                  </>
                )}
                {resource.file_size && (
                  <>
                    <dt className="col-sm-5">File Size:</dt>
                    <dd className="col-sm-7">{resource.file_size}</dd>
                  </>
                )}
                {resource.downloads !== undefined && (
                  <>
                    <dt className="col-sm-5">Downloads:</dt>
                    <dd className="col-sm-7">{resource.downloads}</dd>
                  </>
                )}
                {resource.created_at && (
                  <>
                    <dt className="col-sm-5">Added:</dt>
                    <dd className="col-sm-7">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetailClient

