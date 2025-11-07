'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
// internal
import Navbar from "./navbar";
import useSticky from "@/hooks/use-sticky";
import LoginModal from "@/components/common/login-modal";

const HeaderTwo = () => {
  const {sticky} = useSticky();
  return (
    <>
      <header className={`theme-main-menu menu-overlay menu-style-one white-vr sticky-menu ${sticky?'fixed':''}`}>
        <div className="inner-content position-relative">
          <div className="top-header">
            <div className="d-flex align-items-center justify-content-between">
              <div className="logo order-lg-0">
                <Link href="/" className="d-flex align-items-center">
                  <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                    <path d="M3.18388 6.36186C-1.52321 11.7827 -0.944074 19.9924 4.47727 24.6989C9.89868 29.4054 18.1092 28.8264 22.8163 23.4056C27.5234 17.9848 26.9443 9.77518 21.5229 5.06861C16.1016 0.362111 7.89096 0.941042 3.18388 6.36186Z" fill="#FFDB1E"/>
                    <path d="M24.3361 1.18855C23.9384 1.27502 23.8386 1.7818 24.1459 2.0486C31.2353 8.20322 31.9926 18.9391 25.8372 26.0277C25.5704 26.335 25.7405 26.8227 26.1463 26.8525C30.0957 27.1423 34.1279 25.6306 36.9238 22.4108C41.6308 16.9901 41.0518 8.78039 35.6304 4.07382C32.4102 1.27826 28.2057 0.347406 24.3361 1.18855Z" fill="#186560"/>
                  </svg>
                  <span className="fw-bold text-white" style={{ fontSize: '24px', lineHeight: '29px', letterSpacing: '0.5px' }}>PhinAccords</span>
                </Link>
              </div>

              <div className="right-widget ms-auto ms-lg-0 me-3 me-lg-0 order-lg-3">
                <ul className="d-flex align-items-center style-none">
                  <li className="d-none d-md-block">
                    <Link href="/contact" className="btn-one tran3s">
                      Get in Touch
                    </Link>
                  </li>
                </ul>
              </div>
              <nav className="navbar navbar-expand-lg p0 order-lg-2">
                <button
                  className="navbar-toggler d-block d-lg-none"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                  aria-controls="navbarNav"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  {/* header navbar start */}
                  <Navbar logo_white={true} />
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

export default HeaderTwo;
