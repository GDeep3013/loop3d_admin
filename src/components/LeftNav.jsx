import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Category, Logout,EmailIcon, EmployeeIcon, DocomentIcon, ProjectIcon,QuestionIcon } from "./svg-icons/icons";
import "../Nav.css";
import { Menuicon } from '../components/svg-icons/icons';

export default function LeftNav({isMenuOpen,setIsMenuOpen}) {

  const user = useSelector((state) => state.auth.user);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };



  return (
    <nav className={`sideNavOuter ${isMenuOpen ? "open" : ""}`}>

      <div className="sideNavLogo">
        <button onClick={toggleMenu} className="toggleMenu MenuOpen" ><Menuicon /></button>
        <img src="/images/logoheader.svg" alt="Logo" />
    
        <hr className="sideBorder" />
      </div>
      <ul className="sideNavList">
        {user.role =="admin"?<>
          <li className={`sideNavItem`}>
            <NavLink
              to="/organizations"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <DocomentIcon />
              Organizations
            </NavLink>
          </li>

          <li className={`sideNavItem`}>
            <NavLink
              to="/users"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <EmployeeIcon />
              Users
            </NavLink>
          </li>

          <li className="sideNavItem">
            <NavLink
              to="/surveys"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <ProjectIcon />
              Surveys
            </NavLink>

          </li>
          <li className="sideNavItem">
            <NavLink to="/competencies">
              <Category />
              Competencies
            </NavLink>
          </li>
          <li className="sideNavItem">
            <NavLink to="/questions">
              <QuestionIcon />
              Questions
            </NavLink>
          </li>
          <li className="sideNavItem">
            <NavLink to="/emails">
              <EmailIcon />
              Emails
            </NavLink>
          </li>
        </> :
          <li className={`sideNavItem`}>
          <NavLink
            to="/manager/dashboard"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <DocomentIcon />
           Dashboard
          </NavLink>
        </li>
        }
        <li className="sideNavItem LogoutMenu">
          <NavLink to="#" className="dropdown-item" onClick={() => {
            localStorage.removeItem("_token");
            localStorage.removeItem("userType");
            navigate('/login');
          }}><Logout /> Logout</NavLink>         
        </li>
      </ul>
      
    </nav>
  );
}

