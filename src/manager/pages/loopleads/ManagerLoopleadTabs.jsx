import React, { useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AuthLayout from "../../../layout/Auth";
import ViewLoopLead from "./ViewLoopLead"
import SurveyList from "./SurveyList"
import { Button } from 'react-bootstrap';

export default function ManagerLoopleadTabs() {
  const navigate = useNavigate();

  const { userId, orgId } = useParams();

  return (
    <AuthLayout title={"Loop lead details"}>
          <div className='table-inner main-wrapper pd-2  '>
            <div className="main-back-heading mb-0">
      <div className="container">
         <div className="row">
            <div className="col-md-6 p-0">
            <div className="profile-btns pt-0">
                <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>                  
            </div>
         </div>
      </div>
   </div>
   <div className='ml-8'>
      <Tabs
        defaultActiveKey="home"
        id="uncontrolled-tab-example"
        className=" custom-tabs"
      >
        <Tab eventKey="home" title="Overview">
          <ViewLoopLead user_id={userId} org_id={orgId} />
        </Tab>
        <Tab eventKey="profile" title="Survey">
          <SurveyList loop_lead_id={userId} org_id={orgId} />
        </Tab>
        </Tabs>
    </div>
    </div>
    </AuthLayout>
  )
}


