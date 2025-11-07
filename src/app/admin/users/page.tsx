import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ProtectedRoute from '@/components/common/protected-route'
import AdminUsersClient from '@/components/admin/admin-users-client'

export const metadata: Metadata = {
  title: 'Manage Users - PhinAccords Admin',
  description: 'Admin panel for managing users',
}

export default function AdminUsersPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ProtectedRoute requireAdmin={true}>
              <AdminUsersClient />
            </ProtectedRoute>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

