import LoadingSpinner from '@/components/common/loading-spinner'

export default function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <LoadingSpinner size="lg" text="Loading page..." />
    </div>
  )
}

