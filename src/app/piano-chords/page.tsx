import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import PianoChordsClient from '@/components/piano-chord/piano-chords-client'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

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
          <BreadcrumbOne
            title="Piano Chords Library"
            subtitle="Explore our interactive piano chord library. Click on any chord to see the visual diagram and hear how it sounds."
            page="Piano Chords"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <PianoChordsClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

