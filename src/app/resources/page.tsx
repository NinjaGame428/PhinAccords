import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ResourcesClient from '@/components/resources/resources-client'

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
          <div className="container py-5">
            <div className="row mb-4">
              <div className="col-12">
                <h1 className="mb-3">Learning Resources</h1>
                <p className="text-muted">
                  Explore our collection of educational resources, guides, and tutorials to enhance
                  your worship music skills.
                </p>
              </div>
            </div>
            <ResourcesClient />
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

