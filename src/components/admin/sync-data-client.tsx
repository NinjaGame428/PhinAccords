'use client'

import React, { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'
import { safeAsync, getErrorMessage, ApiError } from '@/utils/error-handler'
import LoadingSpinner from '@/components/common/loading-spinner'
import ErrorState from '@/components/common/error-state'

const SyncDataClient: React.FC = () => {
  const { success, error: notifyError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    const { data: syncData, error: fetchError } = await safeAsync(
      async () => {
        const response = await fetch('/api/admin/sync-data')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`
          throw new ApiError(errorMessage, response.status)
        }

        const result = await response.json()
        
        if (!result || typeof result !== 'object') {
          throw new ApiError('Invalid response format', 500, 'INVALID_RESPONSE')
        }

        if (result.error) {
          throw new ApiError(result.error, result.statusCode || 500, result.code)
        }

        return result
      },
      undefined,
      'syncData'
    )

    if (fetchError) {
      const message = getErrorMessage(fetchError)
      setError(message)
      notifyError(message)
    } else if (syncData) {
      setData(syncData)
      success('Database data synced successfully!')
    }

    setLoading(false)
  }

  const handleDownload = (tableName: string, tableData: any[]) => {
    const json = JSON.stringify(tableData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success(`Downloaded ${tableName}.json`)
  }

  const handleDownloadAll = () => {
    if (!data?.data) return

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Downloaded all data!')
  }

  return (
    <div className="sync-data-client">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Database Sync</h1>
        <button
          className="btn-one tran3s"
          onClick={handleSync}
          disabled={loading}
          aria-label="Sync database"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Syncing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
              Sync Database
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <LoadingSpinner size="lg" text="Fetching all data from database..." />
        </div>
      )}

      {error && !loading && (
        <ErrorState
          title="Failed to sync database"
          message={error}
          onRetry={handleSync}
        />
      )}

      {data && !loading && (
        <div>
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 mb-0">Sync Summary</h3>
                <button
                  className="btn-six tran3s"
                  onClick={handleDownloadAll}
                  aria-label="Download all data"
                >
                  <i className="bi bi-download me-2" aria-hidden="true"></i>
                  Download All
                </button>
              </div>
              <p className="text-muted mb-0">
                <strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="row">
            {Object.entries(data.counts || {}).map(([table, count]: [string, any]) => (
              <div key={table} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title text-capitalize mb-1">
                          {table.replace(/_/g, ' ')}
                        </h5>
                        <p className="card-text mb-0">
                          <span className="badge bg-primary">{count} records</span>
                        </p>
                      </div>
                      <button
                        className="btn-six tran3s"
                        onClick={() => handleDownload(table, data.data[table] || [])}
                        aria-label={`Download ${table} data`}
                      >
                        <i className="bi bi-download" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.errors && Object.keys(data.errors).length > 0 && (
            <div className="alert alert-warning mt-4" role="alert">
              <h5 className="alert-heading">⚠️ Some tables had errors:</h5>
              <ul className="mb-0">
                {Object.entries(data.errors).map(([table, error]: [string, any]) => (
                  <li key={table}>
                    <strong>{table}:</strong> {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SyncDataClient

