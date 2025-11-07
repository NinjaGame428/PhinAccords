import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import BreadcrumbOne from '@/components/breadcrumb/breadcrumb-one'
import FooterOne from '@/layout/footer/footer-one'
import about_bg from '@/assets/images/media/img_26.jpg'
import shape from '@/assets/images/shape/shape_25.svg'
import TextFeatureOne from '@/components/text-feature/text-feature-one'
import BlockFeatureOne from '@/components/block-feature/block-feature-one'
import TextFeatureThree from '@/components/text-feature/text-feature-three'
import FeedbackOne from '@/components/feedback/feedback-one'
import FancyBannerThree from '@/components/fancy-banner/fancy-banner-three'

export const metadata: Metadata = {
  title: 'About Us - PhinAccords',
  description: 'Learn about PhinAccords - Your gateway to gospel music worship and piano learning',
}

export default function AboutPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <BreadcrumbOne
            title="About PhinAccords"
            subtitle="Empowering worship through gospel music and piano education. Learn to play and worship with your piano."
            page="About"
            bg_img={about_bg}
            shape={shape}
            style_2={true}
          />

          <div className="text-feature-one mt-150 lg-mt-80 pb-150 lg-pb-80">
            <div className="container">
              <div className="row">
                <div className="col-lg-10 m-auto">
                  <div className="title-one text-center mb-60 lg-mb-40">
                    <div className="upper-title">Our Mission</div>
                    <h2>Making Anyone an Accomplished Worship Pianist</h2>
                  </div>
                  <p className="text-lg text-center mb-50">
                    PhinAccords is dedicated to providing 100% gospel songs and resources to help you become a skilled worship pianist. 
                    We believe in spiritual distinction, pure worship, and making gospel music accessible to everyone.
                  </p>
                </div>
              </div>

              <div className="row mt-80 lg-mt-40">
                <div className="col-lg-6 mb-40">
                  <div className="card h-100 p-4">
                    <h4 className="h5 mb-3">Spiritual Distinction & Pure Worship</h4>
                    <p className="mb-0">
                      We are committed to providing exclusively gospel and Christian worship resources. 
                      Every song, chord, and resource is carefully curated to maintain spiritual integrity 
                      and support authentic worship experiences.
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 mb-40">
                  <div className="card h-100 p-4">
                    <h4 className="h5 mb-3">Easy Access & Service Efficiency</h4>
                    <p className="mb-0">
                      Our platform is designed for easy navigation and quick access to the resources you need. 
                      Whether you're searching for a specific song, learning a chord, or exploring resources, 
                      we make it simple and efficient.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TextFeatureOne style_2={true} />

          <BlockFeatureOne style_2={true} />

          <div className="text-feature-three mt-150 lg-mt-80 pb-150 lg-pb-80">
            <div className="container">
              <div className="row">
                <div className="col-lg-10 m-auto">
                  <div className="title-one text-center mb-60 lg-mb-40">
                    <div className="upper-title">Our Values</div>
                    <h2>What We Stand For</h2>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-4 mb-30">
                  <div className="card h-100 p-4 text-center">
                    <div className="mb-3">
                      <i className="bi bi-heart-fill text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5 className="mb-3">Ministry & Authentic Worship</h5>
                    <p className="mb-0">
                      We support authentic worship experiences that honor God and edify the church.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 mb-30">
                  <div className="card h-100 p-4 text-center">
                    <div className="mb-3">
                      <i className="bi bi-music-note-beamed text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5 className="mb-3">Targeted Gospel Resources</h5>
                    <p className="mb-0">
                      Every resource is specifically chosen to support gospel music learning and worship ministry.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 mb-30">
                  <div className="card h-100 p-4 text-center">
                    <div className="mb-3">
                      <i className="bi bi-star-fill text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5 className="mb-3">Excellence in Service</h5>
                    <p className="mb-0">
                      We strive for excellence in everything we do, from accurate chord charts to comprehensive learning resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FeedbackOne cls="top-border pt-80 pb-80" />

          <FancyBannerThree />
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

