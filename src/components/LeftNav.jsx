import React, { useState,useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Category, Logout,EmailIcon, EmployeeIcon, DocomentIcon,Dashboard, ProjectIcon,QuestionIcon, FixedPrice } from "./svg-icons/icons";
import "../Nav.css";
import { Menuicon } from '../components/svg-icons/icons';

export default function LeftNav({isMenuOpen,setIsMenuOpen}) {

  const user = useSelector((state) => state.auth.user);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  useEffect(() => {
    if (user?.organization?.name && user?.role != "admin") {
      document.title = "LOOP3D - " + user?.organization?.name;  

    } else {
      document.title = "LOOP3D - Admin";  
    }
  }, [user]);
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
              Global  Competencies
            </NavLink>
          </li>
          <li className="sideNavItem">
            <NavLink to="/questions">
              <QuestionIcon />
              Open Ended Questions
            </NavLink>
          </li>
          {/* <li className="sideNavItem">
            <NavLink to="/plans">
              <FixedPrice />
              Plans
            </NavLink>
          </li> */}
          {/* <li className="sideNavItem">
            <NavLink to="/emails">
              <EmailIcon />
              Emails
            </NavLink>
          </li> */}
        </> :
       user.role =="manager"?  <>
          <li className={`sideNavItem`}>
          <NavLink
            to="/manager/dashboard"
            className={({ isActive }) => (isActive ? 'active' : '')}
            >
            <Dashboard />
           Dashboard
              </NavLink>
            </li>
            <li className={`sideNavItem`}>
          <NavLink
            to="/manager/loop-leads"
            className={({ isActive }) => (isActive ? 'active' : '')}
            >
            <EmployeeIcon />
            LOOP3D Leads
          </NavLink>
            </li>
            {/* <li className={`sideNavItem`}>
          <NavLink
            to="/manager/Chat-bot"
            className={({ isActive }) => (isActive ? 'active' : '')}
            >
            <DocomentIcon />
          ChatGpt
          </NavLink>
            </li> */}
            
            {/* <li className={`sideNavItem`}>
          <NavLink
            to="/survey-summary"
            className={({ isActive }) => (isActive ? 'active' : '')}
            >
            <DocomentIcon />
          Summary
          </NavLink>
          </li> */}
          </>
            : <li className={`sideNavItem`}>
          <NavLink
            to="/loop-lead/dashboard"
            className={({ isActive }) => (isActive ? 'active' : '')}
            >
            <Dashboard />
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

