import { Metadata } from 'next'
import Wrapper from '@/layout/wrapper'
import HeaderTwo from '@/layout/header/header-two'
import FooterOne from '@/layout/footer/footer-one'
import RegisterClient from '@/components/auth/register-client'

export const metadata: Metadata = {
  title: 'Register - PhinAccords',
  description: 'Create your PhinAccords account',
}

export default function RegisterPage() {
  return (
    <Wrapper>
      <div className="main-page-wrapper">
        <HeaderTwo />
        <main>
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5">
                <RegisterClient />
              </div>
            </div>
          </div>
        </main>
        <FooterOne />
      </div>
    </Wrapper>
  )
}

