import LeftNav from '../components/LeftNav';
import HeaderDashboard from '../components/HeaderDashboard'
import React, { useState } from "react";

export default function AuthLayout({ children, title, subTitle }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className='wrapper-outer d-flex'>
      <div className={`side-nav ${isMenuOpen ? "sidenavMobile" : ""}`}>
        <LeftNav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>
      <div className='main-content'>
        <HeaderDashboard title={title} subTitle={subTitle} />
        {children}
      </div>
    </div>
  );
}
