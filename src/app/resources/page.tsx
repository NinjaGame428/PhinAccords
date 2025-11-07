import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import ResourcesClient from '@/components/resources/resources-client'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

export const metadata: Metadata = {
  title: 'Resources - PhinAccords',
  description: 'Educational resources for gospel music and worship',
}

export default function ResourcesPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title="Learning Resources"
            subtitle="Explore our collection of educational resources, guides, and tutorials to enhance your worship music skills."
            page="Resources"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <ResourcesClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

