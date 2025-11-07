import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ArtistsClient from '@/components/artists/artists-client'

export const metadata: Metadata = {
  title: 'Artists - PhinAccords',
  description: 'Browse all gospel artists and their songs',
}

export default function ArtistsPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <div className="row mb-4">
              <div className="col-12">
                <h1 className="mb-3">Artists</h1>
                <p className="text-muted">Discover gospel artists and explore their music</p>
              </div>
            </div>
            <ArtistsClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

