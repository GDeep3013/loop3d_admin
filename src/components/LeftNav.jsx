import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Category, MenuIcon, Technology, Job, FixedPrice, Logout, EmployeeIcon, DocomentIcon, ProjectIcon } from "./svg-icons/icons";
import "../Nav.css";
// import { useSelector, useDispatch } from "react-redux";
import { selectUserType } from "../../store/slices/UserSlice"
import { Accordion, InputGroup, Form, Button } from 'react-bootstrap';

import { selectFilterValue, setFilterValue } from '../../store/slices/DashboardSlice'
import { useSelector, useDispatch } from 'react-redux';
export default function LeftNav() {

  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  
  const dispatch = useDispatch();
  const handleFilterChange = (newValue) => {
    dispatch(setFilterValue(newValue));
  };


  const location = useLocation();

  const userType = localStorage.getItem('userType');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const isActive = () => {
    return location.pathname === '/projects' || location.pathname === '/add-surveys';
  }

  // const applyFilters = () => {
  //   onFilterChange(selectedOptions);
  // };

  const techonolgyOption = [

    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'Figma', label: 'Figma' },
    { value: 'Wordpress', label: 'Wordpress' },
    { value: 'Php', label: 'Php' },
    { value: 'Shopify', label: 'Shopify' },
  ];

  const priceOption = [
    { value: '', label: 'All' },
    { value: '<100', label: 'Less than $100' },
    { value: '100-500', label: '$100 to $500' },
    { value: '500-1000', label: '$500 to $1k' },
    { value: '1000-5000', label: '$1k to $5k' },
    { value: '5000+', label: '$5k+' },
  ];


  const handleCheckboxChange = (option, index) => {

    setSelectedTechnology(prevSelectedTechnology => {
      const index = prevSelectedTechnology.indexOf(option);
      if (index === -1) {
        const updatedTechnology = [...prevSelectedTechnology, option];
        handleFilterChange({ technology: updatedTechnology, price: selectedPrice });
        return updatedTechnology;
      } else {
        const updatedTechnology = prevSelectedTechnology.filter(item => item !== option);
        handleFilterChange({ technology: updatedTechnology, price: selectedPrice });
        return updatedTechnology;
      }
    });
    // handleFilterChange({ technology: selectedTechnology, price: selectedPrice });
  };

  const handleRadioChange = (value) => {
    setSelectedPrice(value);
    handleFilterChange({ technology: selectedTechnology, price: value });
  };

  return (
    <nav className={`sideNavOuter ${isMenuOpen ? "open" : ""}`}>

      <div className="sideNavLogo">
        <button onClick={toggleMenu} className="toggleMenu"> <MenuIcon /> </button>
        <img src="/images/logoheader.svg" alt="Logo" />
    
        <hr className="sideBorder" />
      </div>
      <ul className="sideNavList">
        <>
          <li className={`sideNavItem`}>
            <NavLink
              to="/organizations"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <DocomentIcon />
              Organizations
            </NavLink>
          </li>

          <li className={`sideNavItem ${isUsersOpen?'active-inner':'' }`}>
            <NavLink 
            to="/users"
            className={({ isActive }) => (isActive ? 'active' : '')} 
            >
              <EmployeeIcon />
              Users
              <span>
                {!isUsersOpen?<img src='/images/down-arrow.svg'/>:<img src='/images/arrow-up.svg'/>}
              </span>
            </NavLink>
          </li>
          {isUsersOpen && (
            <div className="sub-outer">
              <li className="subNavItem">
                <NavLink 
                to="/add-user"
                className={({ isActive }) => (isActive ? 'active-user' : '')}
                >
                  Add User
                </NavLink>
              </li>
              <li className="subNavItem">
                <NavLink 
                to="/users" 
                className={({ isActive }) => (isActive ? 'active-user' : '')}
                >
                  All Users
                </NavLink>
              </li>
            </div>
          )}
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
        </>
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

