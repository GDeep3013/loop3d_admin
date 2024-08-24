import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, } from "../../../store/slices/UserSlice";
import { setTokenValidity, selectUserType } from "../../../store/slices/UserSlice"

import Dashboard from "../../pages/Dashboard";
import Home from "../../pages/Home";
import ProjectOverview from "../../pages/ProjectOverview";
import Login from "../../pages/Login";
import AdminDashboard from "../../admin/AdminDashboard";
import Employees from "../../admin/Users";
import AddEmployee from "../../admin/AddUser";
import Projects from "../../admin/Projects";
import AddProject from "../../admin/AddSurvey";
import Category from "../Category";
import AddCategory from "../../admin/AddCategory";
import ForgetPassword from "../../pages/ForgetPassword";
import ResetPassword from "../../pages/ResetPassword";

import Organization from "../../pages/organizations/Organization";

const AppRouter = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userType = localStorage.getItem('userType');
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      const userData1 = JSON.parse(userData);

      if (userData && userData1.token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error validating token:", error);
    }
  }, [navigate]);

  useEffect(() => {
    const currentUrl = window.location.pathname;
    if (!isAuthenticated && currentUrl !== '/login') {
      navigate('/login');
    } else if (isAuthenticated && (currentUrl === '/' || currentUrl === '/login')) {
      userType === "Admin" ? navigate('/users') : navigate('/dashboard');
    }
  }, [isAuthenticated]);

  return (
    <Routes>

      {isAuthenticated ? (
        <>
          <Route path="/dashboard" exact element={<Organization />} />
          <Route path="/project-overview/:id" exact element={<ProjectOverview />} />
          <Route path="/home" exact element={<Home />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/admin-dashboard" exact element={<AdminDashboard />} />
          <Route path="/users" exact element={<Employees />} />
          <Route path="/add-user" exact element={<AddEmployee />} />
          <Route path="/add-user/:id" exact element={<AddEmployee />} />
          <Route path="/projects" exact element={<Projects />} />
          <Route path="/add-surveys" exact element={<AddProject />} />
          <Route path="/add-surveys/:id" exact element={<AddProject />} />
          <Route path="/category" exact element={<Category />} />
          <Route path="/add-category" exact element={<AddCategory />} />
          <Route path="/add-category/:id" exact element={<AddCategory />} />
        </>

      ) : (
        <>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </>
      )}

    </Routes>
  )

};

export default AppRouter;
