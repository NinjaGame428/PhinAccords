import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import ProtectedRoute from '@/components/common/protected-route'
import FavoritesDashboard from '@/components/favorites/favorites-dashboard'

export const metadata: Metadata = {
  title: 'My Favorites - PhinAccords',
  description: 'View and manage your favorite songs and resources',
}

export default function FavoritesPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <ProtectedRoute>
              <FavoritesDashboard />
            </ProtectedRoute>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

