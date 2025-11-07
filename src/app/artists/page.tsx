import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import ArtistsClient from '@/components/artists/artists-client'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

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
          <BreadcrumbOne
            title="Gospel Artists"
            subtitle="Discover gospel artists and explore their music collection"
            page="Artists"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <ArtistsClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

