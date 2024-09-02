import React, { useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AuthLayout from "../../layout/Auth";
import ViewLoopLead from "./ViewLoopLead"
import SurveyList from "./SurveyList"
import { Button } from 'react-bootstrap';

export default function LoopleadTabs() {
  const navigate = useNavigate();

  const { userId, orgId } = useParams();

  return (
    <AuthLayout title={"Loop lead details"}>
      <div className="profile-btns">
        <Button className="default-btn cancel-btn" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Tabs
        defaultActiveKey="home"
        id="uncontrolled-tab-example"
        className="mb-3 mt-5 custom-tabs"
      >
        <Tab eventKey="home" title="Overview">
          <ViewLoopLead user_id={userId} org_id={orgId} />
        </Tab>
        <Tab eventKey="profile" title="Survey">
          <SurveyList loop_lead_id={userId} org_id={orgId} />
        </Tab>
      </Tabs>
    </AuthLayout>
  )
}


