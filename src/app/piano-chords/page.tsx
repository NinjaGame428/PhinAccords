import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import PianoChordsClient from '@/components/piano-chord/piano-chords-client'

export const metadata: Metadata = {
  title: 'Piano Chords - PhinAccords',
  description: 'Interactive piano chord library with visual diagrams and audio playback',
}

export default function PianoChordsPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <div className="row mb-4">
              <div className="col-12">
                <h1 className="mb-3">Piano Chords Library</h1>
                <p className="text-muted">
                  Explore our interactive piano chord library. Click on any chord to see the visual
                  diagram and hear how it sounds.
                </p>
              </div>
            </div>
            <PianoChordsClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

