import { Metadata } from 'next'
import Image from 'next/image'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import LoginClient from '@/components/auth/login-client'
import girlHeadphonesImg from '@/assets/images/media/img_girl_headphones.jpg'

export const metadata: Metadata = {
  title: 'Login - PhinAccords',
  description: 'Sign in to your PhinAccords account',
}

export default function LoginPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo solid={true} />
        <main>
          <div className="container-fluid p-0">
            <div className="row g-0 min-vh-100">
              <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-lg-5">
                <div className="w-100" style={{ maxWidth: '500px' }}>
                  <LoginClient />
                </div>
              </div>
              <div className="col-lg-6 d-none d-lg-block position-relative">
                <Image
                  src={girlHeadphonesImg}
                  alt="Learn piano with PhinAccords"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

