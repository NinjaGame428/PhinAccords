import { Metadata } from 'next'
import Link from 'next/link'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import EnhancedSearch from '@/components/songs/enhanced-search'

export const metadata: Metadata = {
  title: '404 - Page Not Found - PhinAccords',
  description: 'The page you are looking for could not be found',
}

export default function NotFound() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="mb-4">
                  <h1 className="display-1 fw-bold text-primary">404</h1>
                  <h2 className="h3 mb-3">Page Not Found</h2>
                  <p className="text-muted mb-4">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                  </p>
                </div>

                <div className="mb-4">
                  <EnhancedSearch placeholder="Search for songs, artists, or resources..." />
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                  <Link href="/" className="btn btn-primary touch-target">
                    <i className="bi bi-house me-2" aria-hidden="true"></i>
                    Go Home
                  </Link>
                  <Link href="/songs" className="btn btn-outline-primary touch-target">
                    <i className="bi bi-music-note-beamed me-2" aria-hidden="true"></i>
                    Browse Songs
                  </Link>
                  <Link href="/artists" className="btn btn-outline-primary touch-target">
                    <i className="bi bi-people me-2" aria-hidden="true"></i>
                    Browse Artists
                  </Link>
                  <Link href="/resources" className="btn btn-outline-primary touch-target">
                    <i className="bi bi-book me-2" aria-hidden="true"></i>
                    Browse Resources
                  </Link>
                </div>

                <div className="card bg-light">
                  <div className="card-body">
                    <h3 className="h5 mb-3">Popular Pages</h3>
                    <div className="d-flex flex-wrap justify-content-center gap-3">
                      <Link href="/about" className="text-decoration-none">
                        About Us
                      </Link>
                      <span className="text-muted">•</span>
                      <Link href="/contact" className="text-decoration-none">
                        Contact
                      </Link>
                      <span className="text-muted">•</span>
                      <Link href="/tips" className="text-decoration-none">
                        Tips
                      </Link>
                      <span className="text-muted">•</span>
                      <Link href="/piano-chords" className="text-decoration-none">
                        Piano Chords
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}
