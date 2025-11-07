import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ProtectedRoute from '@/components/common/protected-route'
import AdminSettingsClient from '@/components/admin/admin-settings-client'

export const metadata: Metadata = {
  title: 'System Settings - PhinAccords Admin',
  description: 'System configuration and settings',
}

export default function AdminSettingsPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ProtectedRoute requireAdmin={true}>
              <AdminSettingsClient />
            </ProtectedRoute>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

