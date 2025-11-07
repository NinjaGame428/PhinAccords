import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ProtectedRoute from '@/components/common/protected-route'
import AdminArtistsClient from '@/components/admin/admin-artists-client'

export const metadata: Metadata = {
  title: 'Manage Artists - PhinAccords Admin',
  description: 'Admin panel for managing artists',
}

export default function AdminArtistsPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ProtectedRoute requireAdmin={true}>
              <AdminArtistsClient />
            </ProtectedRoute>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

