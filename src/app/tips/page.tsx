import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'
import TipsClient from '@/components/tips/tips-client'

export const metadata: Metadata = {
  title: 'Tips & Techniques - PhinAccords',
  description: 'Learn piano and guitar tips and techniques to improve your worship music skills',
}

export default function TipsPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title="Tips & Techniques"
            subtitle="Enhance your piano and guitar skills with expert tips and techniques"
            page="Tips"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <TipsClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

