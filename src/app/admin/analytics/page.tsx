import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ProtectedRoute from '@/components/common/protected-route'
import AnalyticsClient from '@/components/admin/analytics-client'

export const metadata: Metadata = {
  title: 'Analytics - PhinAccords Admin',
  description: 'Platform analytics and insights',
}

export default function AnalyticsPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ProtectedRoute requireAdmin={true}>
              <AnalyticsClient />
            </ProtectedRoute>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

