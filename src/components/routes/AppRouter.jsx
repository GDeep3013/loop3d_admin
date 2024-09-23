import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createUser } from "../../../store/slices/UserSlice";
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
import QuestionDetail from "../../admin/pages/questions/QuestionDetail";
import { getUser } from "../../apis/UserApi";
import ForgetPassword from "../../pages/ForgetPassword";
import ResetPassword from "../../pages/ResetPassword";
import Organization from "../../admin/pages/organizations/Organization";
import ViewOrganization from "../../admin/pages/organizations/ViewOrganization";
import OrganizationTabs from "../../admin/pages/organizations/OrganizationTabs";
import LoopleadTabs from "../../admin/pages/loopleads/LoopleadTabs";
import SurveyParticipantDetails from "../../admin/pages/loopleads/SurveyParticipantDetails";
import QuestionTabs from "../../admin/pages/questions/QuestionTabs";
import CreateQuestion from "../../admin/pages/questions/CreateQuestion";
import Survey from "../../admin/pages/surveys/survey";
import EmailList from "../../admin/pages/emails/EmailList";
import CreateEmail from "../../admin/pages/emails/CreateEmail";
import ViewEmail from "../../admin/pages/emails/ViewEmail";
import SurveyList from "../../manager/pages/surveys/SurveyList";
import CreateSurvey from "../../manager/pages/surveys/CreateSurvey";
import LoopLeadDashboard from "../../LoopLead/pages/LoopLeadDashboard";
import CreateParticipants from "../../LoopLead/pages/CreateParticipants";
import LoopLeads from "../../manager/pages/loopleads/LoopLeads";
import ManagerLoopleadTabs from "../../manager/pages/loopleads/ManagerLoopleadTabs";
import ChatGPTPage from "../../manager/ChatGPTPage";
import Plans from "../../admin/pages/plan/Plans";
import LoopLeadSurveyParticipantDetails from "../../LoopLead/pages/LoopLeadSurveyParticipantDetails";
import SurveySummary from "../../components/survey-summary/SurveySummary";
import CreateFrom from "../../admin/pages/organizations/CreateFrom"
import Loading from "../../components/Loading";

const AppRouter = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); // New state for loading spinner

  useEffect(() => {
    (async () => {
      try {
        const _token = localStorage.getItem("_token");
        if (_token && !user) {
          let fetchedUser = await getUser(_token, true);
          dispatch(createUser({ user: fetchedUser }));
        }
      } catch (error) {
        console.error("Error validating token:", error);
      } finally {
        setLoading(false); // Stop loading after the user check is completed
      }
    })();
  }, [navigate, user, dispatch]);

  const loadingPage = async () => {
    const currentUrl = window.location.pathname;
    if (!user && currentUrl !== '/login' && currentUrl !== '/forget-password' && currentUrl !== '/reset-password') {
      navigate('/login'); // Redirect to login if not authenticated
    } else if (user && (currentUrl === '/' || currentUrl === '/login')) {
      // Redirect based on user role after login
      if (user.role === "admin") {
        navigate('/organizations');
      } else if (user.role === "manager") {
        navigate('/manager/dashboard');
      } else if (user.role === "looped_lead") {
        navigate('/loop-lead/dashboard');
      }
    }
  };

  useEffect(() => {
    loadingPage();
  }, [navigate, user]);

  if (loading) {
    // Display a loading spinner or message while loading
    return <Loading parentClas="page-loader d-flex justify-content-center align-items-center vh-100" />;
  }

  return (
    <Routes>
      {user ? (
        <>
          {/* Authenticated Routes */}
          <Route path="/organizations" exact element={<Organization />} />
          <Route path="/organizations/create" exact element={<CreateFrom />} />
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
          <Route path="/manager/dashboard" exact element={<SurveyList />} />
          <Route path="/manager/surveys/create" exact element={<CreateSurvey />} />
          <Route path="/manager/loop-leads" exact element={<LoopLeads />} />
          <Route path="/manager/view-loop_lead/:userId/:orgId" exact element={<ManagerLoopleadTabs />} />
          <Route path="/manager/chat-bot" exact element={<ChatGPTPage />} />
          <Route path="/loop-lead/dashboard" exact element={<LoopLeadDashboard />} />
          <Route path="/loop-lead/participant/create/:id" exact element={<CreateParticipants />} />
          <Route path="/loop-lead/view-survey-participant/:id" exact element={<LoopLeadSurveyParticipantDetails />} />
          <Route path="/survey-summary/:id" exact element={<SurveySummary />} />
          <Route path="/survey-summary" exact element={<SurveySummary />} />
          <Route path="/plans/:id" exact element={<Plans />} />
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
