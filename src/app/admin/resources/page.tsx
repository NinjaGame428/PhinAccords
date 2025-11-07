import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ProtectedRoute from '@/components/common/protected-route'
import AdminResourcesClient from '@/components/admin/admin-resources-client'

export const metadata: Metadata = {
  title: 'Manage Resources - PhinAccords Admin',
  description: 'Admin panel for managing resources',
}

export default function AdminResourcesPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ProtectedRoute requireAdmin={true}>
              <AdminResourcesClient />
            </ProtectedRoute>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

