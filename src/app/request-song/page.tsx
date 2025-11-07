import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import RequestSongClient from '@/components/song-requests/request-song-client'

export const metadata: Metadata = {
  title: 'Request a Song - PhinAccords',
  description: 'Request a gospel song to be added to our collection',
}

export default function RequestSongPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <RequestSongClient />
              </div>
            </div>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

