/**
 * PhinAccords Toolkit Page
 * Heavenkeys Ltd
 * 
 * Complete toolkit with all premium tools
 */

import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import ToolkitClient from '@/components/toolkit/toolkit-client'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'

export const metadata: Metadata = {
  title: 'Toolkit - PhinAccords',
  description: 'Advanced music tools: Tuner, Metronome, Live Chord Detection, and Practice Chords',
}

export default function ToolkitPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title="Toolkit"
            subtitle="Advanced music tools for professional musicians"
            page="Toolkit"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="container py-5">
            <ToolkitClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

