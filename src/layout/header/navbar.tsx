'use client'
import React from "react";
import Link from "next/link";
import Image from "next/image";
// internal
import icon_1 from "@/assets/images/icon/icon_14.svg";
import icon_2 from "@/assets/images/icon/icon_15.svg";
import menu_data from "@/data/menu-data";
import { usePathname } from "next/navigation";

const Navbar = ({logo_white=false}:{logo_white?:boolean}) => {
  const pathname = usePathname()
  return (
    <ul className="navbar-nav align-items-lg-center">
      <li className="d-block d-lg-none">
        <div className="logo">
          <Link href="/" className="d-flex align-items-center">
            <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
              {logo_white ? (
                <>
                  <path d="M3.52284 6.36735C-1.18425 11.7888 -0.605111 19.9994 4.81623 24.7064C10.2376 29.4135 18.4482 28.8344 23.1552 23.413C27.8623 17.9916 27.2833 9.78105 21.8619 5.07396C16.4405 0.366943 8.22992 0.945938 3.52284 6.36735Z" fill="#196164"/>
                  <path d="M24.6751 1.19349C24.2774 1.27996 24.1775 1.78681 24.4848 2.05364C31.5742 8.20893 32.3315 18.946 26.1762 26.0354C25.9093 26.3427 26.0794 26.8305 26.4853 26.8603C30.4346 27.1501 34.4669 25.6383 37.2627 22.4181C41.9698 16.9968 41.3908 8.78616 35.9693 4.07908C32.7492 1.2832 28.5447 0.352249 24.6751 1.19349Z" fill="#C4F500"/>
                </>
              ) : (
                <>
                  <path d="M3.18388 6.36186C-1.52321 11.7827 -0.944074 19.9924 4.47727 24.6989C9.89868 29.4054 18.1092 28.8264 22.8163 23.4056C27.5234 17.9848 26.9443 9.77518 21.5229 5.06861C16.1016 0.362111 7.89096 0.941042 3.18388 6.36186Z" fill="#FFDB1E"/>
                  <path d="M24.3361 1.18855C23.9384 1.27502 23.8386 1.7818 24.1459 2.0486C31.2353 8.20322 31.9926 18.9391 25.8372 26.0277C25.5704 26.335 25.7405 26.8227 26.1463 26.8525C30.0957 27.1423 34.1279 25.6306 36.9238 22.4108C41.6308 16.9901 41.0518 8.78039 35.6304 4.07382C32.4102 1.27826 28.2057 0.347406 24.3361 1.18855Z" fill="#186560"/>
                </>
              )}
            </svg>
            <span className={`fw-bold ${logo_white ? 'text-white' : ''}`} style={{ fontSize: '24px', lineHeight: '29px', letterSpacing: '0.5px' }}>PhinAccords</span>
          </Link>
        </div>
      </li>
      {menu_data.map((menu) => (
        <li
          key={menu.id}
          className={`nav-item ${menu.dropdown ? "dropdown" : ""} ${
            menu.mega_menu ? "dropdown mega-dropdown-sm" : ""
          }`}
        >
          {menu.dropdown && (
            <>
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                {menu.title}
              </a>
              <ul className="dropdown-menu">
                {menu.dropdown_menus?.map((dm, i) => (
                  <li key={i}>
                    <Link href={dm.link} className={`dropdown-item ${pathname === dm.link?'active':''}`}>
                      <span>{dm.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {menu.mega_menu && (
            <>
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                {menu.title}
              </a>
              <ul className="dropdown-menu">
                <li className="row gx-1">
                  {menu.mega_menus?.map((mm, i) => (
                    <div key={mm.id} className="col-lg-4">
                      <div className="menu-column">
                        <ul className="style-none mega-dropdown-list">
                          {mm.menus.map((sm, i) => (
                            <li key={i}>
                              <Link href={sm.link} className={`dropdown-item ${pathname === sm.link?'active':''}`}>
                                <span>{sm.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </li>
              </ul>
            </>
          )}
          {!menu.dropdown && !menu.mega_menu && (
            <Link className="nav-link" href={menu.link} role="button">
              {menu.title}
            </Link>
          )}
        </li>
      ))}
      <li className="d-md-none ps-2 pe-2">
        <a
          href="#"
          data-bs-toggle="modal"
          data-bs-target="#loginModal"
          className="signup-btn-one icon-link w-100 mt-20"
        >
          <span className="flex-fill text-center">Signup</span>
          <div className="icon rounded-circle d-flex align-items-center justify-content-center">
            <i className="bi bi-arrow-right"></i>
          </div>
        </a>
        <ul className="style-none contact-info m0 pt-30">
          <li className="d-flex align-items-center p0 mt-15">
            <Image src={icon_1} alt="icon" className="lazy-img icon me-2" />
            <Link href="mailto:babuninc@company.com" className="fw-500">
              babuninc@company.com
            </Link>
          </li>
          <li className="d-flex align-items-center p0 mt-15">
            <Image src={icon_2} alt="icon" className="lazy-img icon me-2" />
            <Link href="tel:+757 699-4478" className="fw-500">
              +757 699-4478
            </Link>
          </li>
        </ul>
      </li>
    </ul>
  );
};

export default Navbar;
