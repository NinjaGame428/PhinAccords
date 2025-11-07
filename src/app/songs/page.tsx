import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import SongsClient from '@/components/songs/songs-client'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

export const metadata: Metadata = {
  title: 'Songs - PhinAccords',
  description: 'Browse our complete collection of gospel songs with chord charts and lyrics',
}

export default function SongsPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title="Gospel Songs Library"
            subtitle="Discover and learn gospel songs with complete chord charts, lyrics, and resources"
            page="Songs"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <SongsClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

