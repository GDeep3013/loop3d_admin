import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {  createUser } from "../../../store/slices/UserSlice";


import Dashboard from "../../pages/Dashboard";
import Home from "../../pages/Home";
import ProjectOverview from "../../pages/ProjectOverview";
import Login from "../../pages/Login";
import AdminDashboard from "../../admin/AdminDashboard";
import Employees from "../../admin/pages/users/Users";
import AddEmployee from "../../admin/pages/users/AddUser";
import Projects from "../../admin/Projects";
import AddProject from "../../admin/AddSurvey";

import Category from "../../admin/pages/categories/Category";
import AddCategory from "../../admin/pages/categories/AddCategory";

import Question from "../../admin/pages/questions/Question";
import AddQuestion from "../../admin/pages/questions/AddQuestion";
import QuestionDetail from "../../admin/pages/questions/QuestionDetail";




import { getUser } from "../../apis/UserApi";

import ForgetPassword from "../../pages/ForgetPassword";
import ResetPassword from "../../pages/ResetPassword";

import Organization from "../../admin/pages/organizations/Organization";
import ViewOrganization from "../../admin/pages/organizations/ViewOrganization";
//import AssignCompetencies from "../../pages/organizations/AssignCompetencies";

import OrganizationTabs from "../../admin/pages/organizations/OrganizationTabs"
import CommingSoon from "../../pages/CommingSoon";

import LoopleadTabs from "../../admin/pages/loopleads/LoopleadTabs"
import SurveyParticipantDetails from "../../admin/pages/loopleads/SurveyParticipantDetails"

import QuestionTabs from "../../admin/pages/questions/QuestionTabs";
import CreateQuestion from "../../admin/pages/questions/CreateQuestion";
import Survey from "../../admin/pages/surveys/survey";
import EmailList from "../../admin/pages/emails/EmailList";
import CreateEmail from "../../admin/pages/emails/CreateEmail";
import ViewEmail from "../../admin/pages/emails/ViewEmail";
import SurveyList from "../../manager/pages/surveys/SurveyList";
import CreateSurvey from "../../manager/pages/surveys/CreateSurvey";

const AppRouter = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // IIFE (Immediately Invoked Function Expression) for async operation
    (async () => {
      try {
        const _token = localStorage.getItem("_token");
        if (_token && !user) {
          let fetchedUser = await getUser(_token, true);
          dispatch(createUser({ user: fetchedUser }));
        }
      } catch (error) {
        console.error("Error validating token:", error);
      }
    })();
  }, [navigate, user]);


  useEffect(() => {


    const currentUrl = window.location.pathname;

    if (!user && currentUrl !== '/login' && currentUrl !== '/forget-password' && currentUrl !== '/reset-password') {
      navigate('/login'); // Redirect to login if not authenticated
    }else if (user && (currentUrl === '/' || currentUrl === '/login')) {
      // Redirect based on userType after login
      if (user.role === "admin") {
        navigate('/organizations');
      }
      // else {
      //   navigate('/organizations');
      // }
    }

  }, [navigate, user]);

  console.log('user',user)

  return (
    <Routes>
      {user ? (
        <>
          {/* Authenticated Routes */}
          <Route path="/organizations" exact element={<Organization />} />
          <Route path="/organizations/create" exact element={<OrganizationTabs />} />
          <Route path="/organizations/edit/:id" exact element={<OrganizationTabs />} />
          <Route path="/organizations/view/:id" exact element={<ViewOrganization />} />

          <Route path="/project-overview/:id" exact element={<ProjectOverview />} />
          <Route path="/home" exact element={<Home />} />
          <Route path="/admin-dashboard" exact element={<AdminDashboard />} />
          <Route path="/users" exact element={<Employees />} />
          <Route path="/add-user" exact element={<AddEmployee />} />
          <Route path="/add-user/:id" exact element={<AddEmployee />} />
          <Route path="/projects" exact element={<Projects />} />
          <Route path="/add-surveys" exact element={<AddProject />} />
          <Route path="/add-surveys/:id" exact element={<AddProject />} />
          <Route path="/competencies" exact element={<Category />} />
          <Route path="/competencies/create" exact element={<AddCategory />} />
          <Route path="/competencies/:id" exact element={<AddCategory />} />
          <Route path="/surveys" exact element={<Survey />} />
          <Route path="/questions" exact element={<Question />} />
          <Route path="/questions/create" exact element={<CreateQuestion />} />
          <Route path="/questions/:id" exact element={<QuestionTabs />} />
          <Route path="/questions/detail/:questionId" exact element={<QuestionDetail />} />
          <Route path="/view-loop_lead/:userId/:orgId" exact element={<LoopleadTabs />} />
          <Route path="/view-survey-participant/:id" exact element={<SurveyParticipantDetails />} />
          <Route path="/emails" exact element={<EmailList />} />
          <Route path="/emails/create" exact element={<CreateEmail />} />
          <Route path="/emails/:id" exact element={<CreateEmail />} />
          <Route path="/emails/detail/:id" exact element={<ViewEmail />} />

          {/* <Route path="/manager/dashboard" exact element={<SurveyList />} />
          <Route path="/manager/surveys/create" exact element={<CreateSurvey />} /> */}








        </>
      ) : (
        <>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </>
      )}
    </Routes>
  );
};

export default AppRouter;