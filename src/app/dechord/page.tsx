import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import DeChordClient from '@/components/dechord/dechord-client'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

export const metadata: Metadata = {
  title: 'Chord Analyzer - PhinAccords',
  description: 'Automatically detect chords, key, and tempo from audio files using AI-powered analysis',
}

export default function DeChordPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title="AI Chord Analyzer"
            subtitle="Upload an audio file or select a song to automatically detect chords, key, and tempo"
            page="Analyzer"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <DeChordClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

