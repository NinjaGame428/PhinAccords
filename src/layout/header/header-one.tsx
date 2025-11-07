'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// internal
import Navbar from './navbar';
import icon_1 from '@/assets/images/icon/icon_14.svg';
import icon_2 from '@/assets/images/icon/icon_15.svg';
import icon_3 from '@/assets/images/icon/icon_16.svg';
import LoginModal from '@/components/common/login-modal';
import useSticky from '@/hooks/use-sticky';

const HeaderOne = () => {
  const {sticky} = useSticky();
  return (
    <>
      <header className={`theme-main-menu menu-overlay menu-style-two sticky-menu ${sticky?'fixed':''}`}>
        <div className="gap-fix info-row">
          <div className="d-md-flex justify-content-between">
            <div className="greetings text-center"><span className="opacity-50">Hello!!</span> <span className="fw-500">Welcome to babun.</span></div>
            <ul className="style-none d-none d-md-flex contact-info">
              <li className="d-flex align-items-center">
                <Image src={icon_1} alt="icon" className="lazy-img icon me-2" /> 
                <Link href="mailto:babuninc@company.com" className="fw-500">babuninc@company.com</Link>
                </li>
              <li className="d-flex align-items-center">
                <Image src={icon_2} alt="icon" className="lazy-img icon me-2" /> 
                <Link href="tel:+757 699-4478" className="fw-500">+757 699-4478</Link>
                </li>
            </ul>
          </div>
        </div>
        <div className="inner-content gap-fix">
          <div className="top-header position-relative">
            <div className="d-flex align-items-center">
              <div className="logo order-lg-0">
                <Link href="/" className="d-flex align-items-center">
                  <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                    <path d="M3.52284 6.36735C-1.18425 11.7888 -0.605111 19.9994 4.81623 24.7064C10.2376 29.4135 18.4482 28.8344 23.1552 23.413C27.8623 17.9916 27.2833 9.78105 21.8619 5.07396C16.4405 0.366943 8.22992 0.945938 3.52284 6.36735Z" fill="#196164"/>
                    <path d="M24.6751 1.19349C24.2774 1.27996 24.1775 1.78681 24.4848 2.05364C31.5742 8.20893 32.3315 18.946 26.1762 26.0354C25.9093 26.3427 26.0794 26.8305 26.4853 26.8603C30.4346 27.1501 34.4669 25.6383 37.2627 22.4181C41.9698 16.9968 41.3908 8.78616 35.9693 4.07908C32.7492 1.2832 28.5447 0.352249 24.6751 1.19349Z" fill="#C4F500"/>
                  </svg>
                  <span className="fw-bold" style={{ fontSize: '24px', lineHeight: '29px', letterSpacing: '0.5px' }}>PhinAccords</span>
                </Link>
              </div>

              <div className="right-widget order-lg-3 ms-auto">
                <ul className="d-flex align-items-center style-none">
                  <li className="d-flex align-items-center login-btn-one me-3 me-md-0">
                    <Image src={icon_3} alt="icon" className="lazy-img icon me-2" />
                    <Link href="#" data-bs-toggle="modal" data-bs-target="#loginModal" className="fw-500">Login</Link>
                  </li>
                  <li className="d-none d-md-inline-block ms-3 ms-lg-5 me-3 me-lg-0">
                    <Link href="#" data-bs-toggle="modal" data-bs-target="#loginModal" className="signup-btn-one icon-link">
                      <span>Signup</span>
                      <div className="icon rounded-circle d-flex align-items-center justify-content-center"><i className="bi bi-arrow-right"></i></div>
                    </Link>
                  </li>
                </ul>
              </div>
              <nav className="navbar navbar-expand-lg p0 ms-lg-5 order-lg-2">
                <button className="navbar-toggler d-block d-lg-none" type="button" data-bs-toggle="collapse"
                  data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                  aria-label="Toggle navigation">
                  <span></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  {/* header navbar start */}
                  <Navbar/>
                  {/* header navbar end */}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* login modal start */}
      <LoginModal/>
      {/* login modal end */}
    </>
  );
};

export default HeaderOne;